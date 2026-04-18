import { prisma } from '../../db/client.js';

export async function createApiKey(data: {
  name: string;
  keyHash: string;
  keyPrefix: string;
  organizationId: string;
  createdById: string;
  expiresAt?: Date;
}) {
  return prisma.apiKey.create({
    data: {
      name: data.name,
      keyHash: data.keyHash,
      keyPrefix: data.keyPrefix,
      organizationId: data.organizationId,
      createdById: data.createdById,
      expiresAt: data.expiresAt ?? null,
    },
  });
}

export async function findApiKeysByUser(userId: string) {
  return prisma.apiKey.findMany({
    where: { createdById: userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findApiKeyByHash(keyHash: string) {
  return prisma.apiKey.findUnique({
    where: { keyHash },
    include: {
      createdBy: {
        select: { id: true, email: true, role: true, organizationId: true },
      },
    },
  });
}

export async function revokeApiKey(id: string, userId: string) {
  return prisma.apiKey.updateMany({
    where: { id, createdById: userId },
    data: { revokedAt: new Date() },
  });
}

export async function updateLastUsed(id: string) {
  return prisma.apiKey.update({
    where: { id },
    data: { lastUsedAt: new Date() },
  });
}
