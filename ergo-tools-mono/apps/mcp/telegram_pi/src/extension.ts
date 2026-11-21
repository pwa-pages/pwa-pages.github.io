
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { createTelegramBot, type TelegramRequest } from "./telegram/bot.js";

export default function telegramExtension(pi: ExtensionAPI) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.error("[telegram] Missing TELEGRAM_BOT_TOKEN");
    return;
  }

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

  const queue: TelegramRequest[] = [];

  let active: TelegramRequest | undefined;
  let answer = "";
  let busy = false;
  let agentIdle = true;

  function processNext() {
    if (busy || !agentIdle || queue.length === 0) return;

    const request = queue.shift()!;

    active = request;
    answer = "";
    busy = true;
    agentIdle = false;

    console.log("[telegram] Sending to Pi:", request.text);

    try {
      pi.sendUserMessage(
        `Telegram user ${request.username ?? request.userId} asks:\n\n${request.text}`,
      );
    } catch (error) {
      console.error("[telegram] Pi error:", error);
      active = undefined;
      busy = false;
      agentIdle = true;
      void bot.api.sendMessage(
        request.chatId,
        "Failed to send message to Pi.",
      ).catch(console.error);
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
      console.log(`[telegram] Connected as @${bot.botInfo.username}`);

      void bot.start({
        onStart: () => {
          console.log("[telegram] Polling started");
        },
      }).catch(console.error);
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
