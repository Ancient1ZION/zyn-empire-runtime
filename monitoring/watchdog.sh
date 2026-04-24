#!/bin/bash
# ZYN Empire -- 24/7 Watchdog - Auto-restart failed services
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$SCRIPT_DIR/.env" 2>/dev/null || true

alert() {
  echo "[WATCHDOG] $1"
  [ -n "$DISCORD_WEBHOOK" ] && curl -sf -X POST "$DISCORD_WEBHOOK" \
    -H "Content-Type: application/json" \
    -d "{"content": "$1"}" &>/dev/null || true
}

check_restart() {
  local name="$1" url="$2" restart="$3"
  if ! curl -sf "$url" &>/dev/null; then
    alert "WARNING: $name OFFLINE - restarting..."
    eval "$restart" &>/dev/null || true
    sleep 15
    curl -sf "$url" &>/dev/null && alert "OK: $name RECOVERED" || alert "ERROR: $name FAILED - manual check needed"
  fi
}

echo "[WATCHDOG] 24/7 monitoring active..."
while true; do
  check_restart "ZYN Backend" "http://localhost:3000/ping" \
    "cd $SCRIPT_DIR/backend && pm2 restart zyn-backend || pm2 start server.js --name zyn-backend"
  check_restart "MiroFish" "http://localhost:5001" \
    "cd ~/MiroFish && podman-compose up -d"
  check_restart "Ollama" "http://localhost:11434/api/tags" \
    "systemctl --user restart zyn-ollama 2>/dev/null || nohup ollama serve >/tmp/ollama.log 2>&1 &"
  sleep 300
done
