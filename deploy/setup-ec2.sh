#!/bin/bash
# ==============================================================================
# Skrip Otomasi Persiapan Server AWS EC2 (Ubuntu 22.04 / 24.04 LTS) untuk Lapang.id
# ==============================================================================
set -e

echo "🚀 [1/5] Memperbarui paket sistem Ubuntu..."
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release git ufw fail2ban

echo "🐳 [2/5] Memasang Docker Engine & Docker Compose Plugin resmi..."
# Tambah GPG key resmi Docker
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Tambah repositori apt Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "👤 [3/5] Mengatur hak akses user ke Docker..."
sudo usermod -aG docker "$USER"

echo "🛡️ [4/5] Mengonfigurasi UFW Firewall (Hanya Port 22, 80, 443)..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH Port'
sudo ufw allow 80/tcp comment 'HTTP Nginx'
sudo ufw allow 443/tcp comment 'HTTPS SSL Nginx'
sudo ufw --force enable

echo "📁 [5/5] Menyiapkan direktori proyek di server..."
mkdir -p "$HOME/lapang"
mkdir -p "$HOME/lapang/nginx/conf.d"

echo "=============================================================================="
echo "✅ SETUP EC2 SELESAI!"
echo "Untuk mengaktifkan grup docker tanpa logout, jalankan: newgrp docker"
echo "Periksa docker dengan: docker --version && docker compose version"
echo "=============================================================================="
