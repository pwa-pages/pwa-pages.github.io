
import { Bot } from "grammy";

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN is missing");
}

const bot = new Bot(token);

// Handle /start command
bot.command("start", async (ctx) => {
  console.log("Received /start from:", ctx.from?.username);

  await ctx.reply("Hello from Rosen bot!");
});

// Handle text messages
bot.on("message:text", async (ctx) => {
  console.log("Received message:", ctx.message.text);

  await ctx.reply(`You said: ${ctx.message.text}`);
});

// Handle errors
bot.catch((error) => {
  console.error("Telegram error:", error);
});

// Connect to Telegram
console.log("Connecting to Telegram...");

await bot.init();

console.log(`Connected as @${bot.botInfo.username}`);
console.log(`Bot link: https://t.me/${bot.botInfo.username}`);

// Start listening for messages
console.log("Starting polling...");

await bot.start({
  onStart: (info) => {
    console.log(`Polling started for @${info.username}`);
  },
});
