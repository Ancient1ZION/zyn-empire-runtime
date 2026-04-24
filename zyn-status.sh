#!/bin/bash
# ZYN Empire -- Status Dashboard
check() { curl -sf "$2" &>/dev/null && echo "  OK   $1" || echo "  FAIL $1"; }
echo ""
echo "=== ZYN EMPIRE STATUS ==="
check "Backend:3000" "http://localhost:3000/ping"
check "MiroFish:5001" "http://localhost:5001"
check "Ollama:11434" "http://localhost:11434/api/tags"
check "Firecrawl:3002" "http://localhost:3002"
echo ""
pm2 list --no-color 2>/dev/null | grep zyn || echo "(pm2 not running)"
podman ps --format "table {{.Names}}	{{.Status}}" 2>/dev/null || echo "(no containers)"
