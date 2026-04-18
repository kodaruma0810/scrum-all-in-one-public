import { Hono } from 'hono';
import { z } from 'zod';
import * as service from './service.js';

type UserVar = {
  Variables: {
    user: { sub: string; organizationId: string; role: string };
    teamId: string;
  };
};

const CreateRetroSchema = z.object({
  title: z.string().min(1).max(200),
  sprintId: z.string().nullish(),
  format: z.string().min(1).max(50).optional(),
  mode: z.enum(['CARD', 'BOARD']).optional(),
});

const UpdateRetroSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  sprintId: z.string().nullable().optional(),
});

const CreateItemSchema = z.object({
  type: z.string().min(1).max(50),
  body: z.string().min(1).max(2000),
});

const UpdateItemSchema = z.object({
  body: z.string().min(1).max(2000).optional(),
  type: z.string().min(1).max(50).optional(),
  posX: z.number().min(0).optional(),
  posY: z.number().min(0).optional(),
  fontSize: z.number().int().min(10).max(32).optional(),
  fontColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

const CreateActionSchema = z.object({
  title: z.string().min(1).max(500),
  assigneeId: z.string().nullish(),
});

const UpdateActionSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  assigneeId: z.string().nullable().optional(),
  status: z.enum(['OPEN', 'DONE']).optional(),
});

const router = new Hono<UserVar>();

// GET / -- レトロ一覧
router.get('/', async (c) => {
  try {
    const teamId = c.get('teamId');
    const data = await service.listRetros(teamId);
    return c.json({ data });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST / -- レトロ作成
router.post('/', async (c) => {
  try {
    const teamId = c.get('teamId');
    const body = await c.req.json();
    const parsed = CreateRetroSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: 'Validation error', details: parsed.error.errors }, 400);
    const data = await service.createRetro(teamId, parsed.data);
    return c.json({ data }, 201);
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /:id -- レトロ詳細
router.get('/:id', async (c) => {
  try {
    const user = c.get('user');
    const { id } = c.req.param();
    const data = await service.getRetro(id, user.sub);
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PUT /:id -- レトロ更新
router.put('/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const parsed = UpdateRetroSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: 'Validation error', details: parsed.error.errors }, 400);
    await service.updateRetro(id, parsed.data);
    return c.json({ success: true });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE /:id -- レトロ削除
router.delete('/:id', async (c) => {
  try {
    const { id } = c.req.param();
    await service.deleteRetro(id);
    return c.json({ success: true });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// --- Items ---

// POST /:id/items -- アイテム追加
router.post('/:id/items', async (c) => {
  try {
    const user = c.get('user');
    const { id } = c.req.param();
    const body = await c.req.json();
    const parsed = CreateItemSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: 'Validation error', details: parsed.error.errors }, 400);
    const data = await service.addItem(id, parsed.data, user.sub);
    return c.json({ data }, 201);
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PUT /items/:itemId -- アイテム更新
router.put('/items/:itemId', async (c) => {
  try {
    const user = c.get('user');
    const { itemId } = c.req.param();
    const body = await c.req.json();
    const parsed = UpdateItemSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: 'Validation error', details: parsed.error.errors }, 400);
    const data = await service.updateItem(itemId, parsed.data, user.sub);
    return c.json({ data });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE /items/:itemId -- アイテム削除
router.delete('/items/:itemId', async (c) => {
  try {
    const { itemId } = c.req.param();
    await service.deleteItem(itemId);
    return c.json({ success: true });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /items/:itemId/vote -- 投票トグル
router.post('/items/:itemId/vote', async (c) => {
  try {
    const user = c.get('user');
    const { itemId } = c.req.param();
    const data = await service.toggleVote(itemId, user.sub);
    return c.json({ data });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// --- Actions ---

// POST /:id/actions -- アクションアイテム追加
router.post('/:id/actions', async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const parsed = CreateActionSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: 'Validation error', details: parsed.error.errors }, 400);
    const data = await service.addAction(id, parsed.data);
    return c.json({ data }, 201);
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PUT /actions/:actionId -- アクションアイテム更新
router.put('/actions/:actionId', async (c) => {
  try {
    const { actionId } = c.req.param();
    const body = await c.req.json();
    const parsed = UpdateActionSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: 'Validation error', details: parsed.error.errors }, 400);
    const data = await service.updateAction(actionId, parsed.data);
    return c.json({ data });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE /actions/:actionId -- アクションアイテム削除
router.delete('/actions/:actionId', async (c) => {
  try {
    const { actionId } = c.req.param();
    await service.deleteAction(actionId);
    return c.json({ success: true });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default router;
