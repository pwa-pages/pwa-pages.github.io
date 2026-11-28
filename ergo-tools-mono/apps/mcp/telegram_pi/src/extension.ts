import { readFileSync } from "node:fs";
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { AbortController as TelegramAbortController } from "abort-controller";
import { createTelegramBot, type TelegramRequest } from "./bot.js";
import { runIsolatedRequest } from "./run-request.js";
import { logError } from "./safe-log.js";
import { RequestQueue } from "./request-queue.js";
import { createRosenTransport } from "./mcp-transport.js";

const instructions = readFileSync(new URL("./telegram.md", import.meta.url), "utf8");

function positiveInteger(name: string, fallback: number, max: number): number {
  const value = process.env[name];
  if (value === undefined) return fallback;
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) > max) {
    throw new Error(`[telegram] Invalid ${name}`);
  }
  return Number(value);
}

export default function telegramExtension(pi: ExtensionAPI) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  const timeoutMs = positiveInteger("TELEGRAM_REQUEST_TIMEOUT_MS", 90_000, 600_000);
  const rateLimitMs = positiveInteger("TELEGRAM_USER_RATE_LIMIT_MS", 10_000, 3_600_000);
  const maxToolCalls = positiveInteger("TELEGRAM_MAX_TOOL_CALLS", 6, 30);
  let context: ExtensionContext | undefined;
  const queue = new RequestQueue(timeoutMs, rateLimitMs, (request, signal) => {
    if (!context) throw new Error("Telegram session is not ready");
    return runRequest(request, context, signal);
  }, reply);
  const bot = createTelegramBot(token, (request) => queue.enqueue(request));

  async function reply(request: TelegramRequest, text: string) {
    const controller = new TelegramAbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    try {
      for (const chunk of text.match(/[\s\S]{1,4000}/g) ?? []) {
        await bot.api.sendMessage(request.chatId, chunk, {
          reply_parameters: {
            message_id: request.messageId,
            allow_sending_without_reply: true,
          },
        }, controller.signal);
      }
    } finally {
      clearTimeout(timer);
    }
  }

  function runRequest(request: TelegramRequest, ctx: ExtensionContext, signal: AbortSignal) {
    const client = new Client({ name: "rosen-radar-telegram", version: "1.0.0" });
    return runIsolatedRequest({
      text: request.text,
      model: ctx.model,
      modelRegistry: ctx.modelRegistry,
      instructions,
      maxToolCalls,
      signal,
      mcp: {
        connect: () => client.connect(createRosenTransport(ctx.cwd)),
        callTool: (name, params, toolSignal) =>
          client.callTool({ name, arguments: params }, undefined, { signal: toolSignal }),
        close: () => client.close(),
      },
    });
  }

  pi.on("session_start", async (_event, ctx) => {
    context = ctx;
    queue.resume();
    if (bot.isRunning()) return;
    try {
      await bot.init();
      void bot.start().catch((error) => logError("Polling failed", error));
    } catch (error) {
      logError("Startup failed", error);
    }
  });

  pi.on("session_shutdown", async () => {
    queue.shutdown();
    context = undefined;
    if (bot.isRunning()) await bot.stop();
  });
}
