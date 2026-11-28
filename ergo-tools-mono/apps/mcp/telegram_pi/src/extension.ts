import { readFileSync } from "node:fs";
import {
  createAgentSession,
  DefaultResourceLoader,
  getAgentDir,
  SessionManager,
  type AgentSession,
  type ExtensionAPI,
  type ExtensionContext,
} from "@mariozechner/pi-coding-agent";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { AbortController as TelegramAbortController } from "abort-controller";
import { createTelegramBot, type TelegramRequest } from "./bot.js";
import { approvedTools, registerTelegramSecurity, validateToolCall } from "./security.js";
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
  if (!token) {
    console.error("[telegram] Missing TELEGRAM_BOT_TOKEN");
    return;
  }

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

  async function runRequest(request: TelegramRequest, ctx: ExtensionContext, signal: AbortSignal) {
    const client = new Client({ name: "rosen-radar-telegram", version: "1.0.0" });
    let session: AgentSession | undefined;
    let security: ReturnType<typeof registerTelegramSecurity> | undefined;
    const abort = () => {
      if (session) void session.abort().catch(() => {});
      void client.close().catch(() => {});
    };
    signal.addEventListener("abort", abort, { once: true });

    try {
      const loader = new DefaultResourceLoader({
        cwd: "/",
        agentDir: getAgentDir(),
        noExtensions: true,
        noSkills: true,
        noPromptTemplates: true,
        noThemes: true,
        noContextFiles: true,
        systemPrompt: "You are a helpful assistant.",
        appendSystemPrompt: [],
        extensionFactories: [(isolatedPi) => {
          security = registerTelegramSecurity(isolatedPi, instructions, maxToolCalls);
          for (const tool of approvedTools) {
            isolatedPi.registerTool({
              ...tool,
              label: tool.name,
              execute: async (_id, params, toolSignal) => {
                if (!validateToolCall(tool.name, params)) throw new Error("Invalid tool parameters");
                try {
                  const result = await client.callTool(
                    { name: tool.name, arguments: params },
                    undefined,
                    { signal: toolSignal },
                  );
                  if (result.isError) throw new Error("MCP tool failed");
                  if (!Array.isArray(result.content)) throw new Error("Invalid MCP response");
                  const text = result.content
                    .filter((item): item is { type: "text"; text: string } =>
                      typeof item === "object" && item !== null
                      && item.type === "text" && typeof item.text === "string")
                    .map((item) => item.text)
                    .join("\n");
                  if (!text || text.length > 100_000) throw new Error("Invalid MCP response");
                  return { content: [{ type: "text", text }], details: {} };
                } catch {
                  return { content: [{ type: "text", text: "Statistics are temporarily unavailable." }], details: {} };
                }
              },
            });
          }
        }],
      });
      await loader.reload();
      if (loader.getExtensions().errors.length) throw new Error("Failed to load Telegram security extension");
      if (!security) throw new Error("Telegram security extension is unavailable");
      const requestSecurity = security;
      signal.throwIfAborted();
      const created = await createAgentSession({
        cwd: "/",
        model: ctx.model,
        modelRegistry: ctx.modelRegistry,
        sessionManager: SessionManager.inMemory("/"),
        resourceLoader: loader,
        tools: approvedTools.map((tool) => tool.name),
      });
      session = created.session;
      session.agent.subscribe((event) => {
        if (event.type === "tool_execution_start" && requestSecurity.observeAttempt()) {
          session?.agent.abort();
        }
      });
      signal.throwIfAborted();
      await session.bindExtensions({});
      signal.throwIfAborted();
      await client.connect(createRosenTransport(ctx.cwd));
      signal.throwIfAborted();
      await session.prompt(request.text, { expandPromptTemplates: false, source: "extension" });
      signal.throwIfAborted();
      if (requestSecurity.exceeded) throw new Error("Tool call limit exceeded");
      const last = session.messages.filter((message) => message.role === "assistant").at(-1);
      if (!last || last.stopReason === "error" || last.stopReason === "aborted") {
        throw new Error("Agent did not complete successfully");
      }
      return last.content.filter((part) => part.type === "text").map((part) => part.text).join("\n").trim() || "Pi returned no text.";
    } finally {
      signal.removeEventListener("abort", abort);
      session?.dispose();
      await client.close().catch(() => {});
    }
  }

  pi.on("session_start", async (_event, ctx) => {
    context = ctx;
    if (bot.isRunning()) return;
    try {
      await bot.init();
      void bot.start({ onStart: () => console.log("[telegram] Bot polling started") }).catch(console.error);
    } catch (error) {
      console.error("[telegram] Startup failed:", error);
    }
  });

  pi.on("session_shutdown", async () => {
    queue.shutdown();
    if (bot.isRunning()) await bot.stop();
  });
}
