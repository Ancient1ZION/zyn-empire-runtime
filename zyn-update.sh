#!/bin/bash
# ZYN Empire -- Update All Services
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "[ZYN] Updating..."
git -C "$SCRIPT_DIR" pull origin main
cd "$SCRIPT_DIR/backend" && npm install --production
podman pull docker.io/redis:7-alpine docker.io/mendableai/firecrawl:latest 2>/dev/null || true
./zyn-stop.sh && sleep 3 && ./zyn-start.sh
echo "[ZYN] Update complete!"
