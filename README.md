# ZYN Empire Runtime 🚀
## 24/7 Autonomous AI Agent Infrastructure — Podman Docker Replacement

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Podman](https://img.shields.io/badge/Podman-4.x-purple)](https://podman.io)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue)](https://github.com/features/actions)

> **Zero-dependency, rootless, daemonless container orchestration for the ZYN Empire agent stack. No Docker required. Runs 24/7 via systemd on any Linux VM (GCP, AWS, Azure, bare metal).**

---

## What Is This?

This repository contains a **complete, production-ready replacement for Docker** using [Podman](https://podman.io) — a fully open-source, rootless, daemonless container runtime. It runs the entire ZYN Empire AI agent infrastructure:

| Service | Port | Description |
|---------|------|-------------|
| **ZYN Backend** | 3000 | Node.js agent API — SAM.gov proxy, Discord relay, scheduler |
| **MiroFish Engine** | 5001 | Swarm Intelligence — bid probability, market forecasting |
| **Ollama Local AI** | 11434 | Free unlimited local LLM (llama3, mistral, codellama) |
| **Firecrawl** | 3002 | Open-source web scraping engine |
| **Redis** | 6379 | Job queue, caching, agent state |
| **Watchtower** | — | Auto-updates containers when new images are published |

---

## Why Podman Over Docker?

| Feature | Docker | Podman |
|---------|--------|--------|
| Requires daemon | ✅ Yes (dockerd) | ❌ No daemon |
| Rootless by default | ❌ No | ✅ Yes |
| systemd integration | Limited | Native (quadlets) |
| Open source license | Mixed | 100% Apache 2.0 |
| Docker Compose compatible | ✅ | ✅ (podman-compose) |
| Kubernetes pod format | ❌ | ✅ Native pods |
| Security | Lower | Higher (no root daemon) |
| Cost | Paid for business | Free forever |

---

## Quick Start (GCP VM / Ubuntu 22.04+)

```bash
# 1. Clone this repo
git clone https://github.com/Ancient1ZION/zyn-empire-runtime.git
cd zyn-empire-runtime

# 2. Run the one-command installer
chmod +x install.sh && ./install.sh

# 3. Configure your environment
cp .env.example .env
nano .env  # Add your API keys

# 4. Launch all services
./zyn-start.sh

# 5. Verify everything is running
./zyn-status.sh
```

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                 GCP VM (35.185.40.28)               │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │         ZYN Pod (Podman Rootless)           │   │
│  │                                             │   │
│  │  ┌──────────┐  ┌───────────┐  ┌─────────┐  │   │
│  │  │  ZYN     │  │ MiroFish  │  │ Ollama  │  │   │
│  │  │ Backend  │  │  Engine   │  │  AI     │  │   │
│  │  │ :3000    │  │  :5001    │  │ :11434  │  │   │
│  │  └──────────┘  └───────────┘  └─────────┘  │   │
│  │                                             │   │
│  │  ┌──────────┐  ┌───────────┐                │   │
│  │  │Firecrawl │  │  Redis    │                │   │
│  │  │  :3002   │  │  :6379    │                │   │
│  │  └──────────┘  └───────────┘                │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  systemd quadlets → auto-restart on crash/reboot    │
│  GitHub Actions → health checks every 5 minutes     │
│  Watchtower → auto-update containers                │
└─────────────────────────────────────────────────────┘
```

---

## File Structure

```
zyn-empire-runtime/
├── README.md                    # This file
├── install.sh                   # One-command installer (Podman + all deps)
├── zyn-start.sh                 # Start all ZYN services
├── zyn-stop.sh                  # Stop all services
├── zyn-status.sh                # Health check dashboard
├── zyn-update.sh                # Pull latest images + restart
├── .env.example                 # Environment variables template
│
├── backend/
│   ├── server.js                # ZYN Agent API server (Node.js)
│   ├── package.json             # Node dependencies
│   ├── agents/
│   │   ├── adam.js              # Adam — SAM.gov GovCon Scout
│   │   ├── sara.js              # Sara — Email outreach via GAS
│   │   ├── noah.js              # Noah — Empire Commander
│   │   ├── elijah.js            # Elijah — Intelligence Analyst
│   │   ├── enoch.js             # Enoch — Grant Scanner
│   │   ├── ezekiel.js           # Ezekiel — API Health Monitor
│   │   └── scheduler.js         # 24/7 cron scheduler
│   └── Containerfile            # Podman build file (Docker-compatible)
│
├── pods/
│   ├── zyn-pod.yaml             # Podman pod definition (all services)
│   ├── mirofish-pod.yaml        # MiroFish swarm engine pod
│   └── ollama-pod.yaml          # Ollama local AI pod
│
├── systemd/
│   ├── zyn-backend.service      # systemd unit — ZYN backend
│   ├── zyn-mirofish.service     # systemd unit — MiroFish
│   ├── zyn-ollama.service       # systemd unit — Ollama
│   ├── zyn-redis.service        # systemd unit — Redis
│   └── zyn-watcher.service      # systemd unit — health watcher
│
├── compose/
│   ├── podman-compose.yml       # Podman Compose (Docker Compose compatible)
│   └── docker-compose.yml       # Docker Compose fallback
│
├── monitoring/
│   ├── healthcheck.sh           # Health check script
│   ├── watchdog.sh              # Auto-restart on failure
│   └── discord-alert.sh         # Discord webhook alerts
│
└── .github/
    └── workflows/
        ├── health-monitor.yml   # GitHub Actions — 5-min health checks
        ├── auto-deploy.yml      # GitHub Actions — auto-deploy on push
        └── weekly-update.yml    # GitHub Actions — weekly image updates
```

---

## Agent Capabilities (24/7 Autonomous)

| Agent | Schedule | Function |
|-------|----------|----------|
| **Noah** | Every 60min | Empire standup, Discord heartbeat, TTS alerts |
| **Adam** | Every 4hr | SAM.gov scan (via GAS), USASpending prospects |
| **Sara** | Every 2hr | AI-crafted email outreach via GAS relay (Groq) |
| **Elijah** | Every 6hr | Market intelligence, vertical analysis |
| **Enoch** | Every 6hr | Grants.gov + SBIR + SBA scanner |
| **Ezekiel** | Every 30min | API health checks, Discord alerts |
| **Mariam** | Every 12hr | MiroFish deep research, dossier generation |
| **Malik** | Every 10min | HOT lead detection, Stripe monitoring |
| **Juda** | Every 15min | Security audit, VM health |
| **Caleb** | Market hours | Trading signals, TradingView integration |

---

## Environment Variables

See `.env.example` for the complete list. Key variables:

```bash
SAM_API_KEY=M4zL5pEHU93jRV6lEN64ZNAHnKbqwFF9Ed6xoVN8
GROQ_API_KEY=gsk_...
GAS_EMAIL_URL=https://script.google.com/macros/s/...
GAS_SAM_URL=https://script.google.com/macros/s/...
DISCORD_WEBHOOK=https://discord.com/api/webhooks/...
```

---

## GitHub Actions — 24/7 Monitoring

This repo includes GitHub Actions workflows that:
- **Ping your GCP VM every 5 minutes** and alert Discord if it goes down
- **Auto-deploy** when you push changes to main
- **Weekly auto-update** of all container images
- **Self-healing**: restarts failed containers via SSH

---

## License

MIT — Free forever. No trials, no limits, no paid tiers.

---

*Built for ZYN Empire — Z.Y.N. Supply & Logistics LLC (SDVOSB) · zynsupplyandlogistics.com*
