import { Hono } from 'hono';
import { z } from 'zod';
import * as service from './service.js';

type UserVar = { Variables: { user: { sub: string; organizationId: string; role: string } } };

const CreateTeamSchema = z.object({
  name: z.string().min(1).max(100),
  ticketPrefix: z.string().min(1).max(6).optional(),
});

const AddMemberSchema = z.object({
  userId: z.string().min(1),
});

const ChangeRoleSchema = z.object({
  role: z.enum(['SCRUM_MASTER', 'PRODUCT_OWNER', 'DEVELOPER']),
});

const ToggleOwnerSchema = z.object({
  isOwner: z.boolean(),
});

const router = new Hono<UserVar>();

// GET /my -- 自分が所属するチーム一覧
router.get('/my', async (c) => {
  try {
    const user = c.get('user');
    const data = await service.listMyTeams(user.sub, user.organizationId);
    return c.json({ data });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST / -- チーム作成
router.post('/', async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const parsed = CreateTeamSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Validation error', details: parsed.error.errors }, 400);
    }
    const data = await service.createTeam(user.organizationId, user.sub, parsed.data);
    return c.json({ data }, 201);
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE /:teamId -- チーム削除
router.delete('/:teamId', async (c) => {
  try {
    const user = c.get('user');
    const { teamId } = c.req.param();
    await service.deleteTeam(teamId, user.sub, user.role);
    return c.json({ success: true });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    if (e.statusCode === 403) {
      return c.json({ error: e.message ?? 'Forbidden' }, 403);
    }
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /:teamId/members -- メンバー一覧
router.get('/:teamId/members', async (c) => {
  try {
    const { teamId } = c.req.param();
    const data = await service.getTeamMembers(teamId);
    return c.json({ data });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /:teamId/members -- メンバー追加
router.post('/:teamId/members', async (c) => {
  try {
    const { teamId } = c.req.param();
    const body = await c.req.json();
    const parsed = AddMemberSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Validation error', details: parsed.error.errors }, 400);
    }
    const data = await service.addMember(teamId, parsed.data.userId);
    return c.json({ data }, 201);
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === 'P2002') {
      return c.json({ error: 'このユーザーは既にチームメンバーです' }, 409);
    }
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PUT /:teamId/members/:userId/role -- ロール変更
router.put('/:teamId/members/:userId/role', async (c) => {
  try {
    const user = c.get('user');
    const { teamId, userId } = c.req.param();
    const body = await c.req.json();
    const parsed = ChangeRoleSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Validation error', details: parsed.error.errors }, 400);
    }
    const data = await service.changeMemberRole(
      teamId, userId, parsed.data.role, user.sub, user.role
    );
    return c.json({ data });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    if (e.statusCode === 403) {
      return c.json({ error: e.message ?? 'Forbidden' }, 403);
    }
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PUT /:teamId/members/:userId/owner -- 管理権限の付与/剥奪
router.put('/:teamId/members/:userId/owner', async (c) => {
  try {
    const user = c.get('user');
    const { teamId, userId } = c.req.param();
    const body = await c.req.json();
    const parsed = ToggleOwnerSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Validation error', details: parsed.error.errors }, 400);
    }
    const data = await service.toggleOwner(
      teamId, userId, parsed.data.isOwner, user.sub, user.role
    );
    return c.json({ data });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    if (e.statusCode === 403) {
      return c.json({ error: e.message ?? 'Forbidden' }, 403);
    }
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE /:teamId/members/:userId -- メンバー削除
router.delete('/:teamId/members/:userId', async (c) => {
  try {
    const { teamId, userId } = c.req.param();
    await service.removeMember(teamId, userId);
    return c.json({ success: true });
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === 'P2025') {
      return c.json({ error: 'メンバーが見つかりません' }, 404);
    }
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default router;
