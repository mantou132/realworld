#!/usr/bin/env bash
# Starts the reference RealWorld backend (Nitro + Prisma + SQLite, needs Bun) on :3100 with a fresh, seeded database.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$ROOT/.api"
COMMIT=c8c66858a436a6e07f445fffe2253a65ff6dcb58
PORT="${API_PORT:-3100}"

if [ ! -d "$DIR" ]; then
  git clone -q https://github.com/realworld-apps/nitro-prisma-zod-realworld-example-app "$DIR"
  git -C "$DIR" checkout -q "$COMMIT"
  (cd "$DIR" && bun install && bun run prepare && bun run db:generate && bun run build)
fi

cd "$DIR"
rm -f dev.db prisma/dev.db
bun x prisma db push >/dev/null
JWT_SECRET="${JWT_SECRET:-realworld-bench-secret}" PORT="$PORT" bun .output/server/index.mjs &
API_PID=$!
trap 'kill $API_PID' EXIT
until curl -sf "http://localhost:$PORT/api/tags" >/dev/null; do sleep 0.2; done
node "$ROOT/bench/seed.mjs" "http://localhost:$PORT/api"
echo "API ready on http://localhost:$PORT/api (pid $API_PID)"
wait $API_PID
