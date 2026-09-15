#!/bin/bash
# ==============================================================================
# QUERYINDO - One-Click Production Deployment Script for VPS (Linux / Ubuntu)
# ==============================================================================
set -e

APP_DIR="/var/www/queryindo"
cd $APP_DIR

echo "=========================================================="
echo "🚀 [1/5] Memulai Proses Deployment QUERYINDO Production..."
echo "=========================================================="

# 1. Update source code from GitHub
echo "📥 [2/5] Menarik update kode terbaru dari GitHub repository..."
git fetch --all
git reset --hard origin/main

# 2. Build Frontend
echo "📦 [3/5] Menginstal dependensi & membangun bundle Frontend Vite..."
npm install
npm run build

# 3. Build Go Backend
echo "⚡ [4/5] Mengompilasi Go Backend API..."
cd "$APP_DIR/backend"
go mod tidy
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o server main.go
chmod +x server
cd "$APP_DIR"

# 4. Restart Services
echo "🔄 [5/5] Me-restart Go Backend Service & me-reload Nginx..."
sudo systemctl restart queryindo-backend || true
sudo systemctl reload nginx || sudo systemctl restart nginx

echo "=========================================================="
echo "✨ DEPLOYMENT SELESAI! Web aktif di https://queryindo.com"
echo "=========================================================="
