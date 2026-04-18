import { z } from 'zod';

export const TeamSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  organizationId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Team = z.infer<typeof TeamSchema>;

export const TeamMemberSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  userId: z.string().uuid(),
  joinedAt: z.coerce.date(),
});
export type TeamMember = z.infer<typeof TeamMemberSchema>;
