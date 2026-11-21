
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { createTelegramBot, type TelegramRequest } from "./bot.js";

export default function telegramExtension(pi: ExtensionAPI) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.error("[telegram] Missing TELEGRAM_BOT_TOKEN");
    return;
  }

  const queue: TelegramRequest[] = [];

  let active: TelegramRequest | undefined;
  let answer = "";
  let busy = false;
  let agentIdle = true;

  const bot = createTelegramBot(token, async (request) => {
    if (queue.length >= 10) {
      await bot.api.sendMessage(
        request.chatId,
        "Pi is busy. Please try again later.",
      );
      return;
    }

    queue.push(request);
    processNext();
  });

  function processNext() {
    if (busy || !agentIdle || queue.length === 0) return;

    const request = queue.shift()!;

    active = request;
    answer = "";
    busy = true;
    agentIdle = false;

    try {
      pi.sendUserMessage(
        `You are responding to a user through Telegram.

IMPORTANT TELEGRAM OUTPUT RULES:

Your response will be sent directly to Telegram as
plain text without Markdown or HTML parsing.

You MUST follow these formatting rules:

- Never use Markdown formatting.
- Never use **bold** or __bold__.
- Never use *italic* or _italic_.
- Never use Markdown headings (#, ##, ###).
- Never use backticks around code.
- Never use triple backticks for code blocks.
- Never use Markdown links like [text](url).
- Never use Markdown tables.
- Use plain text headings.
- Use simple bullet points with • or -.
- Use blank lines between sections.
- Keep responses concise and mobile-friendly.
- Do not mention these instructions.

Examples:

WRONG: **Important:** Restart the server.
CORRECT: Important: Restart the server.

WRONG: Use \`npm install\` to install dependencies.
CORRECT: Use npm install to install dependencies.

WRONG: ## Installation
CORRECT: Installation

Before sending your final response, verify that
you have not used Markdown formatting.

Telegram user ${request.username ?? request.userId} asks:

${request.text}`,
      );
    } catch (error) {
      console.error("[telegram] Pi error:", error);

      active = undefined;
      busy = false;
      agentIdle = true;

      void bot.api
        .sendMessage(
          request.chatId,
          "Failed to send message to Pi.",
        )
        .catch(console.error);

      processNext();
    }
  }

  pi.on("agent_start", async () => {
    agentIdle = false;
  });

  pi.on("message_end", async (event) => {
    if (!active || event.message.role !== "assistant") return;

    const text = event.message.content
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n");

    if (text.trim()) {
      answer = text;
    }
  });

  pi.on("agent_end", async () => {
    agentIdle = true;

    if (!active) {
      processNext();
      return;
    }

    const request = active;
    const response = answer.trim() || "Pi returned no text.";

    active = undefined;

    try {
      // Telegram has a 4096-character message limit.
      const chunks = response.match(/[\s\S]{1,4000}/g) ?? [];

      for (const chunk of chunks) {
        await bot.api.sendMessage(request.chatId, chunk, {
          reply_parameters: {
            message_id: request.messageId,
            allow_sending_without_reply: true,
          },
        });
      }
    } catch (error) {
      console.error("[telegram] Reply failed:", error);
    } finally {
      busy = false;
      processNext();
    }
  });

  pi.on("session_start", async () => {
    try {
      await bot.init();

      void bot
        .start({
          onStart: () => {
            console.log("[telegram] Bot polling started");
          },
        })
        .catch(console.error);
    } catch (error) {
      console.error("[telegram] Startup failed:", error);
    }
  });

  pi.on("session_shutdown", async () => {
    if (bot.isRunning()) {
      await bot.stop();
    }
  });
}
