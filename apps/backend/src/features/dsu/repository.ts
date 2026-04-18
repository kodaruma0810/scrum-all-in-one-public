import { prisma } from '../../db/client.js';
import { CreateDsuLogInput, UpsertMemberStatusInput, DsuHistoryFilters } from './types.js';

export async function findTodayInfo(organizationId: string, teamId: string) {
  const sprint = await prisma.sprint.findFirst({
    where: { organizationId, teamId, status: 'ACTIVE' },
    include: {
      sprintGoals: {
        include: {
          tickets: { select: { id: true, status: true, storyPoints: true } },
          longTermGoal: { select: { id: true, title: true } },
        },
      },
      tickets: { select: { id: true, status: true, storyPoints: true } },
      memberCapacities: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
    },
  });

  if (!sprint) {
    return { sprint: null, dsuLog: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dsuLog = await prisma.dsuLog.findFirst({
    where: {
      sprintId: sprint.id,
      date: { gte: today, lt: tomorrow },
    },
    include: {
      memberStatuses: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
    },
  });

  return { sprint, dsuLog };
}

export async function findDsuLogById(id: string, organizationId: string) {
  return prisma.dsuLog.findFirst({
    where: { id, organizationId },
    include: {
      memberStatuses: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
    },
  });
}

export async function createDsuLog(organizationId: string, data: CreateDsuLogInput) {
  return prisma.dsuLog.upsert({
    where: {
      sprintId_date: {
        sprintId: data.sprintId,
        date: new Date(data.date),
      },
    },
    create: {
      sprintId: data.sprintId,
      date: new Date(data.date),
      notes: data.notes,
      organizationId,
    },
    update: {
      ...(data.notes !== undefined && { notes: data.notes }),
    },
    include: {
      memberStatuses: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
    },
  });
}

export async function upsertMemberStatus(dsuLogId: string, input: UpsertMemberStatusInput) {
  return prisma.dsuMemberStatus.upsert({
    where: {
      dsuLogId_userId: {
        dsuLogId,
        userId: input.userId,
      },
    },
    create: {
      dsuLogId,
      userId: input.userId,
      yesterday: input.yesterday,
      today: input.today,
      blockers: input.blockers,
      status: input.status,
    },
    update: {
      yesterday: input.yesterday,
      today: input.today,
      blockers: input.blockers,
      status: input.status,
    },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  });
}

export async function updateNotes(id: string, organizationId: string, notes: string) {
  return prisma.dsuLog.update({
    where: { id, organizationId },
    data: { notes },
    include: {
      memberStatuses: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
    },
  });
}

export async function findDsuHistory(organizationId: string, filters: DsuHistoryFilters = {}) {
  return prisma.dsuLog.findMany({
    where: {
      organizationId,
      ...(filters.sprintId && { sprintId: filters.sprintId }),
    },
    include: {
      memberStatuses: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
    },
    orderBy: { date: 'desc' },
    take: filters.limit ?? 30,
    skip: filters.offset ?? 0,
  });
}
