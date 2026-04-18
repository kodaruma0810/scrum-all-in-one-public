import { prisma } from '../../db/client.js';
import {
  CreateIncrementInput,
  UpdateIncrementInput,
  CreateLongTermGoalInput,
  UpdateLongTermGoalInput,
  CreateSprintGoalInput,
  UpdateSprintGoalInput,
} from './types.js';

export async function findIncrements(organizationId: string, teamId: string) {
  return prisma.increment.findMany({
    where: { organizationId, teamId },
    include: {
      team: true,
      _count: {
        select: { sprints: true, longTermGoals: true },
      },
    },
    orderBy: { startDate: 'desc' },
  });
}

export async function findIncrementById(id: string, organizationId: string) {
  return prisma.increment.findFirst({
    where: { id, organizationId },
    include: {
      team: true,
      longTermGoals: {
        include: {
          assignee: true,
          sprintGoals: true,
        },
      },
      sprints: {
        orderBy: { startDate: 'asc' },
      },
    },
  });
}

export async function createIncrement(organizationId: string, data: CreateIncrementInput) {
  return prisma.increment.create({
    data: {
      name: data.name,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      description: data.description,
      teamId: data.teamId,
      organizationId,
    },
  });
}

export async function updateIncrement(id: string, organizationId: string, data: UpdateIncrementInput) {
  return prisma.increment.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
      ...(data.endDate !== undefined && { endDate: new Date(data.endDate) }),
      ...(data.description !== undefined && { description: data.description }),
    },
  });
}

export async function createSprint(
  organizationId: string,
  data: { name: string; startDate: string; endDate: string; incrementId: string; teamId: string }
) {
  return prisma.sprint.create({
    data: {
      name: data.name,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      incrementId: data.incrementId,
      teamId: data.teamId,
      organizationId,
    },
  });
}

export async function findLongTermGoals(incrementId: string, organizationId: string) {
  return prisma.longTermGoal.findMany({
    where: { incrementId, organizationId },
    include: {
      assignee: true,
      sprintGoals: {
        include: {
          _count: {
            select: { tickets: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function createLongTermGoal(
  incrementId: string,
  organizationId: string,
  data: CreateLongTermGoalInput
) {
  return prisma.longTermGoal.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority,
      commitment: data.commitment,
      assigneeId: data.assigneeId,
      incrementId,
      organizationId,
    },
  });
}

export async function updateLongTermGoal(
  id: string,
  incrementId: string,
  organizationId: string,
  data: UpdateLongTermGoalInput
) {
  return prisma.longTermGoal.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.commitment !== undefined && { commitment: data.commitment }),
      ...('assigneeId' in data && { assigneeId: data.assigneeId }),
    },
  });
}

export async function deleteIncrement(id: string, organizationId: string) {
  // 関連データをカスケード削除（外部キー制約のため順序が重要）
  // スプリントゴールに紐づくチケットの参照を外す
  const sprints = await prisma.sprint.findMany({ where: { incrementId: id }, select: { id: true } });
  const sprintIds = sprints.map((s) => s.id);
  if (sprintIds.length > 0) {
    await prisma.ticket.updateMany({
      where: { sprintId: { in: sprintIds } },
      data: { sprintId: null, sprintGoalId: null },
    });
    await prisma.sprintGoal.deleteMany({ where: { sprintId: { in: sprintIds } } });
    // スプリント関連データ削除
    await prisma.dsuMemberStatus.deleteMany({ where: { dsuLog: { sprintId: { in: sprintIds } } } });
    await prisma.dsuLog.deleteMany({ where: { sprintId: { in: sprintIds } } });
    await prisma.memberCapacity.deleteMany({ where: { sprintId: { in: sprintIds } } });
    await prisma.sprint.deleteMany({ where: { incrementId: id } });
  }
  // ゴール関連削除
  await prisma.sprintGoal.deleteMany({ where: { longTermGoal: { incrementId: id } } });
  await prisma.longTermGoal.deleteMany({ where: { incrementId: id } });
  // インクリメント本体削除
  return prisma.increment.delete({ where: { id } });
}

export async function deleteLongTermGoal(id: string, incrementId: string, organizationId: string) {
  // 関連するスプリントゴールを先に削除
  await prisma.sprintGoal.deleteMany({ where: { longTermGoalId: id } });
  return prisma.longTermGoal.delete({
    where: { id },
  });
}

export async function findSprintGoals(sprintId: string, organizationId: string) {
  return prisma.sprintGoal.findMany({
    where: { sprintId, organizationId },
    include: {
      longTermGoal: true,
      _count: {
        select: { tickets: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function createSprintGoal(
  sprintId: string,
  organizationId: string,
  data: CreateSprintGoalInput
) {
  return prisma.sprintGoal.create({
    data: {
      title: data.title,
      description: data.description,
      longTermGoalId: data.longTermGoalId,
      sprintId,
      organizationId,
    },
  });
}

export async function updateSprintGoal(
  id: string,
  sprintId: string,
  organizationId: string,
  data: UpdateSprintGoalInput
) {
  return prisma.sprintGoal.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status !== undefined && { status: data.status }),
      ...('longTermGoalId' in data && { longTermGoalId: data.longTermGoalId }),
    },
  });
}

export async function getHierarchyData(incrementId: string, organizationId: string) {
  const increment = await prisma.increment.findFirst({
    where: { id: incrementId, organizationId },
    include: {
      team: true,
      sprints: { orderBy: { startDate: 'asc' } },
    },
  });

  if (!increment) return null;

  const longTermGoals = await prisma.longTermGoal.findMany({
    where: { incrementId, organizationId },
    include: {
      assignee: true,
      sprintGoals: {
        include: {
          _count: {
            select: { tickets: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const goalsWithTicketCount = longTermGoals.map((goal) => ({
    ...goal,
    sprintGoals: goal.sprintGoals.map((sg) => ({
      ...sg,
      ticketCount: sg._count.tickets,
    })),
  }));

  return {
    increment,
    longTermGoals: goalsWithTicketCount,
  };
}

export async function getProgressData(incrementId: string, organizationId: string) {
  const longTermGoals = await prisma.longTermGoal.findMany({
    where: { incrementId, organizationId },
    include: {
      sprintGoals: {
        select: { id: true, status: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return longTermGoals.map((goal) => {
    const total = goal.sprintGoals.length;
    const achieved = goal.sprintGoals.filter((sg) => sg.status === 'ACHIEVED').length;
    const progressRate = total > 0 ? Math.round((achieved / total) * 100) : 0;

    return {
      longTermGoalId: goal.id,
      title: goal.title,
      status: goal.status,
      totalSprintGoals: total,
      achievedSprintGoals: achieved,
      progressRate,
    };
  });
}
