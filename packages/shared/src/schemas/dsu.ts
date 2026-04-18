import { z } from 'zod';

export const MemberDsuStatusSchema = z.enum(['PRESENT', 'ABSENT', 'REMOTE']);

export const DsuLogSchema = z.object({
  id: z.string().uuid(),
  sprintId: z.string().uuid(),
  date: z.coerce.date(),
  notes: z.string().nullable(),
  organizationId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type DsuLog = z.infer<typeof DsuLogSchema>;

export const DsuMemberStatusSchema = z.object({
  id: z.string().uuid(),
  dsuLogId: z.string().uuid(),
  userId: z.string().uuid(),
  yesterday: z.string().nullable(),
  today: z.string().nullable(),
  blockers: z.string().nullable(),
  status: MemberDsuStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type DsuMemberStatus = z.infer<typeof DsuMemberStatusSchema>;
