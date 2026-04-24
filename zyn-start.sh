#!/bin/bash
# ZYN Empire -- Start All Services
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/.env" 2>/dev/null || { echo "ERROR: .env missing. Run: cp .env.example .env && nano .env"; exit 1; }
echo "[ZYN] Starting all services..."

# Redis
podman start zyn-redis 2>/dev/null || \
  podman run -d --name zyn-redis --network zyn-net --restart=always \
    -p 127.0.0.1:6379:6379 -v zyn-redis-data:/data \
    docker.io/redis:7-alpine redis-server --appendonly yes

# Firecrawl
podman start zyn-firecrawl 2>/dev/null || \
  podman run -d --name zyn-firecrawl --network zyn-net --restart=always \
    -p 127.0.0.1:3002:3002 -e REDIS_URL=redis://zyn-redis:6379 \
    docker.io/mendableai/firecrawl:latest

# MiroFish
if [ -d "$HOME/MiroFish" ]; then
  cd "$HOME/MiroFish" && podman-compose up -d && cd "$SCRIPT_DIR"
fi

# Ollama
systemctl --user start zyn-ollama 2>/dev/null || nohup ollama serve >/tmp/ollama.log 2>&1 &

# ZYN Backend
cd "$SCRIPT_DIR/backend" && npm install --production --silent 2>/dev/null
pm2 restart zyn-backend 2>/dev/null || pm2 start server.js --name zyn-backend --env production
pm2 save

# Watchdog
pm2 restart zyn-watchdog 2>/dev/null || pm2 start monitoring/watchdog.sh --name zyn-watchdog --interpreter bash

cd "$SCRIPT_DIR"
echo "[ZYN] All services started!"
echo "[ZYN] Backend:   http://localhost:3000/ping"
echo "[ZYN] MiroFish:  http://localhost:5001"
echo "[ZYN] Ollama:    http://localhost:11434"
