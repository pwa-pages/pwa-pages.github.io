import {
  createAgentSession,
  DefaultResourceLoader,
  getAgentDir,
  SessionManager,
  type AgentSession,
} from "@mariozechner/pi-coding-agent";
import { approvedTools, registerTelegramSecurity, validateToolCall } from "./security.js";

export interface McpConnection {
  connect(): Promise<void>;
  callTool(name: string, params: Record<string, unknown>, signal: AbortSignal | undefined): Promise<unknown>;
  close(): Promise<void>;
}

export interface RunOptions {
  text: string;
  model: unknown;
  modelRegistry: unknown;
  instructions: string;
  maxToolCalls: number;
  mcp: McpConnection;
  signal: AbortSignal;
}

function extractText(result: unknown): string {
  const content = (result as { isError?: unknown; content?: unknown } | null)?.content;
  if ((result as { isError?: unknown } | null)?.isError) throw new Error("MCP tool failed");
  if (!Array.isArray(content)) throw new Error("Invalid MCP response");
  const text = content
    .filter((item): item is { type: "text"; text: string } =>
      typeof item === "object" && item !== null
      && item.type === "text" && typeof item.text === "string")
    .map((item) => item.text)
    .join("\n");
  if (!text || text.length > 100_000) throw new Error("Invalid MCP response");
  return text;
}

// Allowlist: only text parts of the final assistant message, and only when
// that message completed normally. Tool calls, thinking, tool results, user
// messages and earlier turns are never read.
export function finalAssistantText(messages: readonly unknown[]): string {
  const last = messages.filter((m) => (m as { role?: unknown }).role === "assistant").at(-1) as
    | { stopReason?: unknown; content?: unknown } | undefined;
  if (!last || last.stopReason !== "stop" || !Array.isArray(last.content)) {
    throw new Error("Agent did not complete successfully");
  }
  const text = last.content
    .filter((part): part is { type: "text"; text: string } =>
      typeof part === "object" && part !== null
      && (part as { type?: unknown }).type === "text" && typeof (part as { text?: unknown }).text === "string")
    .map((part) => part.text)
    .join("\n")
    .trim();
  return text || "Pi returned no text.";
}

export async function runIsolatedRequest(options: RunOptions): Promise<string> {
  const { mcp, signal, maxToolCalls } = options;
  let session: AgentSession | undefined;
  let security: ReturnType<typeof registerTelegramSecurity> | undefined;
  let unsubscribe: (() => void) | undefined;
  const abort = () => {
    if (session) void session.abort().catch(() => {});
    void mcp.close().catch(() => {});
  };
  signal.addEventListener("abort", abort, { once: true });

  try {
    const loader = new DefaultResourceLoader({
      cwd: "/",
      agentDir: getAgentDir(),
      noExtensions: true,
      noSkills: true,
      noPromptTemplates: true,
      noThemes: true,
      noContextFiles: true,
      systemPrompt: "You are a helpful assistant.",
      appendSystemPrompt: [],
      extensionFactories: [(isolatedPi) => {
        security = registerTelegramSecurity(isolatedPi, options.instructions, maxToolCalls);
        for (const tool of approvedTools) {
          isolatedPi.registerTool({
            ...tool,
            label: tool.name,
            execute: async (_id, params, toolSignal) => {
              if (!validateToolCall(tool.name, params)) throw new Error("Invalid tool parameters");
              try {
                const text = extractText(await mcp.callTool(tool.name, params, toolSignal));
                return { content: [{ type: "text", text }], details: {} };
              } catch {
                return { content: [{ type: "text", text: "Statistics are temporarily unavailable." }], details: {} };
              }
            },
          });
        }
      }],
    });
    await loader.reload();
    if (loader.getExtensions().errors.length) throw new Error("Failed to load Telegram security extension");
    if (!security) throw new Error("Telegram security extension is unavailable");
    const requestSecurity = security;
    signal.throwIfAborted();
    const created = await createAgentSession({
      cwd: "/",
      model: options.model as never,
      modelRegistry: options.modelRegistry as never,
      sessionManager: SessionManager.inMemory("/"),
      resourceLoader: loader,
      tools: approvedTools.map((tool) => tool.name),
    });
    session = created.session;
    unsubscribe = session.agent.subscribe((event) => {
      if (event.type === "tool_execution_start" && requestSecurity.observeAttempt()) {
        session?.agent.abort();
      }
    });
    signal.throwIfAborted();
    await session.bindExtensions({});
    signal.throwIfAborted();
    await mcp.connect();
    signal.throwIfAborted();
    await session.prompt(options.text, { expandPromptTemplates: false, source: "extension" });
    signal.throwIfAborted();
    if (requestSecurity.exceeded) throw new Error("Tool call limit exceeded");
    return finalAssistantText(session.messages);
  } finally {
    signal.removeEventListener("abort", abort);
    unsubscribe?.();
    session?.dispose();
    await mcp.close().catch(() => {});
  }
}
