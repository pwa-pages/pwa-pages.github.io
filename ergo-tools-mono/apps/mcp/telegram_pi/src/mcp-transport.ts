import { fileURLToPath } from "node:url";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export function createRosenTransport(cwd: string) {
  const mode = process.env.MCP_TRANSPORT ?? "stdio";
  if (mode === "http") {
    return new StreamableHTTPClientTransport(new URL("http://127.0.0.1:3001/mcp"));
  }
  if (mode !== "stdio") {
    throw new Error(`[telegram] Invalid MCP_TRANSPORT: ${mode}`);
  }

  const env: Record<string, string> = { MCP_TRANSPORT: "stdio" };
  if (process.env.XDG_DATA_HOME) env.XDG_DATA_HOME = process.env.XDG_DATA_HOME;
  if (process.env.WATCHERSTATS_MCP_STORAGE_DIR) {
    env.WATCHERSTATS_MCP_STORAGE_DIR = process.env.WATCHERSTATS_MCP_STORAGE_DIR;
  }
  return new StdioClientTransport({
    command: process.execPath,
    args: [
      fileURLToPath(new URL("../../../../dist/apps/mcp/watcherstats_mcp/main.js", import.meta.url)),
    ],
    cwd,
    env,
    stderr: "ignore",
  });
}
