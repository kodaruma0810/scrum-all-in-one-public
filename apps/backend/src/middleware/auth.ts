import { createMiddleware } from 'hono/factory';
import jwt from 'jsonwebtoken';
import { validateApiKey } from '../features/api-keys/service.js';

export interface JwtPayload {
  sub: string;
  id: string;
  email: string;
  role: string;
  organizationId: string;
}

type Variables = {
  user: JwtPayload;
};

const DEV_USER: JwtPayload = {
  sub: 'dev-user-id',
  id: 'dev-user-id',
  email: 'dev@example.com',
  role: 'ADMIN',
  organizationId: 'dev-org-id',
};

export const authMiddleware = createMiddleware<{ Variables: Variables }>(
  async (c, next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // APIキー認証: "ApiKey sk_xxx..."
    if (authHeader.startsWith('ApiKey ')) {
      const rawKey = authHeader.slice(7);
      const userInfo = await validateApiKey(rawKey);
      if (!userInfo) {
        return c.json({ error: 'Invalid or revoked API key' }, 401);
      }
      c.set('user', {
        sub: userInfo.id,
        id: userInfo.id,
        email: userInfo.email,
        role: userInfo.role,
        organizationId: userInfo.organizationId,
      });
      await next();
      return;
    }

    // JWT認証: "Bearer <token>"
    if (!authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.slice(7);

    // dev-token bypass（本番環境では無効）
    if (token === 'dev-token' && process.env.NODE_ENV !== 'production') {
      c.set('user', DEV_USER);
      await next();
      return;
    }

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET is not configured');
      }

      const payload = jwt.verify(token, secret) as JwtPayload;
      // JWT の sub フィールドを id としてマッピング（ルートが c.get('user').id でアクセスするため）
      c.set('user', { ...payload, id: payload.sub });
      await next();
    } catch {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }
  }
);
