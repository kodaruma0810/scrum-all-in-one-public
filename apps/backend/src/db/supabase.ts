import { createClient } from '@supabase/supabase-js';

/**
 * Supabase クライアント (サーバーサイド用)
 * 現在は Prisma を主に使用していますが、将来 Supabase Auth や
 * Storage を使う場合にこのクライアントを利用します。
 */
export const supabase = createClient(
  process.env.SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);
