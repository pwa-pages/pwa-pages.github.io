import type { TelegramRequest } from "./bot.js";

export class RequestQueue {
  private readonly queue: TelegramRequest[] = [];
  private readonly lastRequest = new Map<number, number>();
  private busy = false;
  private stopped = false;
  private currentAbort: AbortController | undefined;

  constructor(
    private readonly timeoutMs: number,
    private readonly rateLimitMs: number,
    private readonly run: (request: TelegramRequest, signal: AbortSignal) => Promise<string>,
    private readonly reply: (request: TelegramRequest, text: string) => Promise<void>,
  ) {}

  async enqueue(request: TelegramRequest): Promise<void> {
    if (this.stopped) return;
    const now = Date.now();
    for (const [userId, time] of this.lastRequest) {
      if (now - time >= this.rateLimitMs) this.lastRequest.delete(userId);
    }
    if (this.lastRequest.has(request.userId) || this.lastRequest.size >= 10_000) {
      await this.reply(request, "Please wait before sending another request.");
      return;
    }
    if (this.queue.length >= 10) {
      await this.reply(request, "Pi is busy. Please try again later.");
      return;
    }
    this.lastRequest.set(request.userId, now);
    this.queue.push(request);
    void this.processNext();
  }

  shutdown(): void {
    this.stopped = true;
    this.queue.length = 0;
    this.currentAbort?.abort();
  }

  private async processNext(): Promise<void> {
    if (this.busy || this.stopped || this.queue.length === 0) return;
    const request = this.queue.shift()!;
    this.busy = true;
    const controller = new AbortController();
    this.currentAbort = controller;
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const timedOut = new Promise<never>((_, reject) => {
        controller.signal.addEventListener("abort", () => reject(new Error("Request cancelled")), { once: true });
      });
      const response = await Promise.race([this.run(request, controller.signal), timedOut]);
      if (!this.stopped) await this.reply(request, response);
    } catch (error) {
      console.error("[telegram] Request failed:", error);
      if (!this.stopped) {
        try {
          await this.reply(request, controller.signal.aborted
            ? "The request timed out. Please try again later."
            : "Sorry, the request could not be completed.");
        } catch (replyError) {
          console.error("[telegram] Reply failed:", replyError);
        }
      }
    } finally {
      clearTimeout(timer);
      this.currentAbort = undefined;
      this.busy = false;
      void this.processNext();
    }
  }
}
