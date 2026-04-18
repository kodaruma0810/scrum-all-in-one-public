import { Hono } from 'hono';
import { z } from 'zod';
import * as service from './service.js';

const router = new Hono<{ Variables: { user: { organizationId: string; id: string }; teamId: string } }>();

// GET /today - must be before /:id
router.get('/today', async (c) => {
  try {
    const user = c.get('user');
    const teamId = c.get('teamId');
    const data = await service.getTodayDsu(user.organizationId, teamId);
    return c.json({ data });
  } catch (err: unknown) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /history - must be before /:id
router.get('/history', async (c) => {
  try {
    const user = c.get('user');
    const sprintId = c.req.query('sprintId');
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!, 10) : undefined;
    const offset = c.req.query('offset') ? parseInt(c.req.query('offset')!, 10) : undefined;
    const data = await service.getDsuHistory(user.organizationId, { sprintId, limit, offset });
    return c.json({ data });
  } catch (err: unknown) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /
router.post('/', async (c) => {
  try {
    const user = c.get('user');
    const bodySchema = z.object({
      sprintId: z.string().uuid(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      notes: z.string().optional(),
    });
    const body = bodySchema.parse(await c.req.json());
    const data = await service.createDsuLog(user.organizationId, body);
    return c.json({ data }, 201);
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: err.errors }, 400);
    }
    const e = err as { statusCode?: number; message?: string };
    if (e.statusCode === 404) {
      return c.json({ error: e.message }, 404);
    }
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /:id
router.get('/:id', async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    const data = await service.getDsuLog(id, user.organizationId);
    return c.json({ data });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    if (e.statusCode === 404) {
      return c.json({ error: e.message }, 404);
    }
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PUT /:id/notes
router.put('/:id/notes', async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    const bodySchema = z.object({
      notes: z.string(),
    });
    const body = bodySchema.parse(await c.req.json());
    const data = await service.updateDsuNotes(id, user.organizationId, body.notes);
    return c.json({ data });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: err.errors }, 400);
    }
    const e = err as { statusCode?: number; message?: string };
    if (e.statusCode === 404) {
      return c.json({ error: e.message }, 404);
    }
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PUT /:id/member-status
router.put('/:id/member-status', async (c) => {
  try {
    const user = c.get('user');
    const dsuLogId = c.req.param('id');
    const bodySchema = z.object({
      userId: z.string().uuid(),
      yesterday: z.string().optional(),
      today: z.string().optional(),
      blockers: z.string().optional(),
      status: z.enum(['PRESENT', 'ABSENT', 'REMOTE']),
    });
    const body = bodySchema.parse(await c.req.json());
    const data = await service.upsertMemberStatus(dsuLogId, user.organizationId, body);
    return c.json({ data });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: err.errors }, 400);
    }
    const e = err as { statusCode?: number; message?: string };
    if (e.statusCode === 404) {
      return c.json({ error: e.message }, 404);
    }
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default router;
