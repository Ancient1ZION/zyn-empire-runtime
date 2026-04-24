#!/bin/bash
# ZYN Empire -- Discord Alert
# Usage: ./discord-alert.sh "message"
source "$(dirname "$0")/../.env" 2>/dev/null || true
MESSAGE="${1:-ZYN Empire alert}"
[ -n "$DISCORD_WEBHOOK" ] && \
  curl -sf -X POST "$DISCORD_WEBHOOK" \
    -H "Content-Type: application/json" \
    -d "{"content": "$MESSAGE"}" && echo "[ZYN] Alert sent" || echo "[WARN] DISCORD_WEBHOOK not set"
