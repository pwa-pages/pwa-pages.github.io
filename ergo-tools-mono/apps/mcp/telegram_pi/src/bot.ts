
import { Bot } from "grammy";
import { getAddressedText } from "./mentions.js";

export interface TelegramRequest {
  text: string;
  chatId: number;
  messageId: number;
  userId: number;
  username?: string;
}

export function createTelegramBot(
  token: string,
  onMessage: (request: TelegramRequest) => Promise<void>,
) {
  const bot = new Bot(token);

  // Read allowed Telegram chat IDs from environment
  const allowedChats = new Set(
    (process.env.TELEGRAM_ALLOWED_CHAT_IDS ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );

  console.log("[telegram] Allowed chat IDs:", [...allowedChats]);

  // Log ALL incoming Telegram updates
  // This runs before any filtering
  bot.use(async (ctx, next) => {
    console.log("[telegram] RAW UPDATE:", {
      updateId: ctx.update.update_id,
      chatId: ctx.chat?.id,
      chatType: ctx.chat?.type,
      from: ctx.from?.username,
      text: ctx.message?.text,
      updateTypes: Object.keys(ctx.update),
    });

    await next();
  });

  // Handle text messages
  bot.on("message:text", async (ctx) => {
    const chatId = String(ctx.chat.id);
    const text = ctx.message.text;

    console.log("[telegram] Message received:", {
      chatId,
      chatType: ctx.chat.type,
      userId: ctx.from.id,
      username: ctx.from.username,
      text,
    });

    // Check if chat is allowed
    if (!allowedChats.has(chatId)) {
      console.log(
        `[telegram] Ignored: chat ${chatId} is not allowed`,
      );
      return;
    }

    // Check if the bot was mentioned or replied to
    const addressedText = getAddressedText(ctx);

    if (addressedText === null) {
      console.log(
        "[telegram] Ignored: bot was not mentioned",
      );
      return;
    }

    console.log(
      "[telegram] Bot addressed with:",
      addressedText,
    );

    if (!addressedText) {
      await ctx.reply("Please include a question.");
      return;
    }

    // Forward the message to our handler
    try {
      await onMessage({
        text: addressedText,
        chatId: ctx.chat.id,
        messageId: ctx.message.message_id,
        userId: ctx.from.id,
        username: ctx.from.username,
      });
    } catch (error) {
      console.error(
        "[telegram] Message handler failed:",
        error,
      );

      await ctx.reply(
        "Sorry, something went wrong.",
      );
    }
  });

  // Catch grammY errors
  bot.catch((error) => {
    console.error("[telegram] Bot error:", error);
  });

  return bot;
}
