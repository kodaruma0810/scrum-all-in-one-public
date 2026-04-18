# ============================================================
# Backend Dockerfile (マルチステージビルド)
# ビルドコンテキスト: リポジトリルート (.)
# ============================================================

FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app

# pnpm を有効化
RUN corepack enable

# 依存関係のインストール（キャッシュ効率化のためソースより先にコピー）
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/

# postinstall (prisma generate) はスキーマ未コピーで失敗するためスキップ
RUN pnpm install --frozen-lockfile --ignore-scripts

# ソースコードをコピー
COPY packages/shared/ ./packages/shared/
COPY apps/backend/ ./apps/backend/

# Prisma クライアント生成 & TypeScript ビルド
RUN cd apps/backend && npx prisma generate
RUN pnpm --filter backend run build

# ============================================================
# 本番イメージ
# ============================================================
FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app

RUN corepack enable

# 必要なファイルのみコピー
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/ ./packages/
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/apps/backend/dist/ ./apps/backend/dist/
COPY --from=builder /app/apps/backend/prisma/ ./apps/backend/prisma/
COPY --from=builder /app/node_modules/ ./node_modules/
COPY --from=builder /app/apps/backend/node_modules/ ./apps/backend/node_modules/

WORKDIR /app/apps/backend

EXPOSE 4000

# 起動時にマイグレーションを実行してからサーバーを起動
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
