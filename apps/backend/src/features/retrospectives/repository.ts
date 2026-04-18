import { prisma } from '../../db/client.js';
import type { RetroActionStatus } from '@prisma/client';

// --- Retrospective ---

export async function findRetrosByTeam(teamId: string) {
  return prisma.retrospective.findMany({
    where: { teamId },
    include: {
      sprint: { select: { id: true, name: true, increment: { select: { id: true, name: true } } } },
      _count: { select: { items: true, actions: true } },
      items: { select: { type: true } },
      actions: { select: { status: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findRetroById(id: string) {
  return prisma.retrospective.findUnique({
    where: { id },
    include: {
      sprint: { select: { id: true, name: true, increment: { select: { id: true, name: true } } } },
      items: {
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
        include: {
          author: { select: { id: true, name: true } },
          votes: { select: { userId: true } },
        },
      },
      actions: {
        orderBy: { createdAt: 'asc' },
        include: {
          assignee: { select: { id: true, name: true } },
        },
      },
    },
  });
}

export async function createRetro(data: {
  teamId: string;
  sprintId?: string | null;
  title: string;
  format?: string;
  mode?: 'CARD' | 'BOARD';
}) {
  return prisma.retrospective.create({
    data: {
      teamId: data.teamId,
      sprintId: data.sprintId ?? null,
      title: data.title,
      format: data.format ?? 'KPT',
      mode: data.mode ?? 'CARD',
    },
  });
}

export async function updateRetro(id: string, data: { title?: string; sprintId?: string | null }) {
  return prisma.retrospective.update({
    where: { id },
    data,
  });
}

export async function deleteRetro(id: string) {
  return prisma.retrospective.delete({ where: { id } });
}

// --- Item ---

export async function createItem(data: {
  retrospectiveId: string;
  type: string;
  body: string;
  authorId: string;
}) {
  return prisma.retroItem.create({
    data: {
      retrospectiveId: data.retrospectiveId,
      type: data.type,
      body: data.body,
      authorId: data.authorId,
    },
    include: {
      author: { select: { id: true, name: true } },
      votes: { select: { userId: true } },
    },
  });
}

export async function updateItem(id: string, data: { body?: string; type?: string; posX?: number; posY?: number; fontSize?: number; fontColor?: string }) {
  return prisma.retroItem.update({
    where: { id },
    data,
    include: {
      author: { select: { id: true, name: true } },
      votes: { select: { userId: true } },
    },
  });
}

export async function deleteItem(id: string) {
  return prisma.retroItem.delete({ where: { id } });
}

// --- Vote ---

export async function toggleVote(itemId: string, userId: string): Promise<boolean> {
  const existing = await prisma.retroVote.findUnique({
    where: { itemId_userId: { itemId, userId } },
  });
  if (existing) {
    await prisma.retroVote.delete({ where: { id: existing.id } });
    return false; // unvoted
  }
  await prisma.retroVote.create({ data: { itemId, userId } });
  return true; // voted
}

// --- Action Item ---

export async function createAction(data: {
  retrospectiveId: string;
  title: string;
  assigneeId?: string | null;
}) {
  return prisma.retroActionItem.create({
    data: {
      retrospectiveId: data.retrospectiveId,
      title: data.title,
      assigneeId: data.assigneeId ?? null,
    },
    include: {
      assignee: { select: { id: true, name: true } },
    },
  });
}

export async function updateAction(
  id: string,
  data: { title?: string; assigneeId?: string | null; status?: RetroActionStatus }
) {
  return prisma.retroActionItem.update({
    where: { id },
    data,
    include: {
      assignee: { select: { id: true, name: true } },
    },
  });
}

export async function deleteAction(id: string) {
  return prisma.retroActionItem.delete({ where: { id } });
}
