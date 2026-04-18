import { z } from 'zod';

export const SprintStatusSchema = z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'ARCHIVED']);

export const SprintSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: SprintStatusSchema,
  goal: z.string().nullable(),
  incrementId: z.string().uuid(),
  teamId: z.string().uuid(),
  organizationId: z.string().uuid(),
  velocity: z.number().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Sprint = z.infer<typeof SprintSchema>;

export const CreateSprintSchema = SprintSchema.pick({
  name: true, startDate: true, endDate: true, goal: true, incrementId: true, teamId: true,
});
export const UpdateSprintSchema = CreateSprintSchema.partial();
