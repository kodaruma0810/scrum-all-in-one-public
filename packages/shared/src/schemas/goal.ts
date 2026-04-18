import { z } from 'zod';

export const GoalPrioritySchema = z.enum(['MUST_HAVE', 'SHOULD_HAVE', 'NICE_TO_HAVE']);
export const GoalStatusSchema = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'ACHIEVED', 'NOT_ACHIEVED', 'PARTIALLY_ACHIEVED']);
export const CommitmentTypeSchema = z.enum(['COMMITTED', 'UNCOMMITTED']);

export const IncrementSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  description: z.string().nullable(),
  teamId: z.string().uuid(),
  organizationId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Increment = z.infer<typeof IncrementSchema>;

export const LongTermGoalSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(500),
  description: z.string().nullable(),
  priority: GoalPrioritySchema,
  status: GoalStatusSchema,
  commitment: CommitmentTypeSchema,
  assigneeId: z.string().uuid().nullable(),
  incrementId: z.string().uuid(),
  organizationId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type LongTermGoal = z.infer<typeof LongTermGoalSchema>;

export const SprintGoalStatusSchema = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'ACHIEVED', 'NOT_ACHIEVED']);
export const SprintGoalSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(500),
  description: z.string().nullable(),
  status: SprintGoalStatusSchema,
  longTermGoalId: z.string().uuid().nullable(),
  sprintId: z.string().uuid(),
  organizationId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type SprintGoal = z.infer<typeof SprintGoalSchema>;
