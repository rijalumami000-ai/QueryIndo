#!/usr/bin/env bash
# ==============================================================================
# QUERYINDO - Production Deployment Script for VPS
# ==============================================================================
set -e

APP_DIR="/var/www/queryindo"
cd "$APP_DIR"

echo "=========================================================="
echo "🚀 [1/5] Menarik Kode Terbaru dari GitHub (origin/main)..."
echo "=========================================================="
git fetch --all
git reset --hard origin/main

# Use isolated Node 22 if present (preserves Node 20 for other apps)
if [ -d "/opt/node22/bin" ]; then
  export PATH="/opt/node22/bin:$PATH"
elif [ -d "/home/Rijalumami/node22/bin" ]; then
  export PATH="/home/Rijalumami/node22/bin:$PATH"
fi

echo "=========================================================="
echo "📦 [2/5] Menginstal Dependensi & Build Frontend (Astro SSR)..."
echo "=========================================================="
cd "$APP_DIR/frontend"
npm install --no-audit --no-fund
npm run build
cd "$APP_DIR"

echo "=========================================================="
echo "⚡ [3/5] Mengelola Proses PM2 Frontend (Astro Server)..."
echo "=========================================================="
NODE_BIN="$(which node)"
if [ -f "/opt/node22/bin/node" ]; then
  NODE_BIN="/opt/node22/bin/node"
elif [ -f "/home/Rijalumami/node22/bin/node" ]; then
  NODE_BIN="/home/Rijalumami/node22/bin/node"
fi

if pm2 list | grep -q "queryindo-frontend"; then
  PORT=4321 HOST=127.0.0.1 pm2 restart queryindo-frontend --update-env
else
  PORT=4321 HOST=127.0.0.1 pm2 start "$APP_DIR/frontend/dist/server/entry.mjs" --name queryindo-frontend --interpreter "$NODE_BIN"
fi

echo "=========================================================="
echo "🔨 [4/5] Mengompilasi Go Backend & Restart PM2..."
echo "=========================================================="
cd "$APP_DIR/backend"
go mod tidy
go build -ldflags='-s -w' -o queryindo-backend .
chmod +x queryindo-backend
pm2 restart queryindo-backend || pm2 start queryindo-backend --name queryindo-backend
cd "$APP_DIR"

echo "=========================================================="
echo "🔄 [5/5] Memeriksa & Mengupdate Konfigurasi Nginx..."
echo "=========================================================="
sudo cp "$APP_DIR/nginx-queryindo.conf" /etc/nginx/sites-available/queryindo
sudo nginx -t
sudo systemctl reload nginx
pm2 save

echo "=========================================================="
echo "✨ DEPLOYMENT SELESAI! Web aktif di https://queryindo.com"
echo "=========================================================="

