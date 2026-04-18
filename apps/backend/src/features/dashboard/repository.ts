import { prisma } from '../../db/client.js';

export async function findActiveSprint(organizationId: string, teamId: string) {
  return prisma.sprint.findFirst({
    where: { organizationId, teamId, status: 'ACTIVE' },
    include: {
      tickets: { select: { id: true, status: true, storyPoints: true } },
    },
  });
}

export async function findLongTermGoalsWithProgress(organizationId: string, teamId: string) {
  return prisma.longTermGoal.findMany({
    where: { organizationId, increment: { teamId } },
    include: {
      sprintGoals: { select: { id: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
}

export async function findMyTickets(organizationId: string, userId: string, teamId: string) {
  return prisma.ticket.findMany({
    where: { organizationId, assigneeId: userId, sprint: { teamId } },
    select: {
      id: true,
      ticketNumber: true,
      title: true,
      status: true,
      priority: true,
      storyPoints: true,
      sprint: { select: { id: true, name: true } },
      sprintGoal: { select: { id: true, title: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 5,
  });
}

export async function findOpenActionItems(teamId: string) {
  return prisma.retroActionItem.findMany({
    where: { status: 'OPEN', retrospective: { teamId } },
    include: {
      assignee: { select: { id: true, name: true } },
      retrospective: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
}

export async function findActiveWARules(teamId: string) {
  return prisma.workingAgreementRule.findMany({
    where: { teamId, isActive: true },
    select: {
      id: true,
      title: true,
      category: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 15,
  });
}

export async function findVelocityHistory(organizationId: string, teamId: string) {
  return prisma.sprint.findMany({
    where: { organizationId, teamId, status: { in: ['COMPLETED', 'ARCHIVED'] } },
    select: { id: true, name: true, velocity: true, endDate: true },
    orderBy: { endDate: 'desc' },
    take: 5,
  });
}
