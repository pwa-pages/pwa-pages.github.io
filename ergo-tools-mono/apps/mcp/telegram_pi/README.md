# Rosen Radar Telegram extension

Run Pi with `./start_pi.sh`. Configure `TELEGRAM_BOT_TOKEN` and the
comma-separated `TELEGRAM_ALLOWED_CHAT_IDS`.

Telegram requests are sent directly to the running Pi session. This reuses its
conversation, model, and tools, and avoids creating a Pi session or MCP server
process for each message. The Rosen statistics tools connect once when the Pi
session starts. By default, the extension starts the built MCP server over
stdio; build it first with `./build_mcp.sh`. Set `MCP_TRANSPORT=http` to use
`http://127.0.0.1:3001/mcp` instead, and start that server separately with
`./run_mcp_http.sh`. Set `MCP_TRANSPORT=stdio` to explicitly select stdio.
Other values are rejected.

Because Telegram uses the interactive Pi session, its messages and replies
appear in that conversation and can use the tools available to Pi. Only send
messages from trusted, allowed chats. Requests are declined while Pi is busy,
and replies longer than 4000 characters are truncated.

Run focused tests with:

```
node --import tsx --test apps/mcp/telegram_pi/tests/*.test.mjs
```
