import { prisma } from '../../db/client.js';
import { SearchResultItem } from './types.js';

// PostgreSQL pg_bigm 拡張が利用できる場合は raw SQL の LIKE 検索が高速になる。
// Prisma の contains (ILIKE) でも同等の結果が得られるため、ここでは Prisma API を使用。

export async function searchTickets(
  organizationId: string,
  q: string
): Promise<SearchResultItem[]> {
  const where = {
    organizationId,
    OR: [
      { title: { contains: q, mode: 'insensitive' as const } },
      { description: { contains: q, mode: 'insensitive' as const } },
      {
        comments: {
          some: { content: { contains: q, mode: 'insensitive' as const } },
        },
      },
    ],
  };

  const rows = await prisma.ticket.findMany({
    where,
    select: {
      id: true,
      ticketNumber: true,
      title: true,
      description: true,
      status: true,
      type: true,
    },
    take: 20,
    orderBy: { updatedAt: 'desc' },
  });

  return rows.map((r) => ({
    type: 'ticket' as const,
    id: r.id,
    title: r.title,
    description: r.description,
    meta: { ticketNumber: r.ticketNumber, status: r.status, type: r.type },
  }));
}

export async function searchLongTermGoals(
  organizationId: string,
  q: string
): Promise<SearchResultItem[]> {
  const rows = await prisma.longTermGoal.findMany({
    where: {
      organizationId,
      OR: [
        { title: { contains: q, mode: 'insensitive' as const } },
        { description: { contains: q, mode: 'insensitive' as const } },
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      increment: { select: { id: true, name: true } },
    },
    take: 10,
    orderBy: { updatedAt: 'desc' },
  });

  return rows.map((r) => ({
    type: 'longTermGoal' as const,
    id: r.id,
    title: r.title,
    description: r.description,
    meta: { status: r.status, incrementId: r.increment.id, incrementName: r.increment.name },
  }));
}

export async function searchSprintGoals(
  organizationId: string,
  q: string
): Promise<SearchResultItem[]> {
  const rows = await prisma.sprintGoal.findMany({
    where: {
      organizationId,
      OR: [
        { title: { contains: q, mode: 'insensitive' as const } },
        { description: { contains: q, mode: 'insensitive' as const } },
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      sprint: { select: { id: true, name: true } },
    },
    take: 10,
    orderBy: { updatedAt: 'desc' },
  });

  return rows.map((r) => ({
    type: 'sprintGoal' as const,
    id: r.id,
    title: r.title,
    description: r.description,
    meta: { status: r.status, sprintId: r.sprint.id, sprintName: r.sprint.name },
  }));
}
