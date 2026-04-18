import { z } from 'zod';

export const CreateApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  expiresAt: z.string().datetime().optional(),
});

export type CreateApiKeyInput = z.infer<typeof CreateApiKeySchema>;

export interface ApiKeyDto {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface ApiKeyCreatedDto extends ApiKeyDto {
  /** 生のAPIキー（作成時のみ返却） */
  key: string;
}
