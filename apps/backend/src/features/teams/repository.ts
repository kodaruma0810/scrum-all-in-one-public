import { prisma } from '../../db/client.js';

export async function findTeamsByUser(userId: string, organizationId: string) {
  return prisma.team.findMany({
    where: {
      organizationId,
      members: { some: { userId } },
    },
    include: {
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function createTeam(
  organizationId: string,
  data: { name: string; ticketPrefix?: string }
) {
  return prisma.team.create({
    data: {
      name: data.name,
      ticketPrefix: data.ticketPrefix ?? 'TKT',
      organizationId,
    },
    include: {
      _count: { select: { members: true } },
    },
  });
}

export async function findTeamMembers(teamId: string) {
  return prisma.teamMember.findMany({
    where: { teamId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { joinedAt: 'asc' },
  });
}

export async function addTeamMember(
  teamId: string,
  userId: string,
  options?: { role?: string; isOwner?: boolean }
) {
  return prisma.teamMember.create({
    data: {
      teamId,
      userId,
      role: (options?.role as any) ?? 'DEVELOPER',
      isOwner: options?.isOwner ?? false,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

export async function removeTeamMember(teamId: string, userId: string) {
  return prisma.teamMember.delete({
    where: { teamId_userId: { teamId, userId } },
  });
}

export async function isTeamMember(teamId: string, userId: string): Promise<boolean> {
  const member = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
    select: { id: true },
  });
  return member !== null;
}

export async function findTeamMember(teamId: string, userId: string) {
  return prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
    select: { id: true, role: true, isOwner: true },
  });
}

export async function updateMemberRole(teamId: string, userId: string, role: string) {
  return prisma.teamMember.update({
    where: { teamId_userId: { teamId, userId } },
    data: { role: role as any },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

export async function countOwners(teamId: string): Promise<number> {
  return prisma.teamMember.count({
    where: { teamId, isOwner: true },
  });
}

export async function deleteTeam(teamId: string) {
  // メンバーを先に削除（外部キー制約）
  await prisma.teamMember.deleteMany({ where: { teamId } });
  await prisma.team.delete({ where: { id: teamId } });
}

export async function updateMemberOwner(teamId: string, userId: string, isOwner: boolean) {
  return prisma.teamMember.update({
    where: { teamId_userId: { teamId, userId } },
    data: { isOwner },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}
