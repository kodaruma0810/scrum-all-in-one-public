import { prisma } from '../../db/client.js';
import { CreateSprintInput, UpdateSprintInput } from './types.js';

export async function findSprints(organizationId: string, teamId: string) {
  return prisma.sprint.findMany({
    where: { organizationId, teamId },
    include: {
      increment: { select: { id: true, name: true } },
      team: { select: { id: true, name: true } },
      _count: { select: { tickets: true, sprintGoals: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function findSprintById(id: string, organizationId: string) {
  return prisma.sprint.findFirst({
    where: { id, organizationId },
    include: {
      increment: { select: { id: true, name: true } },
      team: { select: { id: true, name: true } },
      sprintGoals: {
        include: {
          tickets: { select: { id: true, status: true, storyPoints: true } },
          longTermGoal: { select: { id: true, title: true } },
        },
      },
      tickets: {
        include: {
          assignee: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
      memberCapacities: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
    },
  });
}

export async function createSprint(organizationId: string, data: CreateSprintInput) {
  return prisma.sprint.create({
    data: {
      name: data.name,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      goal: data.goal,
      incrementId: data.incrementId,
      teamId: data.teamId,
      organizationId,
    },
  });
}

export async function updateSprint(id: string, organizationId: string, data: UpdateSprintInput) {
  return prisma.sprint.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
      ...(data.endDate !== undefined && { endDate: new Date(data.endDate) }),
      ...(data.goal !== undefined && { goal: data.goal }),
    },
  });
}

export async function startSprint(id: string, organizationId: string) {
  return prisma.sprint.update({
    where: { id },
    data: { status: 'ACTIVE' },
  });
}

export async function completeSprint(id: string, organizationId: string) {
  // velocity = sum of storyPoints of DONE tickets
  const sprint = await prisma.sprint.findFirst({
    where: { id, organizationId },
    include: {
      tickets: { select: { status: true, storyPoints: true } },
    },
  });

  if (!sprint) return null;

  const velocity = sprint.tickets
    .filter((t) => t.status === 'DONE')
    .reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);

  return prisma.sprint.update({
    where: { id },
    data: { status: 'COMPLETED', velocity },
  });
}

export async function reopenSprint(id: string, organizationId: string) {
  return prisma.sprint.update({
    where: { id },
    data: { status: 'ACTIVE', velocity: null },
  });
}

export async function getVelocityHistory(organizationId: string, teamId: string) {
  const sprints = await prisma.sprint.findMany({
    where: { organizationId, teamId, status: 'COMPLETED' },
    select: { name: true, velocity: true, endDate: true },
    orderBy: { endDate: 'desc' },
    take: 10,
  });
  return sprints;
}

export async function getCapacity(sprintId: string, organizationId: string) {
  return prisma.memberCapacity.findMany({
    where: { sprintId },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  });
}

export async function upsertCapacity(
  sprintId: string,
  members: Array<{ userId: string; availableDays: number }>
) {
  const results = [];
  for (const member of members) {
    const result = await prisma.memberCapacity.upsert({
      where: { sprintId_userId: { sprintId, userId: member.userId } },
      create: {
        sprintId,
        userId: member.userId,
        availableDays: member.availableDays,
      },
      update: {
        availableDays: member.availableDays,
      },
    });
    results.push(result);
  }
  return results;
}

export async function getTeamCalendar(teamId: string) {
  return prisma.teamCalendar.findMany({
    where: { teamId },
    include: {
      user: { select: { id: true, name: true } },
      team: { select: { id: true, name: true } },
    },
  });
}

export async function upsertCalendarEntries(
  teamId: string,
  organizationId: string,
  entries: Array<{ userId: string; date: string; reason?: string }>
) {
  const results = [];
  for (const entry of entries) {
    const date = new Date(entry.date);
    // Delete existing and recreate (no unique constraint on teamId+userId+date)
    await prisma.teamCalendar.deleteMany({
      where: { teamId, userId: entry.userId, date },
    });
    const result = await prisma.teamCalendar.create({
      data: {
        teamId,
        userId: entry.userId,
        date,
        reason: entry.reason,
      },
    });
    results.push(result);
  }
  return results;
}
