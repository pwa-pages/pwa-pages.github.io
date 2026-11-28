import { readFileSync } from "node:fs";
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createTelegramBot, type TelegramRequest } from "./bot.js";
import { approvedTools, validateToolCall } from "./security.js";
import { createRosenTransport } from "./mcp-transport.js";
import { logError } from "./safe-log.js";

const instructions = readFileSync(new URL("./telegram.md", import.meta.url), "utf8");

function assistantReply(messages: readonly unknown[]): string {
  const last = messages.filter((message) =>
    typeof message === "object" && message !== null
    && (message as { role?: unknown }).role === "assistant",
  ).at(-1) as { stopReason?: unknown; content?: unknown } | undefined;

  if (!last || last.stopReason !== "stop" || !Array.isArray(last.content)) {
    throw new Error("Pi did not complete the Telegram request");
  }

  const text = last.content
    .filter((part): part is { type: "text"; text: string } =>
      typeof part === "object" && part !== null
      && (part as { type?: unknown }).type === "text"
      && typeof (part as { text?: unknown }).text === "string",
    )
    .map((part) => part.text)
    .join("\n")
    .trim();

  return text || "Pi returned no text.";
}

export default function telegramExtension(pi: ExtensionAPI) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  const client = new Client({ name: "rosen-radar-telegram", version: "1.0.0" });
  let context: ExtensionContext | undefined;
  let connected = false;
  let finishRequest: ((text: string) => void) | undefined;
  let failRequest: ((error: Error) => void) | undefined;

  for (const tool of approvedTools) {
    pi.registerTool({
      ...tool,
      label: tool.name,
      async execute(_id, params, signal) {
        if (!validateToolCall(tool.name, params)) throw new Error("Invalid tool parameters");
        const result: unknown = await client.callTool(
          { name: tool.name, arguments: params },
          undefined,
          { signal },
        );
        if (typeof result !== "object" || result === null) {
          throw new Error("Invalid statistics tool response");
        }
        const response = result as { isError?: unknown; content?: unknown };
        if (response.isError) throw new Error("Statistics tool failed");
        if (!Array.isArray(response.content)) throw new Error("Invalid statistics tool response");
        const text = response.content
          .filter((item): item is { type: "text"; text: string } =>
            typeof item === "object" && item !== null
            && (item as { type?: unknown }).type === "text"
            && typeof (item as { text?: unknown }).text === "string",
          )
          .map((item) => item.text)
          .join("\n");
        if (!text || text.length > 100_000) throw new Error("Invalid statistics tool response");
        return { content: [{ type: "text", text }], details: {} };
      },
    });
  }

  const bot = createTelegramBot(token, async (request) => {
    if (!context || !connected) throw new Error("Telegram session is not ready");
    if (!context.isIdle() || finishRequest) {
      await reply(request, "Pi is busy. Please try again later.");
      return;
    }

    const response = new Promise<string>((resolve, reject) => {
      finishRequest = resolve;
      failRequest = reject;
    });

    try {
      pi.sendUserMessage(
        `${instructions}\n\nTelegram request:\n${request.text}`,
      );
      await reply(request, await response);
    } catch (error) {
      finishRequest = undefined;
      failRequest = undefined;
      throw error;
    }
  });

  async function reply(request: TelegramRequest, text: string) {
    const characters = Array.from(text);
    const message = characters.length > 4000
      ? `${characters.slice(0, 3997).join("")}...`
      : text;
    await bot.api.sendMessage(request.chatId, message, {
      reply_parameters: {
        message_id: request.messageId,
        allow_sending_without_reply: true,
      },
    });
  }

  pi.on("agent_end", (event) => {
    if (!finishRequest) return;

    const finish = finishRequest;
    const fail = failRequest;
    finishRequest = undefined;
    failRequest = undefined;

    try {
      finish(assistantReply(event.messages));
    } catch (error) {
      fail?.(error instanceof Error ? error : new Error("Pi request failed"));
    }
  });

  pi.on("session_start", async (_event, ctx) => {
    context = ctx;
    try {
      if (!connected) {
        await client.connect(createRosenTransport(ctx.cwd));
        connected = true;
      }
      if (bot.isRunning()) return;
      await bot.init();
      void bot.start().catch((error) => logError("Polling failed", error));
    } catch (error) {
      logError("Startup failed", error);
    }
  });

  pi.on("session_shutdown", async () => {
    context = undefined;
    const fail = failRequest;
    finishRequest = undefined;
    failRequest = undefined;
    fail?.(new Error("Pi session shut down"));
    if (connected) await client.close();
    connected = false;
    if (bot.isRunning()) await bot.stop();
  });
}
