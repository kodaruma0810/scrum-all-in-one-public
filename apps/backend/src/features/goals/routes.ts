import { Hono } from 'hono';
import { z } from 'zod';
import { GoalPriority, GoalStatus, CommitmentType, SprintGoalStatus } from '@prisma/client';
import * as service from './service.js';
import { JwtPayload } from '../../middleware/auth.js';

type Variables = { user: JwtPayload; teamId: string };

const router = new Hono<{ Variables: Variables }>();

// Zod schemas
const CreateIncrementSchema = z.object({
  name: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string().optional(),
  teamId: z.string().min(1),
  sprintDurationWeeks: z.number().min(1).max(8).optional(),
});

const UpdateIncrementSchema = z.object({
  name: z.string().min(1).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

const CreateLongTermGoalSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.nativeEnum(GoalPriority),
  commitment: z.nativeEnum(CommitmentType).optional(),
  assigneeId: z.string().optional(),
});

const UpdateLongTermGoalSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.nativeEnum(GoalPriority).optional(),
  status: z.nativeEnum(GoalStatus).optional(),
  commitment: z.nativeEnum(CommitmentType).optional(),
  assigneeId: z.string().nullable().optional(),
});

const CreateSprintGoalSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  longTermGoalId: z.string().optional(),
});

const UpdateSprintGoalSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(SprintGoalStatus).optional(),
  longTermGoalId: z.string().nullable().optional(),
});

// GET /increments
router.get('/increments', async (c) => {
  const user = c.get('user');
  const teamId = c.get('teamId');
  try {
    const increments = await service.listIncrements(user.organizationId, teamId);
    return c.json({ data: increments });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return c.json({ error: message }, 500);
  }
});

// POST /increments
router.post('/increments', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const parsed = CreateIncrementSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.message }, 400);
  }
  try {
    const increment = await service.createIncrement(user.organizationId, parsed.data);
    return c.json({ data: increment }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return c.json({ error: message }, 500);
  }
});

// GET /increments/:id
router.get('/increments/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  try {
    const increment = await service.getIncrement(id, user.organizationId);
    return c.json({ data: increment });
  } catch (err) {
    const status = (err as { status?: number }).status;
    const message = err instanceof Error ? err.message : 'Internal server error';
    if (status === 404) return c.json({ error: message }, 404);
    return c.json({ error: message }, 500);
  }
});

// PUT /increments/:id
router.put('/increments/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = UpdateIncrementSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.message }, 400);
  }
  try {
    const increment = await service.updateIncrement(id, user.organizationId, parsed.data);
    return c.json({ data: increment });
  } catch (err) {
    const status = (err as { status?: number }).status;
    const message = err instanceof Error ? err.message : 'Internal server error';
    if (status === 404) return c.json({ error: message }, 404);
    return c.json({ error: message }, 500);
  }
});

// DELETE /increments/:id
router.delete('/increments/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  try {
    await service.deleteIncrement(id, user.organizationId);
    return c.json({ data: null });
  } catch (err) {
    const status = (err as { status?: number }).status;
    const message = err instanceof Error ? err.message : 'Internal server error';
    if (status === 404) return c.json({ error: message }, 404);
    return c.json({ error: message }, 500);
  }
});

// GET /increments/:id/goals
router.get('/increments/:id/goals', async (c) => {
  const user = c.get('user');
  const incrementId = c.req.param('id');
  try {
    const goals = await service.listLongTermGoals(incrementId, user.organizationId);
    return c.json({ data: goals });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return c.json({ error: message }, 500);
  }
});

// POST /increments/:id/goals
router.post('/increments/:id/goals', async (c) => {
  const user = c.get('user');
  const incrementId = c.req.param('id');
  const body = await c.req.json();
  const parsed = CreateLongTermGoalSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.message }, 400);
  }
  try {
    const goal = await service.createLongTermGoal(incrementId, user.organizationId, parsed.data);
    return c.json({ data: goal }, 201);
  } catch (err) {
    const status = (err as { status?: number }).status;
    const message = err instanceof Error ? err.message : 'Internal server error';
    if (status === 404) return c.json({ error: message }, 404);
    return c.json({ error: message }, 500);
  }
});

// PUT /increments/:id/goals/:goalId
router.put('/increments/:id/goals/:goalId', async (c) => {
  const user = c.get('user');
  const incrementId = c.req.param('id');
  const goalId = c.req.param('goalId');
  const body = await c.req.json();
  const parsed = UpdateLongTermGoalSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.message }, 400);
  }
  try {
    const goal = await service.updateLongTermGoal(goalId, incrementId, user.organizationId, parsed.data);
    return c.json({ data: goal });
  } catch (err) {
    const status = (err as { status?: number }).status;
    const message = err instanceof Error ? err.message : 'Internal server error';
    if (status === 404) return c.json({ error: message }, 404);
    return c.json({ error: message }, 500);
  }
});

// DELETE /increments/:id/goals/:goalId
router.delete('/increments/:id/goals/:goalId', async (c) => {
  const user = c.get('user');
  const incrementId = c.req.param('id');
  const goalId = c.req.param('goalId');
  try {
    await service.deleteLongTermGoal(goalId, incrementId, user.organizationId);
    return c.json({ data: null });
  } catch (err) {
    const status = (err as { status?: number }).status;
    const message = err instanceof Error ? err.message : 'Internal server error';
    if (status === 404) return c.json({ error: message }, 404);
    return c.json({ error: message }, 500);
  }
});

// GET /increments/:id/hierarchy
router.get('/increments/:id/hierarchy', async (c) => {
  const user = c.get('user');
  const incrementId = c.req.param('id');
  try {
    const data = await service.getHierarchy(incrementId, user.organizationId);
    return c.json({ data });
  } catch (err) {
    const status = (err as { status?: number }).status;
    const message = err instanceof Error ? err.message : 'Internal server error';
    if (status === 404) return c.json({ error: message }, 404);
    return c.json({ error: message }, 500);
  }
});

// GET /increments/:id/progress
router.get('/increments/:id/progress', async (c) => {
  const user = c.get('user');
  const incrementId = c.req.param('id');
  try {
    const data = await service.getProgress(incrementId, user.organizationId);
    return c.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return c.json({ error: message }, 500);
  }
});

// GET /sprints/:sprintId/goals
router.get('/sprints/:sprintId/goals', async (c) => {
  const user = c.get('user');
  const sprintId = c.req.param('sprintId');
  try {
    const goals = await service.listSprintGoals(sprintId, user.organizationId);
    return c.json({ data: goals });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return c.json({ error: message }, 500);
  }
});

// POST /sprints/:sprintId/goals
router.post('/sprints/:sprintId/goals', async (c) => {
  const user = c.get('user');
  const sprintId = c.req.param('sprintId');
  const body = await c.req.json();
  const parsed = CreateSprintGoalSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.message }, 400);
  }
  try {
    const goal = await service.createSprintGoal(sprintId, user.organizationId, parsed.data);
    return c.json({ data: goal }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return c.json({ error: message }, 500);
  }
});

// PUT /sprints/:sprintId/goals/:goalId
router.put('/sprints/:sprintId/goals/:goalId', async (c) => {
  const user = c.get('user');
  const sprintId = c.req.param('sprintId');
  const goalId = c.req.param('goalId');
  const body = await c.req.json();
  const parsed = UpdateSprintGoalSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.message }, 400);
  }
  try {
    const goal = await service.updateSprintGoal(goalId, sprintId, user.organizationId, parsed.data);
    return c.json({ data: goal });
  } catch (err) {
    const status = (err as { status?: number }).status;
    const message = err instanceof Error ? err.message : 'Internal server error';
    if (status === 404) return c.json({ error: message }, 404);
    return c.json({ error: message }, 500);
  }
});

export default router;
