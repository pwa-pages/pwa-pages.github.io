import { Bot } from "grammy";
import type { Responder } from "./responder.js";

export function createBot(token: string, responder: Responder) {
  const bot = new Bot(token);

  bot.command("start", async (ctx) => {
    await ctx.reply(
      "Hello! Send me a message or mention me in a group.",
    );
  });

  bot.on("message:text", async (ctx) => {
    const text = ctx.message.text;
    const isPrivate = ctx.chat.type === "private";

    const isMentioned = ctx.message.entities?.some(
      (entity) =>
        entity.type === "mention" &&
        text
          .slice(entity.offset, entity.offset + entity.length)
          .toLowerCase() === `@${ctx.me.username.toLowerCase()}`,
    ) ?? false;

    const isReplyToBot =
      ctx.message.reply_to_message?.from?.id === ctx.me.id;

    if (!isPrivate && !isMentioned && !isReplyToBot) {
      return;
    }

    const cleanText = text
      .replace(new RegExp(`@${ctx.me.username}\\b`, "gi"), "")
      .trim();

    if (!cleanText) {
      await ctx.reply("What would you like to ask?");
      return;
    }

    try {
      const answer = await responder.respond({
        text: cleanText,
        userId: ctx.from.id,
        chatId: ctx.chat.id,
        username: ctx.from.username,
      });

      await ctx.reply(answer, {
        reply_parameters: {
          message_id: ctx.message.message_id,
        },
      });
    } catch (error) {
      console.error("Failed to respond:", error);
      await ctx.reply("Something went wrong.");
    }
  });

  bot.catch((error) => {
    console.error("Telegram error:", error);
  });

  return bot;
}