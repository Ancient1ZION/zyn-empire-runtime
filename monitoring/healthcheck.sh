#!/bin/bash
# ZYN Empire -- Health Check Script (used by GitHub Actions)
PASS=0; FAIL=0
check() { curl -sf "$2" &>/dev/null && { echo "  OK   $1"; ((PASS++)); } || { echo "  FAIL $1"; ((FAIL++)); }; }
echo "=== ZYN Health Check ==="
check "Backend:3000"   "http://localhost:3000/ping"
check "MiroFish:5001"  "http://localhost:5001"
check "Ollama:11434"   "http://localhost:11434/api/tags"
check "Firecrawl:3002" "http://localhost:3002"
echo "PASS=$PASS FAIL=$FAIL"
exit $FAIL
