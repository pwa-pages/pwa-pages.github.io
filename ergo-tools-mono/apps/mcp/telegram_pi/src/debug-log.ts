import { appendFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";

const LOG_PATH = "/tmp/telegram-extension-debug.log";
const MAX_DATA_LENGTH = 8_000;

export function createRequestId(): string {
  return randomBytes(4).toString("hex");
}

function truncate(value: string): string {
  return value.length <= MAX_DATA_LENGTH ? value : `${value.slice(0, MAX_DATA_LENGTH)}...[truncated]`;
}

export function safeSerialize(value: unknown): string {
  const seen = new WeakSet<object>();
  try {
    const serialized = JSON.stringify(value, (_key, nested) => {
      if (typeof nested === "bigint") return String(nested);
      if (typeof nested === "object" && nested !== null) {
        if (seen.has(nested)) return "[Circular]";
        seen.add(nested);
      }
      if (typeof nested === "string" && nested.length > MAX_DATA_LENGTH) {
        return truncate(nested);
      }
      return nested;
    });
    return truncate(serialized ?? "null");
  } catch {
    return "[Unserializable]";
  }
}

export async function debugLog(requestId: string, scope: string, step: string, data: unknown): Promise<void> {
  if (process.env.TELEGRAM_DEBUG !== "1") return;
  try {
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      scope,
      requestId,
      step,
      data: JSON.parse(safeSerialize(data)),
    });
    await appendFile(LOG_PATH, `${line}\n`, { encoding: "utf8" });
  } catch {
    // Debug logging must never affect Telegram behavior.
  }
}
