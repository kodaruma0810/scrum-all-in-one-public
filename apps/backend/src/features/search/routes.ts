import { Hono } from 'hono';
import * as service from './service.js';
import { SearchResults } from './types.js';

const router = new Hono<{ Variables: { user: { organizationId: string; id: string } } }>();

const EMPTY_RESULTS: SearchResults = { tickets: [], longTermGoals: [], sprintGoals: [], total: 0 };

// GET /?q=query
router.get('/', async (c) => {
  try {
    const user = c.get('user');
    const q = c.req.query('q') ?? '';
    if (!q.trim()) {
      return c.json({ data: EMPTY_RESULTS });
    }
    const data = await service.search(user.organizationId, q);
    return c.json({ data });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[search] DB unavailable, returning empty results:', (err as Error).message);
      return c.json({ data: EMPTY_RESULTS });
    }
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default router;
