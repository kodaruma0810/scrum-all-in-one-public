import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import dotenv from 'dotenv';
import { resolve } from 'path';

// 環境に応じた .env ファイルを読み込み
// dotenv は既存の環境変数を上書きしないため、PaaS（Render等）で
// 環境変数が直接注入されている場合はそちらが優先される
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv.config({ path: resolve(process.cwd(), '../../', envFile) });
dotenv.config({ path: resolve(process.cwd(), '../../', '.env') });

// 本番環境では必須の環境変数をチェック
if (process.env.NODE_ENV === 'production') {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

import { setupRoutes } from './routes/index.js';
import { errorMiddleware } from './middleware/error.js';

const app = new Hono();

app.use('*', logger());
app.use('*', secureHeaders());
app.use(
  '*',
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use('*', errorMiddleware);

app.get('/health', (c) => c.json({ status: 'ok' }));

setupRoutes(app).then(() => {
  serve(
    { fetch: app.fetch, port: Number(process.env.PORT) || 4000 },
    (info) => {
      console.log(`Backend running on http://localhost:${info.port}`);
    }
  );
});
