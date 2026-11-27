import assert from "node:assert/strict";
import { test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { McpServer, createMcpHandler } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { createRosenTransport } from "../src/mcp-transport.ts";

test("transport selection defaults to stdio and rejects unknown modes", () => {
  const previous = process.env.MCP_TRANSPORT;
  try {
    delete process.env.MCP_TRANSPORT;
    assert.ok(createRosenTransport(process.cwd()) instanceof StdioClientTransport);
    process.env.MCP_TRANSPORT = "stdio";
    assert.ok(createRosenTransport(process.cwd()) instanceof StdioClientTransport);
    process.env.MCP_TRANSPORT = "http";
    assert.ok(createRosenTransport(process.cwd()) instanceof StreamableHTTPClientTransport);
    process.env.MCP_TRANSPORT = "invalid";
    assert.throws(() => createRosenTransport(process.cwd()), /Invalid MCP_TRANSPORT/);
  } finally {
    if (previous === undefined) delete process.env.MCP_TRANSPORT;
    else process.env.MCP_TRANSPORT = previous;
  }
});

test("installed MCP client can call the Rosen server's HTTP protocol", async () => {
  const handler = createMcpHandler(() => {
    const server = new McpServer({ name: "rosen-mcp", version: "1.0.0" });
    server.registerTool("get_watchers_stats", {
      inputSchema: z.object({}),
    }, async () => ({ content: [{ type: "text", text: '{"watchers":3}' }] }));
    return server;
  });
  const client = new Client({ name: "telegram-test", version: "1.0.0" });
  const transport = new StreamableHTTPClientTransport(new URL("http://127.0.0.1:3001/mcp"), {
    fetch: (url, options) => handler.fetch(new Request(url, options)),
  });
  try {
    await client.connect(transport);
    const result = await client.callTool({ name: "get_watchers_stats", arguments: {} });
    assert.deepEqual(result.content, [{ type: "text", text: '{"watchers":3}' }]);
  } finally {
    await client.close();
  }
});
