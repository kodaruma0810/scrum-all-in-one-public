import crypto from 'crypto';
import * as repository from './repository.js';
import type { ApiKeyDto, ApiKeyCreatedDto, CreateApiKeyInput } from './types.js';

function hashKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

function toDto(record: {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
}): ApiKeyDto {
  return {
    id: record.id,
    name: record.name,
    keyPrefix: record.keyPrefix,
    lastUsedAt: record.lastUsedAt?.toISOString() ?? null,
    expiresAt: record.expiresAt?.toISOString() ?? null,
    revokedAt: record.revokedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
  };
}

export async function generateApiKey(
  input: CreateApiKeyInput,
  organizationId: string,
  createdById: string
): Promise<ApiKeyCreatedDto> {
  const rawKey = 'sk_' + crypto.randomBytes(24).toString('hex');
  const keyHash = hashKey(rawKey);
  const keyPrefix = rawKey.slice(0, 7) + '...';

  const record = await repository.createApiKey({
    name: input.name,
    keyHash,
    keyPrefix,
    organizationId,
    createdById,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
  });

  return { ...toDto(record), key: rawKey };
}

export async function listApiKeys(userId: string): Promise<ApiKeyDto[]> {
  const records = await repository.findApiKeysByUser(userId);
  return records.map(toDto);
}

export async function revokeApiKey(id: string, userId: string): Promise<void> {
  const result = await repository.revokeApiKey(id, userId);
  if (result.count === 0) {
    throw Object.assign(new Error('APIキーが見つかりません'), { statusCode: 404 });
  }
}

export async function validateApiKey(rawKey: string) {
  const keyHash = hashKey(rawKey);
  const record = await repository.findApiKeyByHash(keyHash);

  if (!record) return null;
  if (record.revokedAt) return null;
  if (record.expiresAt && record.expiresAt < new Date()) return null;

  // lastUsedAt を非同期で更新（レスポンスを遅延させない）
  repository.updateLastUsed(record.id).catch(() => {});

  return {
    id: record.createdBy.id,
    email: record.createdBy.email,
    role: record.createdBy.role,
    organizationId: record.createdBy.organizationId,
  };
}
