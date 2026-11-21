set -a
source apps/mcp/telegram_pi/.env
set +a

pi --no-builtin-tools -e ./apps/mcp/telegram_pi/src/extension.ts
