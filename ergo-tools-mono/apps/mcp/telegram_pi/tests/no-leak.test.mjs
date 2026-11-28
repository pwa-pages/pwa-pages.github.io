import assert from "node:assert/strict";
import { test } from "node:test";
import { BotError, GrammyError } from "grammy";
import { createAssistantMessageEventStream } from "@mariozechner/pi-ai";
import { AuthStorage, ModelRegistry } from "@mariozechner/pi-coding-agent";
import telegramExtension from "../src/extension.ts";
import { createTelegramBot } from "../src/bot.ts";
import { RequestQueue } from "../src/request-queue.ts";
import { finalAssistantText, runIsolatedRequest } from "../src/run-request.ts";

const SECRET = "DUMMY-SECRET-7f3a9c1e-unrelated-mcp-tool";

// Captures every channel the extension could log through.
function captureOutput() {
  const lines = [];
  const originals = {};
  for (const name of ["log", "info", "warn", "error", "debug"]) {
    originals[name] = console[name];
    console[name] = (...args) => lines.push(args.map((a) => (typeof a === "string" ? a : JSON.stringify(a, (_k, v) => (typeof v === "bigint" ? String(v) : v)))).join(" "));
  }


  const stdout = process.stdout.write;
  const stderr = process.stderr.write;
  process.stdout.write = (chunk, ...rest) => { lines.push(String(chunk)); return stdout.call(process.stdout, chunk, ...rest); };
  process.stderr.write = (chunk, ...rest) => { lines.push(String(chunk)); return stderr.call(process.stderr, chunk, ...rest); };
  return {
    lines,
    restore() {
      Object.assign(console, originals);
      process.stdout.write = stdout;
      process.stderr.write = stderr;
    },
  };
}

function fakeRegistry(script) {
  const auth = AuthStorage.inMemory();
  auth.setRuntimeApiKey("leak-test", "test-key");
  const registry = ModelRegistry.inMemory(auth);
  registry.registerProvider("leak-test", {
    baseUrl: "http://localhost",
    api: "leak-test-api",
    apiKey: "test-key",
    models: [{
      id: "fake", name: "fake", reasoning: false, input: ["text"],
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      contextWindow: 8192, maxTokens: 1024,
    }],
    streamSimple(model, context) {
      const stream = createAssistantMessageEventStream();
      const toolResults = context.messages.filter((m) => m.role === "toolResult");
      const done = toolResults.length > 0;
      const message = {
        role: "assistant", api: model.api, provider: model.provider, model: model.id,
        content: done
          ? [{ type: "thinking", thinking: `internal ${SECRET}` }, { type: "text", text: script.finalText }]
          : [{ type: "text", text: `intermediate ${SECRET}` }, { type: "toolCall", id: "call-1", name: script.tool, arguments: {} }],
        usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0,
          cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 } },
        stopReason: done ? "stop" : "toolUse", timestamp: Date.now(),
      };
      stream.push({ type: "start", partial: message });
      stream.push({ type: "done", reason: message.stopReason, message });
      stream.end();
      return stream;
    },
  });
  return { registry, model: registry.find("leak-test", "fake") };
}

function fakeMcp(calls) {
  return {
    connect: async () => {},
    close: async () => {},
    callTool: async (name) => {
      calls.push(name);
      // The unrelated tool result carries the secret; the model never repeats it.
      return { content: [{ type: "text", text: `result with ${SECRET}` }] };
    },
  };
}

test("Telegram-initiated request: secret from an unrelated MCP tool never reaches logs or Telegram payloads", async () => {
  const { registry, model } = fakeRegistry({ tool: "get_chain_perf", finalText: "Chain performance is healthy." });
  const calls = [];
  const sent = [];
  const out = captureOutput();
  try {
    const queue = new RequestQueue(5000, 0, (request, signal) => runIsolatedRequest({
      text: request.text, model, modelRegistry: registry, instructions: "x", maxToolCalls: 3,
      mcp: fakeMcp(calls), signal,
    }), async (request, text) => { sent.push({ chat_id: request.chatId, text }); });
    await queue.enqueue({ userId: 1, chatId: 1, messageId: 1, text: "how is the chain?" });
    for (let i = 0; i < 200 && sent.length === 0; i++) await new Promise((r) => setTimeout(r, 10));
  } finally {
    out.restore();
  }
  assert.deepEqual(calls, ["get_chain_perf"], "the MCP tool must still run");
  assert.deepEqual(sent.map((s) => s.text), ["Chain performance is healthy."]);
  assert.equal(JSON.stringify(sent).includes(SECRET), false);
  assert.equal(out.lines.join("\n").includes(SECRET), false);
});

test("final answer extraction is allowlisted to text of a completed assistant message", () => {
  const base = { role: "assistant", usage: {}, timestamp: 0 };
  const messages = [
    { role: "user", content: [{ type: "text", text: SECRET }] },
    { ...base, stopReason: "toolUse", content: [{ type: "toolCall", id: "1", name: "t", arguments: { s: SECRET } }] },
    { role: "toolResult", content: [{ type: "text", text: SECRET }] },
    { ...base, stopReason: "stop", content: [
      { type: "thinking", thinking: SECRET }, { type: "text", text: "Answer" }, { type: "toolCall", id: "2", name: "t", arguments: { s: SECRET } },
    ] },
  ];
  assert.equal(finalAssistantText(messages), "Answer");
  for (const stopReason of ["toolUse", "error", "aborted", "length"]) {
    assert.throws(() => finalAssistantText([{ ...messages[3], stopReason }]));
  }
});

test("failure paths log only error class and code, never payloads or update contexts", async () => {
  const out = captureOutput();
  try {
    const grammyError = new GrammyError("Call to 'sendMessage' failed!", { ok: false, error_code: 400, description: "Bad Request" },
      "sendMessage", { chat_id: 1, text: `answer ${SECRET}` });
    const queue = new RequestQueue(1000, 0, async () => `answer ${SECRET}`, async () => { throw grammyError; });
    await queue.enqueue({ userId: 2, chatId: 2, messageId: 2, text: "q" });
    for (let i = 0; i < 50; i++) await new Promise((r) => setTimeout(r, 10));
    const bot = createTelegramBot("123:test", async () => {});
    const ctx = { update: { message: { text: SECRET } }, message: { text: SECRET } };
    await bot.errorHandler(new BotError(grammyError, ctx));
    await bot.errorHandler(new BotError(new Error(`boom ${SECRET}`), ctx));
  } finally {
    out.restore();
  }
  const logged = out.lines.join("\n");
  assert.ok(logged.includes("GrammyError (400)"), logged);
  assert.equal(logged.includes(SECRET), false, logged);
});

test("extension registers only session lifecycle listeners and no event forwarding", () => {
  process.env.TELEGRAM_BOT_TOKEN = "123:test";
  const registered = [];
  const pi = new Proxy({}, {
    get: (_t, prop) => (prop === "on" ? (name) => registered.push(name) : () => registered.push(`api:${String(prop)}`)),
  });
  telegramExtension(pi);
  assert.deepEqual(registered.sort(), ["session_shutdown", "session_start"]);
});

test("terminal-initiated requests are unaffected: extension registers no tool/message listeners", () => {
  // The extension has no handler for tool_call, tool_result, tool_execution_*, message_*, agent_end or context,
  // so a terminal request cannot flow through it.
  const forbidden = /tool_|message_|agent_end|context|turn_/;
  const registered = [];
  telegramExtension({ on: (name) => registered.push(name) });
  assert.equal(registered.some((name) => forbidden.test(name)), false);
});

test("repeated requests leave no per-request listeners on the abort signal", async () => {
  const { registry, model } = fakeRegistry({ tool: "get_chain_perf", finalText: "ok" });
  const controller = new AbortController();
  let added = 0;
  let removed = 0;
  const add = controller.signal.addEventListener.bind(controller.signal);
  const remove = controller.signal.removeEventListener.bind(controller.signal);
  controller.signal.addEventListener = (...a) => { added++; return add(...a); };
  controller.signal.removeEventListener = (...a) => { removed++; return remove(...a); };
  for (let i = 0; i < 2; i++) {
    const text = await runIsolatedRequest({
      text: "q", model, modelRegistry: registry, instructions: "x", maxToolCalls: 3,
      mcp: fakeMcp([]), signal: controller.signal,
    });
    assert.equal(text, "ok");
  }
  assert.equal(added, removed);
});
