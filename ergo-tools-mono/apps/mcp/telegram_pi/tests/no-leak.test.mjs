import assert from "node:assert/strict";
import { test } from "node:test";
import { BotError, GrammyError } from "grammy";
import telegramExtension from "../src/extension.ts";
import { createTelegramBot } from "../src/bot.ts";

const SECRET = "DUMMY-SECRET-7f3a9c1e-unrelated-mcp-tool";

test("extension registers Rosen tools and listens for Pi replies", () => {
  const previous = process.env.TELEGRAM_BOT_TOKEN;
  process.env.TELEGRAM_BOT_TOKEN = "123:test";
  const events = [];
  const tools = [];
  try {
    telegramExtension({
      on: (name) => events.push(name),
      registerTool: (tool) => tools.push(tool.name),
    });
  } finally {
    if (previous === undefined) delete process.env.TELEGRAM_BOT_TOKEN;
    else process.env.TELEGRAM_BOT_TOKEN = previous;
  }
  assert.deepEqual(events.sort(), ["agent_end", "session_shutdown", "session_start"]);
  assert.deepEqual(tools.sort(), [
    "get_address_statistics",
    "get_chain_perf",
    "get_my_watcher_stats",
    "get_watcher_performance",
    "get_watchers_stats",
  ]);
});

test("Telegram error logs omit request content and API payloads", async () => {
  const lines = [];
  const originalError = console.error;
  console.error = (...args) => lines.push(args.join(" "));
  try {
    const bot = createTelegramBot("123:test", async () => {});
    const error = new GrammyError(
      "sendMessage failed",
      { ok: false, error_code: 400, description: `answer ${SECRET}` },
      "sendMessage",
      { chat_id: 1, text: `answer ${SECRET}` },
    );
    await bot.errorHandler(new BotError(error, {
      update: { message: { text: SECRET } },
      message: { text: SECRET },
    }));
  } finally {
    console.error = originalError;
  }
  assert.equal(lines.join("\n").includes(SECRET), false);
});
