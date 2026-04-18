import { z } from 'zod';

export const UserRoleSchema = z.enum(['ADMIN', 'SCRUM_MASTER', 'PRODUCT_OWNER', 'DEVELOPER']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: UserRoleSchema,
  avatarUrl: z.string().url().nullable(),
  organizationId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.pick({ email: true, name: true, role: true });
export const UpdateUserSchema = UserSchema.pick({ name: true, role: true, avatarUrl: true }).partial();
export const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
