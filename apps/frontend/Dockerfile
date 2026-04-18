# ============================================================
# Frontend Dockerfile (マルチステージビルド)
# ビルドコンテキスト: リポジトリルート (.)
# ============================================================

FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable

# 依存関係のインストール（全ソースコードも先にコピー）
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY apps/frontend/ ./apps/frontend/

RUN pnpm install --frozen-lockfile --ignore-scripts && \
    pnpm rebuild esbuild

# VITE_API_URL: 空 = nginx proxy 経由（相対パス）
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}

# Vite ビルド（npx 経由で直接実行）
RUN cd apps/frontend && npx vite build

# ============================================================
# 本番イメージ (nginx)
# ============================================================
FROM nginx:alpine

COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
