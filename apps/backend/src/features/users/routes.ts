import { Hono } from 'hono';
import * as service from './service.js';
import { UserDto } from './types.js';

type UserVar = { Variables: { user: { organizationId: string; id: string } } };

// ─── モックデータ（DB未接続の開発環境用） ───────────────────────────────
const MOCK_USERS: UserDto[] = [
  { id: 'dev-user-id', email: 'dev@example.com', name: '開発ユーザー', role: 'ADMIN', avatarUrl: null, createdAt: new Date('2026-01-01').toISOString() },
  { id: 'mock-user-2', email: 'sm@example.com', name: 'スクラムマスター', role: 'MEMBER', avatarUrl: null, createdAt: new Date('2026-01-02').toISOString() },
  { id: 'mock-user-3', email: 'dev1@example.com', name: '開発者A', role: 'MEMBER', avatarUrl: null, createdAt: new Date('2026-01-03').toISOString() },
  { id: 'mock-user-4', email: 'po@example.com', name: 'プロダクトオーナー', role: 'MEMBER', avatarUrl: null, createdAt: new Date('2026-01-04').toISOString() },
];

const MOCK_TEAM = { id: 'mock-team-1', name: '開発チーム', ticketPrefix: 'SCR', velocityMode: 'STORY_POINTS', spDaysRatio: 1.0 };

const MOCK_TERMINOLOGY = [
  { key: 'increment', value: 'インクリメント' },
  { key: 'sprint', value: 'スプリント' },
  { key: 'longTermGoal', value: '中長期ゴール' },
  { key: 'sprintGoal', value: 'スプリントゴール' },
];

function fallback<T>(fn: () => Promise<T>, mock: T) {
  return fn().catch((err: Error) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[users] DB unavailable, returning mock:', err.message);
      return mock;
    }
    throw err;
  });
}

// ─── Users router (/api/users) ───────────────────────────────────────────
const router = new Hono<UserVar>();

router.get('/me', async (c) => {
  try {
    const { id, organizationId } = c.get('user');
    const data = await fallback(() => service.getUser(id, organizationId), MOCK_USERS[0]);
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

router.put('/me', async (c) => {
  try {
    const { id, organizationId } = c.get('user');
    const body = await c.req.json();
    const data = await fallback(
      () => service.updateUser(id, organizationId, body),
      { ...MOCK_USERS[0], ...body }
    );
    return c.json({ data });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

router.get('/', async (c) => {
  try {
    const { organizationId } = c.get('user');
    const data = await fallback(() => service.listUsers(organizationId), MOCK_USERS);
    return c.json({ data });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

router.post('/', async (c) => {
  try {
    const { organizationId } = c.get('user');
    const body = await c.req.json();
    const data = await service.createUser(organizationId, body);
    return c.json({ data }, 201);
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

router.put('/:id', async (c) => {
  try {
    const { organizationId } = c.get('user');
    const { id } = c.req.param();
    const body = await c.req.json();
    const data = await fallback(
      () => service.updateUser(id, organizationId, body),
      { ...(MOCK_USERS.find((u) => u.id === id) ?? MOCK_USERS[0]), ...body }
    );
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

router.delete('/:id', async (c) => {
  try {
    const { organizationId } = c.get('user');
    const { id } = c.req.param();
    await fallback(() => service.deleteUser(id, organizationId), true);
    return c.json({ success: true });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

router.put('/:id/role', async (c) => {
  try {
    const user = c.get('user');
    const { organizationId } = user;
    // ADMIN のみがグローバルロールを変更可能
    if ((user as { role?: string }).role !== 'ADMIN') {
      return c.json({ error: 'ロール変更の権限がありません' }, 403);
    }
    const { id } = c.req.param();
    const { role } = await c.req.json();
    const data = await fallback(
      () => service.changeRole(id, organizationId, role),
      { ...(MOCK_USERS.find((u) => u.id === id) ?? MOCK_USERS[0]), role }
    );
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default router;

// ─── Team router (/api/team) ─────────────────────────────────────────────
export const teamRouter = new Hono<UserVar>();

teamRouter.get('/', async (c) => {
  try {
    const { organizationId } = c.get('user');
    const teamId = c.req.header('X-Team-Id');
    const data = await fallback(() => service.getTeamSettings(organizationId, teamId), MOCK_TEAM);
    return c.json({ data });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

teamRouter.put('/', async (c) => {
  try {
    const { organizationId } = c.get('user');
    const teamId = c.req.header('X-Team-Id');
    const body = await c.req.json();
    const data = await fallback(
      () => service.updateTeamSettings(organizationId, body, teamId),
      { ...MOCK_TEAM, ...body }
    );
    return c.json({ data });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ─── Settings router (/api/settings) ────────────────────────────────────
export const settingsRouter = new Hono<UserVar>();

settingsRouter.get('/terminology', async (c) => {
  try {
    const { organizationId } = c.get('user');
    const data = await fallback(() => service.getTerminology(organizationId), MOCK_TERMINOLOGY);
    return c.json({ data });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

settingsRouter.put('/terminology', async (c) => {
  try {
    const { organizationId } = c.get('user');
    const body: { key: string; value: string }[] = await c.req.json();
    const data = await fallback(
      () => service.updateTerminologyBulk(organizationId, body),
      body
    );
    return c.json({ data });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});
