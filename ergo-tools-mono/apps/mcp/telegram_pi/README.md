# Rosen Radar Telegram extension

Start the Rosen MCP HTTP server with `./run_mcp_http.sh`, then run Pi with
`./start_pi.sh`. Configure `TELEGRAM_BOT_TOKEN` and the comma-separated
`TELEGRAM_ALLOWED_CHAT_IDS` as before. The extension connects to the local
Rosen MCP endpoint at `http://127.0.0.1:3001/mcp`; the MCP server must be
trusted and protected against access by other users.

Optional positive-integer settings:

- `TELEGRAM_USER_RATE_LIMIT_MS`: minimum time between accepted requests per user
  (default 10000, maximum 3600000).
- `TELEGRAM_REQUEST_TIMEOUT_MS`: request deadline (default 90000, maximum 600000).
- `TELEGRAM_MAX_TOOL_CALLS`: maximum attempted tool calls per request
  (default 6, maximum 30).

Each request uses a fresh, non-persistent Pi SDK session with only the four
Rosen statistics tools. It does not load the interactive session's history,
extensions, project context, or system prompt, which could contain private
configuration. The Telegram instructions are appended to a separate safe base
system prompt. The selected interactive model and model registry are reused.
This means custom model providers must be registered in that registry. Prompt
and response content is still sent to the configured model provider.

Tool parameters, address count, response size, tool calls, rate, and elapsed
time are bounded. The MCP server may continue background work after a client
disconnect or timeout; cancellation does not guarantee that its upstream
downloads stop. The server's existing shared caches are not per-user, and
address-based downloads are not constrained by the optional date filters.
Run only a trusted local server and avoid exposing its HTTP endpoint publicly.
Model instructions cannot guarantee resistance to every prompt injection or
prevent a model from echoing information that is already in its input.

Run focused tests with:

```
node --import tsx --test apps/mcp/telegram_pi/tests/*.test.mjs
```
