import { createTelegramBot } from "./bot.js";

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN is missing");
}

const bot = createTelegramBot(token, async (request) => {
  // console.log("Received Telegram message:", request);

  await bot.api.sendMessage(
    request.chatId,
    `Echo: ${request.text}`,
    {
      reply_parameters: {
        message_id: request.messageId,
      },
    },
  );
});

await bot.init();

// console.log(`Connected as @${bot.botInfo.username}`);
// console.log("Starting standalone Telegram bot...");

await bot.start();