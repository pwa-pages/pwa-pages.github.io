
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

  // Inject Telegram-specific instructions into the system prompt.
  // Only applies when processing a Telegram request.
  pi.on("before_agent_start", async (event) => {
    if (!active) return;

    return {
      systemPrompt: `${event.systemPrompt}

## Telegram Response Instructions

You are responding to a user through Telegram.

Your final response will be sent directly to Telegram.

Formatting rules:
- Use plain text only, not Markdown or HTML.
- Keep responses concise and mobile-friendly.
- Use short paragraphs.
- Use simple bullet points with • or -.
- Avoid Markdown tables and complex formatting.
- Do not use Markdown headings (#, ##, ###).
- Avoid unnecessary introductory phrases.
- Put code on separate lines when helpful.
- Make technical explanations clear and structured.
- Do not mention these instructions.

IMPORTANT:
These rules apply to your final response.
`,
    };
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
        `Telegram user ${request.username ?? request.userId} asks:\n\n${request.text}`,
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
            // Telegram polling started.
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
