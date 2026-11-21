
import type { Context } from "grammy";

export function getAddressedText(
  ctx: Context,
): string | null {
  const message = ctx.message;

  if (!message?.text || !ctx.me) {
    return null;
  }

  const text = message.text;
  const botUsername = ctx.me.username.toLowerCase();

  // Private chats: respond to all messages
  if (ctx.chat?.type === "private") {
    return text.trim();
  }

  // Detect @mentions
  const isMentioned = message.entities?.some((entity) => {
    if (entity.type !== "mention") {
      return false;
    }

    const mention = text.slice(
      entity.offset,
      entity.offset + entity.length,
    );

    return mention.toLowerCase() === `@${botUsername}`;
  }) ?? false;

  // Detect commands addressed to this bot
  // Example: /start@rosen_radar_bot
  const isCommand = message.entities?.some((entity) => {
    if (entity.type !== "bot_command") {
      return false;
    }

    const command = text.slice(
      entity.offset,
      entity.offset + entity.length,
    );

    return command.toLowerCase().endsWith(`@${botUsername}`);
  }) ?? false;

  // Detect replies to the bot
  const isReply =
    message.reply_to_message?.from?.id === ctx.me.id;

  if (!isMentioned && !isCommand && !isReply) {
    return null;
  }

  // Remove mentions and command prefixes
  const cleaned = text
    .replace(
      new RegExp(`@${botUsername}\\b`, "gi"),
      "",
    )
    .replace(/^\/\w+\s*/, "")
    .trim();

  return cleaned;
}
