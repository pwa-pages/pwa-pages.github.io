import assert from "node:assert/strict";
import { test } from "node:test";
import { approvedTools, validateToolCall } from "../src/security.ts";

test("only Rosen statistics tools and bounded parameters are accepted", () => {
  assert.deepEqual(approvedTools.map((tool) => tool.name), [
    "get_watchers_stats",
    "get_chain_perf",
    "get_address_statistics",
    "get_my_watcher_stats",
    "get_watcher_performance",
  ]);
  for (const name of ["bash", "read", "write", "edit", "env", "unknown"]) {
    assert.equal(validateToolCall(name, { command: "printenv" }), false);
  }
  assert.equal(validateToolCall("get_watchers_stats", {}), true);
  assert.equal(validateToolCall("get_watchers_stats", { path: "/etc/passwd" }), false);
  assert.equal(validateToolCall("get_address_statistics", {
    address: "9abc",
    startDate: "2024-02-29",
    endDate: "2024-03-01",
  }), true);
  for (const args of [
    { address: "../credentials" },
    { address: "x".repeat(257) },
    { address: "9abc", startDate: "2023-02-29" },
    { address: "9abc", startDate: "2024-03-02", endDate: "2024-03-01" },
    { address: "9abc", extra: true },
  ]) {
    assert.equal(validateToolCall("get_address_statistics", args), false);
  }
  assert.equal(validateToolCall("get_my_watcher_stats", { addresses: ["9abc"] }), true);
  assert.equal(validateToolCall("get_watcher_performance", { chainType: "Handshake" }), true);
  assert.equal(validateToolCall("get_watcher_performance", { ChainType: "Handshake" }), false);
  assert.equal(validateToolCall("get_my_watcher_stats", { addresses: Array(11).fill("9abc") }), false);
});
