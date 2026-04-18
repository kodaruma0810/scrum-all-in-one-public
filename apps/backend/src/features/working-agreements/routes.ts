import { Hono } from 'hono';
import { z } from 'zod';
import * as service from './service.js';

type UserVar = {
  Variables: {
    user: { sub: string; organizationId: string; role: string };
    teamId: string;
  };
};

const CreateCategorySchema = z.object({
  name: z.string().min(1).max(100),
  orderIndex: z.number().int().min(0).optional(),
});

const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  orderIndex: z.number().int().min(0).optional(),
});

const CreateRuleSchema = z.object({
  categoryId: z.string().min(1).nullish(),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  agreedAt: z.coerce.date(),
  proposedById: z.string().min(1),
  orderIndex: z.number().int().min(0).optional(),
});

const UpdateRuleSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().nullable().optional(),
  agreedAt: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
  categoryId: z.string().nullable().optional(),
});

const router = new Hono<UserVar>();

// GET / -- カテゴリ＋ルール一覧（未分類含む）
router.get('/', async (c) => {
  try {
    const teamId = c.get('teamId');
    const data = await service.listAll(teamId);
    return c.json({ data });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /active -- 有効ルールのみ（共有ビュー用）
router.get('/active', async (c) => {
  try {
    const teamId = c.get('teamId');
    const data = await service.getActiveRules(teamId);
    return c.json({ data });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /categories -- カテゴリ作成
router.post('/categories', async (c) => {
  try {
    const teamId = c.get('teamId');
    const body = await c.req.json();
    const parsed = CreateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Validation error', details: parsed.error.errors }, 400);
    }
    const data = await service.createCategory(teamId, parsed.data);
    return c.json({ data }, 201);
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === 'P2002') {
      return c.json({ error: '同名のカテゴリが既に存在します' }, 409);
    }
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PUT /categories/:id -- カテゴリ更新
router.put('/categories/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const parsed = UpdateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Validation error', details: parsed.error.errors }, 400);
    }
    await service.updateCategory(id, parsed.data);
    return c.json({ success: true });
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === 'P2002') {
      return c.json({ error: '同名のカテゴリが既に存在します' }, 409);
    }
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE /categories/:id -- カテゴリ削除
router.delete('/categories/:id', async (c) => {
  try {
    const { id } = c.req.param();
    await service.deleteCategory(id);
    return c.json({ success: true });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /rules -- ルール作成
router.post('/rules', async (c) => {
  try {
    const user = c.get('user');
    const teamId = c.get('teamId');
    const body = await c.req.json();
    const parsed = CreateRuleSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Validation error', details: parsed.error.errors }, 400);
    }
    const data = await service.createRule({ ...parsed.data, teamId }, user.sub);
    return c.json({ data }, 201);
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PUT /rules/:id -- ルール更新（カテゴリ変更含む）
router.put('/rules/:id', async (c) => {
  try {
    const user = c.get('user');
    const { id } = c.req.param();
    const body = await c.req.json();
    const parsed = UpdateRuleSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Validation error', details: parsed.error.errors }, 400);
    }
    const data = await service.updateRule(id, parsed.data, user.sub);
    return c.json({ data });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    if (e.statusCode === 404) {
      return c.json({ error: e.message ?? 'Not found' }, 404);
    }
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PATCH /rules/:id/toggle -- 有効/無効切り替え
router.patch('/rules/:id/toggle', async (c) => {
  try {
    const user = c.get('user');
    const { id } = c.req.param();
    const body = await c.req.json();
    const isActive = z.boolean().safeParse(body.isActive);
    if (!isActive.success) {
      return c.json({ error: 'isActive (boolean) is required' }, 400);
    }
    const data = await service.toggleRuleActive(id, isActive.data, user.sub);
    return c.json({ data });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /rules/:id/history -- ルール変更履歴
router.get('/rules/:id/history', async (c) => {
  try {
    const { id } = c.req.param();
    const data = await service.getRuleHistory(id);
    return c.json({ data });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default router;
