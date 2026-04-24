#!/bin/bash
# ZYN Empire Runtime -- One-Command Installer
# Podman Docker replacement + all ZYN dependencies
# Ubuntu 22.04+ / Debian 12 / RHEL 9 / Fedora 38+
set -euo pipefail

log()  { echo "[ZYN] $1"; }
warn() { echo "[WARN] $1"; }

log "Starting ZYN Empire Runtime installation..."
OS=$(grep -w "ID" /etc/os-release | cut -d= -f2 | tr -d '"')
log "Detected OS: $OS"

# 1. Install Podman
log "Installing Podman (open-source Docker replacement)..."
case "$OS" in
  ubuntu|debian)
    sudo apt-get update -qq
    sudo apt-get install -y podman podman-compose buildah skopeo slirp4netns
    ;;
  fedora)
    sudo dnf install -y podman podman-compose buildah skopeo
    ;;
  rhel|centos|rocky|almalinux)
    sudo dnf install -y container-tools podman-compose
    ;;
  *)
    warn "Unknown OS - attempting generic install"
    curl -fsSL https://get.podman.io | bash
    ;;
esac
podman --version
log "Podman installed successfully"

# 2. Install Node.js 20
log "Installing Node.js 20..."
if ! command -v node &>/dev/null || node --version | grep -qv "v20"; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
  sudo apt-get install -y nodejs 2>/dev/null || sudo dnf install -y nodejs 2>/dev/null
fi
log "Node: $(node --version)"

# 3. Install PM2
log "Installing PM2 process manager..."
sudo npm install -g pm2
log "PM2: $(pm2 --version)"

# 4. Install Git
command -v git &>/dev/null || sudo apt-get install -y git 2>/dev/null || sudo dnf install -y git

# 5. Configure rootless Podman
log "Configuring rootless Podman containers..."
sudo loginctl enable-linger $(whoami) 2>/dev/null || true
USERNAME=$(whoami)
grep -q "$USERNAME" /etc/subuid 2>/dev/null || echo "$USERNAME:100000:65536" | sudo tee -a /etc/subuid
grep -q "$USERNAME" /etc/subgid 2>/dev/null || echo "$USERNAME:100000:65536" | sudo tee -a /etc/subgid
podman network create zyn-net 2>/dev/null || true
systemctl --user enable --now podman.socket 2>/dev/null || true

# 6. Install Ollama
log "Installing Ollama local AI..."
if ! command -v ollama &>/dev/null; then
  curl -fsSL https://ollama.com/install.sh | sh
fi

# 7. Pull base images
log "Pulling container images..."
podman pull docker.io/redis:7-alpine &
podman pull docker.io/library/node:20-alpine &
podman pull ghcr.io/666ghj/mirofish:latest 2>/dev/null &
wait
log "Images ready"

# 8. Install backend
log "Installing ZYN backend..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/backend" && npm install --production && cd "$SCRIPT_DIR"

# 9. Install systemd units
SYSTEMD_DIR="$HOME/.config/systemd/user"
mkdir -p "$SYSTEMD_DIR"
cp "$SCRIPT_DIR/systemd/"*.service "$SYSTEMD_DIR/" 2>/dev/null || true
systemctl --user daemon-reload 2>/dev/null || true

# 10. Create .env
[ -f "$SCRIPT_DIR/.env" ] || cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"

# 11. Firewall
command -v ufw &>/dev/null && sudo ufw allow 3000,5001,11434/tcp 2>/dev/null || true
command -v firewall-cmd &>/dev/null && sudo firewall-cmd --permanent --add-port={3000,5001,11434}/tcp && sudo firewall-cmd --reload 2>/dev/null || true

log "======================================================"
log " ZYN RUNTIME INSTALLED SUCCESSFULLY"
log "======================================================"
log " Next: nano .env  |  ./zyn-start.sh  |  ./zyn-status.sh"
log " Backend: http://localhost:3000/ping"
log " MiroFish: http://localhost:5001"
log " Ollama: http://localhost:11434"
