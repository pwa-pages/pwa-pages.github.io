// Errors from grammY, the MCP SDK and Pi can embed request payloads, update
// contexts or tool output. Log only an allowlist of non-content fields.
export function describeError(error: unknown): string {
  if (!(error instanceof Error)) return "non-error value";
  const code = (error as { error_code?: unknown }).error_code;
  return typeof code === "number" ? `${error.name} (${code})` : error.name;
}

export function logError(label: string, error: unknown): void {
  console.error(`[telegram] ${label}: ${describeError(error)}`);
}
