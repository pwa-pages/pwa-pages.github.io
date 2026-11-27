import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";
import { test } from "node:test";
import { RequestQueue } from "../src/request-queue.ts";

const request = (userId, text = "question") => ({ userId, text, chatId: userId, messageId: userId });

async function waitFor(predicate) {
  for (let i = 0; i < 100; i++) {
    if (predicate()) return;
    await delay(5);
  }
  assert.fail("Timed out waiting for queue");
}

test("rate limit and queue capacity are enforced", async () => {
  const replies = [];
  let release;
  const queue = new RequestQueue(2000, 1000, () => new Promise((resolve) => { release = resolve; }),
    async (item, text) => { replies.push([item.userId, text]); });
  await queue.enqueue(request(1));
  await queue.enqueue(request(1));
  for (let id = 2; id <= 11; id++) await queue.enqueue(request(id));
  await queue.enqueue(request(12));
  assert.match(replies.find(([id]) => id === 1)[1], /wait/);
  assert.match(replies.find(([id]) => id === 12)[1], /busy/);
  queue.shutdown();
  release("late");
});

test("timeouts and failures release the queue and late results cannot reply", async () => {
  const replies = [];
  const starts = [];
  let finishLate;
  let firstSignal;
  const queue = new RequestQueue(30, 1000, async (item, signal) => {
    starts.push(item.userId);
    if (item.userId === 1) {
      firstSignal = signal;
      return new Promise((resolve) => { finishLate = resolve; });
    }
    if (item.userId === 2) throw new Error("private error");
    return "verified statistics";
  }, async (item, text) => { replies.push([item.userId, text]); });
  await queue.enqueue(request(1));
  await queue.enqueue(request(2));
  await queue.enqueue(request(3));
  await waitFor(() => replies.length === 3);
  assert.deepEqual(starts, [1, 2, 3]);
  assert.equal(firstSignal.aborted, true);
  assert.match(replies[0][1], /timed out/);
  assert.equal(replies[1][1], "Sorry, the request could not be completed.");
  assert.equal(replies[2][1], "verified statistics");
  finishLate("should never be sent");
  await delay(10);
  assert.equal(replies.length, 3);
  queue.shutdown();
});
