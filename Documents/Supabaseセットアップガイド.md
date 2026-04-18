# Supabase セットアップガイド

このプロジェクトでは **Supabase** をバックエンドの基盤として使用しています。
Supabase がデータベース（PostgreSQL）、認証、ストレージ、管理画面をまとめて提供してくれるため、
バックエンドの管理がシンプルになります。

---

## 全体の仕組み（図解）

```
┌─────────────────────────────────────────────────┐
│  あなたの PC (ローカル開発)                        │
│                                                   │
│  ┌──────────┐    ┌──────────┐    ┌─────────────┐ │
│  │ フロント  │───→│ バック    │───→│  Supabase   │ │
│  │ React     │    │ Hono     │    │  (Docker)   │ │
│  │ :3000     │    │ :4000    │    │             │ │
│  └──────────┘    └──────────┘    │ PostgreSQL  │ │
│                                   │ :54322      │ │
│                                   │             │ │
│                                   │ Studio(GUI) │ │
│                                   │ :54323      │ │
│                                   └─────────────┘ │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  本番サーバー                                     │
│                                                   │
│  ┌──────────┐    ┌──────────┐    ┌─────────────┐ │
│  │ フロント  │───→│ バック    │───→│  Supabase   │ │
│  │ (ビルド)  │    │ (ビルド)  │    │ (セルフ     │ │
│  └──────────┘    └──────────┘    │  ホスト版)  │ │
│                                   └─────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## 前提条件

以下のソフトウェアが必要です：

| ソフトウェア | バージョン | 用途 |
|---|---|---|
| **Node.js** | 18 以上 | JavaScript 実行環境 |
| **pnpm** | 9 以上 | パッケージマネージャー |
| **Docker Desktop** | 最新版 | Supabase のローカル実行に必要 |
| **Supabase CLI** | 2.x | npx 経由で自動インストール済み |

### Docker Desktop のインストール（まだの方）

1. https://www.docker.com/products/docker-desktop/ にアクセス
2. 「Download for Windows」をクリック
3. インストーラーを実行
4. インストール後、**PCを再起動**
5. Docker Desktop を起動し、左下に「Engine running」（緑色）と表示されるまで待つ

> **ポイント**: Docker Desktop は「パソコンの中に小さなサーバーを作るソフト」です。
> Supabase はこの Docker の上で動きます。

---

## ローカル開発のセットアップ手順

### 初回セットアップ（1回だけ）

```bash
# 1. プロジェクトのルートに移動
cd scrum-all-in-one

# 2. パッケージをインストール
pnpm install

# 3. Supabase を起動（初回は Docker イメージのダウンロードで数分かかります）
pnpm supabase:start
```

`supabase:start` が完了すると、以下のような情報がターミナルに表示されます：

```
         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
  S3 Storage URL: http://127.0.0.1:54321/storage/v1/s3
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
        ...
```

```bash
# 4. 環境変数ファイルを作成（初回のみ）
cp .env.example .env.local

# 5. Prisma クライアントを生成
pnpm db:generate

# 6. Prisma のマイグレーション（テーブル作成）
pnpm db:migrate
```

> **注意**: `pnpm db:migrate` を実行すると「マイグレーション名」を聞かれます。
> 初回は `init` と入力してください。

### 毎日の開発作業

```bash
# 1. Docker Desktop を起動（起動していなければ）

# 2. Supabase を起動
pnpm supabase:start

# 3. フロントエンド＆バックエンドを起動
pnpm dev

# 4. ブラウザで開く
#    アプリ:       http://localhost:3000
#    管理画面:     http://127.0.0.1:54323  ← Supabase Studio
```

### Supabase を停止する

```bash
# 開発を終了するとき
pnpm supabase:stop
```

---

## Supabase Studio（管理画面）の使い方

**http://127.0.0.1:54323** をブラウザで開くと、Supabase Studio（管理画面）が使えます。

### できること

| 機能 | 説明 |
|---|---|
| **Table Editor** | テーブルのデータを Excel のように閲覧・編集できる |
| **SQL Editor** | SQL を直接実行できる（データの確認や修正に便利） |
| **Authentication** | ユーザーの一覧や管理 |
| **Storage** | ファイルの管理 |
| **Logs** | ログの確認 |

> **ポイント**: 以前は pgAdmin や DBeaver 等のツールが必要でしたが、
> Supabase Studio だけでデータベースの中身を確認・編集できます。

---

## よく使うコマンド一覧

| コマンド | 何をするか |
|---|---|
| `pnpm supabase:start` | Supabase を起動（DB、認証、ストレージ等すべて） |
| `pnpm supabase:stop` | Supabase を停止 |
| `pnpm supabase:reset` | DB をリセット（マイグレーション再実行＋シードデータ投入） |
| `pnpm supabase:status` | Supabase の起動状態を確認 |
| `pnpm supabase:studio` | Studio の URL を表示 |
| `pnpm dev` | フロントエンド＆バックエンドを起動 |
| `pnpm dev:backend` | バックエンドだけ起動 |
| `pnpm dev:frontend` | フロントエンドだけ起動 |
| `pnpm db:generate` | Prisma クライアントを再生成 |
| `pnpm db:migrate` | Prisma マイグレーションを実行 |
| `pnpm db:seed` | シードデータを投入 |
| `pnpm db:studio` | Prisma Studio を起動（もう一つの DB 管理画面） |

---

## ローカル開発と本番の違い

| 項目 | ローカル開発 | 本番環境 |
|---|---|---|
| **Supabase** | Docker で自動起動 | セルフホスト版を別サーバーに構築 |
| **DB 接続先** | `127.0.0.1:54322` | 本番サーバーのアドレス |
| **環境変数ファイル** | `.env.local` | `.env.production` |
| **データ** | 開発用（消しても OK） | 本番データ（大切に扱う） |
| **管理画面** | `127.0.0.1:54323` | 本番サーバーの Studio URL |

> **重要**: ローカルの DB と本番の DB は完全に分離されています。
> ローカルでどんなデータを消しても、本番には影響しません。安心してください。

---

## 本番環境（セルフホスト版 Supabase）の構築

本番環境では、別のサーバーにセルフホスト版 Supabase を構築します。

### 手順の概要

1. 本番サーバーに Docker と Docker Compose をインストール
2. Supabase のセルフホスト版をクローン:
   ```bash
   git clone --depth 1 https://github.com/supabase/supabase
   cd supabase/docker
   cp .env.example .env
   ```
3. `.env` を編集（パスワード等を強力なものに変更）
4. `docker compose up -d` で起動
5. このプロジェクトの `.env.production` に本番の接続情報を記載

詳細な手順は公式ドキュメントを参照:
https://supabase.com/docs/guides/self-hosting/docker

---

## データベースのマイグレーション管理

### スキーマ変更の流れ

Prisma でスキーマを変更した場合：

```bash
# 1. schema.prisma を編集

# 2. マイグレーションを生成・適用
pnpm db:migrate
# → マイグレーション名を聞かれるので入力（例: add_new_column）

# 3. Prisma クライアントを再生成
pnpm db:generate
```

Supabase SQL で直接変更した場合：

```bash
# 1. マイグレーションファイルを作成
pnpm supabase:migration:new my_change_name
# → supabase/migrations/ にファイルが生成される

# 2. 生成されたファイルに SQL を記述

# 3. DB をリセットして適用
pnpm supabase:reset
```

---

## トラブルシューティング

### 「Docker is not running」と表示される

→ Docker Desktop を起動してください。タスクバーのクジラアイコンが表示され、
  「Engine running」になるまで待ってください。

### `supabase start` が途中で止まる

→ 初回は Docker イメージのダウンロードに時間がかかります（5〜10分程度）。
  しばらく待ってください。それでもダメな場合:
  ```bash
  pnpm supabase:stop
  pnpm supabase:start
  ```

### DB に接続できない

→ Supabase が起動しているか確認:
  ```bash
  pnpm supabase:status
  ```
  停止している場合は `pnpm supabase:start` で起動してください。

### DB をまっさらにしたい

→ リセットコマンドを使います:
  ```bash
  pnpm supabase:reset
  ```
  マイグレーションが再実行され、シードデータも再投入されます。
