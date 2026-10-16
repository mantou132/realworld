# Shared app list: name, port, start command, environment
API_BASE="${API_BASE:-http://localhost:3100/api}"
APPS=(sveltekit next nuxt gemkit)

app_port() { case $1 in sveltekit) echo 4001 ;; next) echo 4002 ;; nuxt) echo 4003 ;; gemkit) echo 4004 ;; esac; }

start_app() {
  local name=$1 port
  port=$(app_port "$name")
  kill $(lsof -tiTCP:"$port" -sTCP:LISTEN) 2>/dev/null || true
  cd "$ROOT/apps/$name"
  case $name in
    sveltekit) API_BASE=$API_BASE PORT=$port node build ;;
    next) API_BASE_URL=$API_BASE PORT=$port npx next start ;;
    nuxt) NUXT_PUBLIC_API_BASE=$API_BASE PORT=$port node .output/server/index.mjs ;;
    gemkit) API_BASE=$API_BASE PORT=$port npx gemkit start ;;
  esac >"/tmp/realworld-$name.log" 2>&1 &
  cd - >/dev/null
  until curl -sf -o /dev/null "http://localhost:$port/"; do sleep 0.2; done
}

stop_app() { kill $(lsof -tiTCP:"$(app_port "$1")" -sTCP:LISTEN) 2>/dev/null || true; }
