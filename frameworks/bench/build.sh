#!/usr/bin/env bash
# Installs and builds every app. Usage: bench/build.sh [app...]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
source "$ROOT/bench/apps.sh"
for name in "${@:-${APPS[@]}}"; do
  echo "== $name"
  cd "$ROOT/apps/$name"
  if [ "$name" = next ]; then npm ci --no-audit --no-fund; else pnpm install; fi
  start=$(date +%s)
  if [ "$name" = next ]; then npm run build; else pnpm build; fi
  echo "$name build: $(($(date +%s) - start))s"
done
