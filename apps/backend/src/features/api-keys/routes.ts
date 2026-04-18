import { Hono } from 'hono';
import { CreateApiKeySchema } from './types.js';
import * as service from './service.js';

type UserVar = { Variables: { user: { sub: string; organizationId: string } } };

const router = new Hono<UserVar>();

// POST / -- APIキー作成
router.post('/', async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const parsed = CreateApiKeySchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Validation error', details: parsed.error.errors }, 400);
    }
    const data = await service.generateApiKey(parsed.data, user.organizationId, user.sub);
    return c.json({ data }, 201);
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET / -- 自分のAPIキー一覧
router.get('/', async (c) => {
  try {
    const user = c.get('user');
    const data = await service.listApiKeys(user.sub);
    return c.json({ data });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE /:id -- APIキー取り消し
router.delete('/:id', async (c) => {
  try {
    const user = c.get('user');
    const { id } = c.req.param();
    await service.revokeApiKey(id, user.sub);
    return c.json({ success: true });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    if (e.statusCode === 404) {
      return c.json({ error: e.message ?? 'Not found' }, 404);
    }
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default router;
