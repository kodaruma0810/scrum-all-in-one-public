import { z } from 'zod';

export const TicketTypeSchema = z.enum(['USER_STORY', 'TASK', 'BUG', 'SUBTASK']);
export const TicketStatusSchema = z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']);
export const TicketPrioritySchema = z.enum(['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST']);
export const StoryPointSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(5),
  z.literal(8),
  z.literal(13),
  z.literal(21),
]);

export const TicketSchema = z.object({
  id: z.string().uuid(),
  ticketId: z.string(), // e.g. SCR-001
  title: z.string().min(1).max(200),
  description: z.string().nullable(),
  type: TicketTypeSchema,
  status: TicketStatusSchema,
  priority: TicketPrioritySchema,
  storyPoints: z.number().nullable(),
  assigneeId: z.string().uuid().nullable(),
  reporterId: z.string().uuid(),
  sprintId: z.string().uuid().nullable(),
  sprintGoalId: z.string().uuid().nullable(),
  parentId: z.string().uuid().nullable(),
  organizationId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Ticket = z.infer<typeof TicketSchema>;

export const CreateTicketSchema = TicketSchema.pick({
  title: true,
  description: true,
  type: true,
  priority: true,
  storyPoints: true,
  assigneeId: true,
  sprintId: true,
  sprintGoalId: true,
  parentId: true,
});
export const UpdateTicketSchema = CreateTicketSchema.partial();
export const UpdateTicketStatusSchema = z.object({ status: TicketStatusSchema });

export const TicketCommentSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1),
  authorId: z.string().uuid(),
  ticketId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type TicketComment = z.infer<typeof TicketCommentSchema>;
