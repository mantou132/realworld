#!/usr/bin/env bash
# Runs the official e2e suite (specs/e2e, TEST_MODE=ssr) against every app. Needs bench/api.sh running.
# Usage: bench/e2e.sh [app...]
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
source "$ROOT/bench/apps.sh"
cd "$ROOT/bench"
for name in "${@:-${APPS[@]}}"; do
  start_app "$name"
  APP=$name BASE_URL="http://localhost:$(app_port "$name")" TEST_MODE=ssr API_BASE=$API_BASE \
    npx playwright test >"results/e2e-$name.txt" 2>&1
  stop_app "$name"
  echo "$name: $(grep -E '^\s+[0-9]+ (passed|failed|skipped|flaky)' "results/e2e-$name.txt" | xargs)"
done
