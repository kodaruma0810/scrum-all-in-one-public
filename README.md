# Scrum All-in-One

スクラム開発に必要な機能をすべて1つにまとめた、セルフホスト型 Web アプリケーションです。

Docker Compose で簡単に立ち上げて、チームですぐに使い始められます。

## 主な機能

- **チケット管理** - カンバンボード、バックログ、ドラッグ&ドロップ
- **ゴール管理** - インクリメント(PI) / 長期ゴール / スプリントゴールの3層階層
- **スプリント管理** - 計画・実行・完了、キャパシティ管理、ベロシティ追跡
- **デイリースクラム** - 出欠管理、Yesterday/Today/Blockers、バーンダウンチャート、タイマー
- **レトロスペクティブ** - KPT形式、カード/ホワイトボード、投票、アクションアイテム
- **ワーキングアグリーメント** - チームルール管理、変更履歴、公開共有リンク
- **ダッシュボード** - スプリント進捗、ゴール達成状況、ベロシティ推移
- **検索** - チケット・ゴールの横断検索（Ctrl+K）
- **モバイル対応** - スマホ・タブレットからも利用可能

## クイックスタート

### 必要なもの

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 起動

```bash
git clone https://github.com/kodaruma0810/scrum-all-in-one.git
cd scrum-all-in-one
bash setup.sh
```

ブラウザで `http://localhost` にアクセスしてください。

### デフォルトアカウント

| メールアドレス | パスワード |
|---------------|-----------|
| `admin@example.com` | `admin123` |

### 停止・再起動

```bash
# 停止
docker compose down

# 再起動
docker compose up -d

# コード変更後の再起動
docker compose up -d --build
```

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | React, TypeScript, Vite, Tailwind CSS, Radix UI |
| バックエンド | Hono, Node.js, TypeScript, Prisma |
| データベース | PostgreSQL 16 |
| インフラ | Docker Compose, Nginx, Redis |

## ドキュメント

詳しい使い方や設定方法は [Documents/README.md](Documents/README.md) を参照してください。

- [まるわかりガイド](Documents/README.md) - 全機能の使い方、環境構築、トラブルシューティング
- [システム全体像](Documents/システム全体像.md) - アーキテクチャ、技術詳細
- [システム利用ガイド](Documents/システム利用ガイド.md) - ユーザー・管理者向けガイド

## ローカル開発

コードを修正しながら開発する場合は、Docker ではなくローカル開発サーバーを使います。

```bash
# 前提: Node.js 20+, pnpm 8+, Supabase CLI が必要
pnpm install
pnpm supabase:start
pnpm setup
pnpm dev
```

- フロントエンド: `http://localhost:5173`
- バックエンド API: `http://localhost:4000`

## ライセンス

MIT License
