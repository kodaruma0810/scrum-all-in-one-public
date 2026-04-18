#!/bin/bash
# ============================================================
# Scrum All-in-One セルフホスト セットアップスクリプト
# ============================================================
# 使い方:
#   chmod +x setup.sh
#   ./setup.sh
# ============================================================

set -e

echo "======================================"
echo " Scrum All-in-One セットアップ"
echo "======================================"

# .env.production が存在しない場合はテンプレートからコピー
if [ ! -f .env.production ]; then
  echo ""
  echo "[1/4] .env.production を作成中..."
  cp .env.example .env.production

  # ランダムなシークレットを自動生成
  JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || head -c 64 /dev/urandom | od -An -tx1 | tr -d ' \n')
  JWT_REFRESH_SECRET=$(openssl rand -hex 32 2>/dev/null || head -c 64 /dev/urandom | od -An -tx1 | tr -d ' \n')
  POSTGRES_PASSWORD=$(openssl rand -hex 16 2>/dev/null || head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n')

  # sed で値を置き換え
  sed -i "s|JWT_SECRET=local-dev-jwt-secret-change-in-production|JWT_SECRET=${JWT_SECRET}|" .env.production
  sed -i "s|JWT_REFRESH_SECRET=local-dev-jwt-refresh-secret-change-in-production|JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}|" .env.production
  sed -i "s|POSTGRES_PASSWORD=change-me-to-a-strong-password|POSTGRES_PASSWORD=${POSTGRES_PASSWORD}|" .env.production
  sed -i "s|NODE_ENV=development|NODE_ENV=production|" .env.production
  sed -i "s|FRONTEND_URL=http://localhost:3000|FRONTEND_URL=http://localhost|" .env.production

  echo "  → .env.production を作成しました（シークレットは自動生成済み）"
else
  echo ""
  echo "[1/4] .env.production は既に存在します（スキップ）"
fi

# DB を起動
echo ""
echo "[2/4] データベースを起動中..."
docker compose up -d db
echo "  → PostgreSQL の起動を待機中..."
sleep 5

# 全サービスをビルド＆起動
echo ""
echo "[3/4] 全サービスをビルド＆起動中..."
docker compose up -d --build

# シードデータを投入
echo ""
echo "[4/4] 初期データを投入中..."
docker compose exec backend sh -c "npx tsx prisma/seed.ts" 2>/dev/null || echo "  → シードデータの投入をスキップ（既に存在する可能性があります）"

echo ""
echo "======================================"
echo " セットアップ完了！"
echo "======================================"
echo ""
echo " アクセス: http://localhost"
echo ""
echo " デフォルトアカウント:"
echo "   Email:    admin@example.com"
echo "   Password: admin123"
echo ""
echo " ※ 本番利用前にパスワードを変更してください"
echo "======================================"
