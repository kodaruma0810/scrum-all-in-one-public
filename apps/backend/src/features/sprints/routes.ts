import { Hono } from 'hono';
import * as service from './service.js';
import { CreateSprintInput, UpdateSprintInput, UpdateCapacityInput, UpsertCalendarInput } from './types.js';

const router = new Hono<{ Variables: { user: { organizationId: string; id: string }; teamId: string } }>();

// GET /velocity - must be before /:id
router.get('/velocity', async (c) => {
  try {
    const user = c.get('user');
    const teamId = c.get('teamId');
    const data = await service.getVelocityHistory(user.organizationId, teamId);
    return c.json({ data });
  } catch (err: unknown) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /team/calendar - must be before /:id
router.get('/team/calendar', async (c) => {
  try {
    const teamId = c.get('teamId');
    const data = await service.getTeamCalendar(teamId);
    return c.json({ data });
  } catch (err: unknown) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PUT /team/calendar
router.put('/team/calendar', async (c) => {
  try {
    const user = c.get('user');
    const teamId = c.get('teamId');
    const body = await c.req.json<UpsertCalendarInput>();
    const data = await service.upsertCalendarEntries(user.organizationId, { ...body, teamId });
    return c.json({ data });
  } catch (err: unknown) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /holidays
router.get('/holidays', async (c) => {
  try {
    const yearParam = c.req.query('year');
    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
    const data = service.getJapaneseHolidays(year);
    return c.json({ data });
  } catch (err: unknown) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /
router.get('/', async (c) => {
  try {
    const user = c.get('user');
    const teamId = c.get('teamId');
    const data = await service.listSprints(user.organizationId, teamId);
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
    const body = await c.req.json<CreateSprintInput>();
    const data = await service.createSprint(user.organizationId, body);
    return c.json({ data }, 201);
  } catch (err: unknown) {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /:id
router.get('/:id', async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    const data = await service.getSprint(id, user.organizationId);
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

// PUT /:id
router.put('/:id', async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    const body = await c.req.json<UpdateSprintInput>();
    const data = await service.updateSprint(id, user.organizationId, body);
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

// POST /:id/start
router.post('/:id/start', async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    const data = await service.startSprint(id, user.organizationId);
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

// POST /:id/complete
router.post('/:id/complete', async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    const data = await service.completeSprint(id, user.organizationId);
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

// POST /:id/reopen
router.post('/:id/reopen', async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    const data = await service.reopenSprint(id, user.organizationId);
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

// GET /:id/capacity
router.get('/:id/capacity', async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    const data = await service.getCapacity(id, user.organizationId);
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

// PUT /:id/capacity
router.put('/:id/capacity', async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    const body = await c.req.json<UpdateCapacityInput>();
    const data = await service.upsertCapacity(id, user.organizationId, body);
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

export default router;
