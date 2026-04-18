import { Hono } from 'hono';
import { z } from 'zod';
import { TicketStatus, TicketType, TicketPriority } from '@prisma/client';
import * as service from './service.js';
import { JwtPayload } from '../../middleware/auth.js';

type Variables = { user: JwtPayload; teamId: string };

const router = new Hono<{ Variables: Variables }>();

const CreateTicketSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.nativeEnum(TicketType),
  priority: z.nativeEnum(TicketPriority).optional(),
  storyPoints: z.number().int().positive().optional(),
  assigneeId: z.string().optional(),
  sprintId: z.string().optional(),
  sprintGoalId: z.string().optional(),
  parentId: z.string().optional(),
});

const UpdateTicketSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.nativeEnum(TicketType).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  storyPoints: z.number().int().positive().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  sprintId: z.string().nullable().optional(),
  sprintGoalId: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
});

const ChangeStatusSchema = z.object({
  status: z.nativeEnum(TicketStatus),
});

const AddCommentSchema = z.object({
  content: z.string().min(1),
});

const UpdateDodSchema = z.object({
  items: z.array(
    z.object({
      dodItemId: z.string(),
      checked: z.boolean(),
    })
  ),
});

// GET /backlog - must be defined before /:id
router.get('/backlog', async (c) => {
  const user = c.get('user');
  try {
    const tickets = await service.getBacklog(user.organizationId);
    return c.json({ data: tickets });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return c.json({ error: message }, 500);
  }
});

// GET /sprint/:sprintId/burndown
router.get('/sprint/:sprintId/burndown', async (c) => {
  const user = c.get('user');
  const sprintId = c.req.param('sprintId');
  try {
    const data = await service.getBurndown(sprintId, user.organizationId);
    return c.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return c.json({ error: message }, 500);
  }
});

// GET /
router.get('/', async (c) => {
  const user = c.get('user');
  const teamId = c.get('teamId');
  const query = c.req.query();
  const filters = {
    sprintId: query.sprintId,
    sprintGoalId: query.sprintGoalId,
    status: query.status as TicketStatus | undefined,
    assigneeId: query.assigneeId,
    type: query.type as TicketType | undefined,
  };
  try {
    const tickets = await service.listTickets(user.organizationId, filters, teamId);
    return c.json({ data: tickets });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return c.json({ error: message }, 500);
  }
});

// POST /
router.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const parsed = CreateTicketSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation error', details: parsed.error.errors }, 400);
  }
  try {
    const ticket = await service.createTicket(user.organizationId, user.sub, parsed.data);
    return c.json({ data: ticket }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return c.json({ error: message }, 500);
  }
});

// GET /:id
router.get('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  try {
    const ticket = await service.getTicket(id, user.organizationId);
    return c.json({ data: ticket });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    if (message === 'Ticket not found') {
      return c.json({ error: message }, 404);
    }
    return c.json({ error: message }, 500);
  }
});

// PUT /:id
router.put('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = UpdateTicketSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation error', details: parsed.error.errors }, 400);
  }
  try {
    const ticket = await service.updateTicket(id, user.organizationId, parsed.data);
    return c.json({ data: ticket });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    if (message === 'Ticket not found') {
      return c.json({ error: message }, 404);
    }
    return c.json({ error: message }, 500);
  }
});

// DELETE /:id
router.delete('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  try {
    await service.deleteTicket(id, user.organizationId);
    return c.json({ data: { success: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    if (message === 'Ticket not found') {
      return c.json({ error: message }, 404);
    }
    return c.json({ error: message }, 500);
  }
});

// PUT /:id/status
router.put('/:id/status', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = ChangeStatusSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation error', details: parsed.error.errors }, 400);
  }
  try {
    const ticket = await service.changeStatus(id, user.organizationId, parsed.data.status, user.sub);
    return c.json({ data: ticket });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    if (message === 'Ticket not found') {
      return c.json({ error: message }, 404);
    }
    return c.json({ error: message }, 500);
  }
});

// GET /:id/comments
router.get('/:id/comments', async (c) => {
  const id = c.req.param('id');
  try {
    const comments = await service.getComments(id);
    return c.json({ data: comments });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return c.json({ error: message }, 500);
  }
});

// POST /:id/comments
router.post('/:id/comments', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = AddCommentSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation error', details: parsed.error.errors }, 400);
  }
  try {
    const comment = await service.addComment(id, user.sub, parsed.data.content);
    return c.json({ data: comment }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return c.json({ error: message }, 500);
  }
});

// PUT /:id/dod
router.put('/:id/dod', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = UpdateDodSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation error', details: parsed.error.errors }, 400);
  }
  try {
    const results = await service.updateDod(id, user.organizationId, parsed.data.items, user.sub);
    return c.json({ data: results });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return c.json({ error: message }, 500);
  }
});

export default router;
