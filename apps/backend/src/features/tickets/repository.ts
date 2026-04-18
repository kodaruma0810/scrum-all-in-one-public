import { TicketStatus } from '@prisma/client';
import { prisma } from '../../db/client.js';
import { CreateTicketInput, UpdateTicketInput, TicketFilters, BurndownDataPoint } from './types.js';

export async function findMany(organizationId: string, filters: TicketFilters = {}, teamId?: string) {
  const where: Record<string, unknown> = { organizationId };
  if (filters.sprintId !== undefined) where.sprintId = filters.sprintId;
  if (filters.sprintGoalId !== undefined) where.sprintGoalId = filters.sprintGoalId;
  if (filters.status !== undefined) where.status = filters.status;
  if (filters.assigneeId !== undefined) where.assigneeId = filters.assigneeId;
  if (filters.type !== undefined) where.type = filters.type;
  if (teamId) where.sprint = { teamId };

  return prisma.ticket.findMany({
    where,
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      reporter: { select: { id: true, name: true } },
      sprintGoal: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findById(id: string, organizationId: string) {
  return prisma.ticket.findFirst({
    where: { id, organizationId },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      reporter: { select: { id: true, name: true } },
      sprintGoal: { select: { id: true, title: true } },
      subtasks: {
        include: {
          assignee: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
      comments: {
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      statusHistory: {
        include: {
          changedBy: { select: { id: true, name: true } },
        },
        orderBy: { changedAt: 'desc' },
      },
      dodCheckResults: {
        include: {
          dodItem: { select: { id: true, title: true, orderIndex: true } },
        },
        orderBy: { dodItem: { orderIndex: 'asc' } },
      },
    },
  });
}

export async function findBacklog(organizationId: string) {
  return prisma.ticket.findMany({
    where: { organizationId, sprintId: null },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      reporter: { select: { id: true, name: true } },
      sprintGoal: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function create(organizationId: string, reporterId: string, data: CreateTicketInput) {
  return prisma.ticket.create({
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority ?? 'MEDIUM',
      storyPoints: data.storyPoints,
      assigneeId: data.assigneeId,
      sprintId: data.sprintId,
      sprintGoalId: data.sprintGoalId,
      parentId: data.parentId,
      organizationId,
      reporterId,
    },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      reporter: { select: { id: true, name: true } },
    },
  });
}

export async function update(id: string, organizationId: string, data: UpdateTicketInput) {
  return prisma.ticket.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.storyPoints !== undefined && { storyPoints: data.storyPoints }),
      ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
      ...(data.sprintId !== undefined && { sprintId: data.sprintId }),
      ...(data.sprintGoalId !== undefined && { sprintGoalId: data.sprintGoalId }),
      ...(data.parentId !== undefined && { parentId: data.parentId }),
    },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      reporter: { select: { id: true, name: true } },
    },
  });
}

export async function deleteTicket(id: string, organizationId: string) {
  return prisma.ticket.delete({
    where: { id },
  });
}

export async function findComments(ticketId: string) {
  return prisma.ticketComment.findMany({
    where: { ticketId },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function createComment(ticketId: string, authorId: string, content: string) {
  return prisma.ticketComment.create({
    data: { ticketId, authorId, content },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
  });
}

export async function createStatusHistory(
  ticketId: string,
  fromStatus: TicketStatus | null,
  toStatus: TicketStatus,
  changedById: string
) {
  return prisma.ticketStatusHistory.create({
    data: {
      ticketId,
      fromStatus: fromStatus ?? undefined,
      toStatus,
      changedById,
    },
  });
}

export async function getBurndownData(sprintId: string, organizationId: string): Promise<BurndownDataPoint[]> {
  const sprint = await prisma.sprint.findFirst({
    where: { id: sprintId, organizationId },
  });
  if (!sprint) return [];

  const tickets = await prisma.ticket.findMany({
    where: { sprintId, organizationId },
    include: {
      statusHistory: { orderBy: { changedAt: 'asc' } },
    },
  });

  const totalPoints = tickets.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
  const start = new Date(sprint.startDate);
  const end = new Date(sprint.endDate);
  const days: BurndownDataPoint[] = [];

  let current = new Date(start);
  let dayIndex = 0;
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const idealRemaining = totalPoints - (totalPoints * dayIndex) / totalDays;

    // Calculate actual remaining: sum of points for tickets NOT done by end of this day
    const endOfDay = new Date(current);
    endOfDay.setHours(23, 59, 59, 999);

    let actualRemaining = 0;
    for (const ticket of tickets) {
      const doneHistory = ticket.statusHistory.find(
        (h) => h.toStatus === 'DONE' && h.changedAt <= endOfDay
      );
      if (!doneHistory) {
        actualRemaining += ticket.storyPoints ?? 0;
      }
    }

    days.push({ date: dateStr, ideal: Math.round(idealRemaining * 10) / 10, actual: actualRemaining });
    current.setDate(current.getDate() + 1);
    dayIndex++;
  }

  return days;
}

export async function getDodCheckResults(ticketId: string) {
  return prisma.dodCheckResult.findMany({
    where: { ticketId },
    include: {
      dodItem: { select: { id: true, title: true, orderIndex: true } },
    },
    orderBy: { dodItem: { orderIndex: 'asc' } },
  });
}

export async function updateDodCheckResult(
  ticketId: string,
  dodItemId: string,
  checked: boolean,
  checkedById: string
) {
  return prisma.dodCheckResult.upsert({
    where: { ticketId_dodItemId: { ticketId, dodItemId } },
    create: {
      ticketId,
      dodItemId,
      checked,
      checkedById: checked ? checkedById : null,
      checkedAt: checked ? new Date() : null,
    },
    update: {
      checked,
      checkedById: checked ? checkedById : null,
      checkedAt: checked ? new Date() : null,
    },
  });
}

export async function getTeamDodItems(organizationId: string) {
  // Find teams in the organization
  const teams = await prisma.team.findMany({
    where: { organizationId },
    select: { id: true },
  });
  const teamIds = teams.map((t) => t.id);

  return prisma.dodCheckItem.findMany({
    where: { teamId: { in: teamIds } },
    orderBy: { orderIndex: 'asc' },
  });
}
