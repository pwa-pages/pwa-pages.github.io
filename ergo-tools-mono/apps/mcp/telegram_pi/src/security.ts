import { Type } from "typebox";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

const address = Type.String({ minLength: 1, maxLength: 256 });
const date = Type.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" });

export const approvedTools = [
  {
    name: "get_watchers_stats",
    description: "Retrieve current aggregate Rosen watcher statistics.",
    parameters: Type.Object({}, { additionalProperties: false }),
  },
  {
    name: "get_chain_perf",
    description: "Retrieve Rosen chain performance statistics.",
    parameters: Type.Object({}, { additionalProperties: false }),
  },
  {
    name: "get_address_statistics",
    description: "Retrieve cached watcher reward statistics for an address, optionally filtered by inclusive UTC dates.",
    parameters: Type.Object({ address, startDate: Type.Optional(date), endDate: Type.Optional(date) }, { additionalProperties: false }),
  },
  {
    name: "get_my_watcher_stats",
    description: "Retrieve permit statistics for watcher addresses.",
    parameters: Type.Object({ addresses: Type.Array(address, { minItems: 1, maxItems: 10 }) }, { additionalProperties: false }),
  },
  {
    name: "get_watcher_performance",
    description: "Retrieve monthly watcher report counts for a chain type.",
    parameters: Type.Object({ chainType: Type.String({ minLength: 1, maxLength: 64 }) }, { additionalProperties: false }),
  },
];

function validAddress(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 256
    && /^[A-Za-z0-9]+$/.test(value);
}

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function validateToolCall(name: string, input: unknown): input is Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return false;
  const args = input as Record<string, unknown>;
  const keys = Object.keys(args);
  switch (name) {
    case "get_watchers_stats":
    case "get_chain_perf":
      return keys.length === 0;
    case "get_my_watcher_stats":
      return keys.length === 1 && Array.isArray(args.addresses)
        && args.addresses.length >= 1 && args.addresses.length <= 10
        && args.addresses.every(validAddress);
    case "get_watcher_performance":
      return keys.length === 1
        && typeof args.chainType === "string"
        && args.chainType.length >= 1
        && args.chainType.length <= 64
        && /^[A-Za-z][A-Za-z0-9_-]*$/.test(args.chainType);
    case "get_address_statistics":
      return keys.every((key) => ["address", "startDate", "endDate"].includes(key))
        && validAddress(args.address)
        && (args.startDate === undefined || validDate(args.startDate))
        && (args.endDate === undefined || validDate(args.endDate))
        && (args.startDate === undefined || args.endDate === undefined || args.startDate <= args.endDate);
    default:
      return false;
  }
}

export function createToolGuard(maxCalls: number) {
  let calls = 0;
  return (name: string, input: unknown) => {
    calls++;
    if (calls > maxCalls || !validateToolCall(name, input)) {
      return { block: true, reason: "Tool call not permitted." };
    }

    return undefined;
  };
}

export function registerTelegramSecurity(pi: ExtensionAPI, instructions: string, maxCalls: number) {
  const guard = createToolGuard(maxCalls);
  let attempts = 0;
  pi.on("before_agent_start", (event) => ({
    systemPrompt: `${event.systemPrompt}\n\n${instructions}`,
  }));
  pi.on("tool_call", (event) => attempts > maxCalls
    ? { block: true, reason: "Tool call not permitted." }
    : guard(event.toolName, event.input));
  return {
    observeAttempt() {
      attempts++;
      return attempts > maxCalls;
    },
    get exceeded() {
      return attempts > maxCalls;
    },
  };
}
