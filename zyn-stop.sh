#!/bin/bash
# ZYN Empire -- Stop All Services
echo "[ZYN] Stopping..."
pm2 stop zyn-backend zyn-watchdog 2>/dev/null || true
podman stop zyn-redis zyn-firecrawl 2>/dev/null || true
podman-compose -f compose/podman-compose.yml down 2>/dev/null || true
systemctl --user stop zyn-mirofish zyn-ollama 2>/dev/null || true
pkill ollama 2>/dev/null || true
echo "[ZYN] Stopped."
