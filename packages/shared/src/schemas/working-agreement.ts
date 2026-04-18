import { z } from 'zod';

// --- Category ---
export const WACategorySchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  name: z.string().min(1).max(100),
  orderIndex: z.number().int().min(0),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type WACategory = z.infer<typeof WACategorySchema>;

export const CreateWACategorySchema = z.object({
  name: z.string().min(1).max(100),
  orderIndex: z.number().int().min(0).optional(),
});
export type CreateWACategoryInput = z.infer<typeof CreateWACategorySchema>;

export const UpdateWACategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  orderIndex: z.number().int().min(0).optional(),
});
export type UpdateWACategoryInput = z.infer<typeof UpdateWACategorySchema>;

// --- Rule ---
export const WARuleSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  categoryId: z.string().uuid().nullable(),
  title: z.string().min(1).max(500),
  description: z.string().nullable(),
  isActive: z.boolean(),
  agreedAt: z.coerce.date(),
  proposedById: z.string().uuid(),
  lastModifiedById: z.string().uuid(),
  orderIndex: z.number().int().min(0),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type WARule = z.infer<typeof WARuleSchema>;

export const CreateWARuleSchema = z.object({
  categoryId: z.string().uuid().nullish(),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  agreedAt: z.coerce.date(),
  proposedById: z.string().uuid(),
  orderIndex: z.number().int().min(0).optional(),
});
export type CreateWARuleInput = z.infer<typeof CreateWARuleSchema>;

export const UpdateWARuleSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().nullable().optional(),
  agreedAt: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
  categoryId: z.string().uuid().nullable().optional(),
});
export type UpdateWARuleInput = z.infer<typeof UpdateWARuleSchema>;

// --- History ---
export const WAChangeTypeEnum = z.enum(['CREATED', 'UPDATED', 'ACTIVATED', 'DEACTIVATED']);

export const WAHistorySchema = z.object({
  id: z.string().uuid(),
  ruleId: z.string().uuid(),
  changedById: z.string().uuid(),
  changedAt: z.coerce.date(),
  changeType: WAChangeTypeEnum,
  fieldName: z.string().nullable(),
  oldValue: z.string().nullable(),
  newValue: z.string().nullable(),
});
export type WAHistory = z.infer<typeof WAHistorySchema>;
