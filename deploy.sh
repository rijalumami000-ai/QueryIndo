#!/usr/bin/env bash
# ==============================================================================
# QUERYINDO - Production Deployment Script for VPS
# ==============================================================================
set -e

APP_DIR="/var/www/queryindo"
cd "$APP_DIR"

echo "=========================================================="
echo "🚀 [1/4] Menarik Kode Terbaru dari GitHub (origin/main)..."
echo "=========================================================="
git fetch --all
git reset --hard origin/main

echo "=========================================================="
echo "📦 [2/4] Menginstal Dependensi & Build Frontend (Vite)..."
echo "=========================================================="
npm install
npm run build

echo "=========================================================="
echo "🔨 [3/4] Mengompilasi Go Backend & Restart PM2..."
echo "=========================================================="
cd "$APP_DIR/backend"
go mod tidy
go build -ldflags='-s -w' -o queryindo-backend .
chmod +x queryindo-backend
pm2 restart queryindo-backend || pm2 start queryindo-backend --name queryindo-backend
cd "$APP_DIR"

echo "=========================================================="
echo "🔄 [4/4] Memeriksa & Me-reload Nginx..."
echo "=========================================================="
sudo nginx -t
sudo systemctl reload nginx

echo "=========================================================="
echo "✨ DEPLOYMENT SELESAI! Web aktif di https://queryindo.com"
echo "=========================================================="
