import { prisma } from '../../db/client.js';
import bcrypt from 'bcryptjs';

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  avatarUrl: true,
  createdAt: true,
} as const;

export async function findAllUsers(organizationId: string) {
  return prisma.user.findMany({
    where: { organizationId },
    select: USER_SELECT,
    orderBy: { createdAt: 'asc' },
  });
}

export async function findUserById(id: string, organizationId: string) {
  return prisma.user.findFirst({
    where: { id, organizationId },
    select: USER_SELECT,
  });
}

export async function createUser(
  organizationId: string,
  data: { email: string; name: string; role: string; password: string }
) {
  const passwordHash = await bcrypt.hash(data.password, 10);
  return prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      role: data.role as any,
      passwordHash,
      organizationId,
    },
    select: USER_SELECT,
  });
}

export async function updateUser(
  id: string,
  data: { name?: string; avatarUrl?: string | null }
) {
  return prisma.user.update({
    where: { id },
    data,
    select: USER_SELECT,
  });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } });
}

export async function updateUserRole(id: string, role: string) {
  return prisma.user.update({
    where: { id },
    data: { role: role as any },
    select: USER_SELECT,
  });
}

export async function findTeam(organizationId: string, teamId?: string) {
  return prisma.team.findFirst({
    where: { organizationId, ...(teamId ? { id: teamId } : {}) },
    select: { id: true, name: true, ticketPrefix: true, velocityMode: true, spDaysRatio: true },
  });
}

export async function updateTeam(
  teamId: string,
  data: { name?: string; ticketPrefix?: string; velocityMode?: string; spDaysRatio?: number }
) {
  return prisma.team.update({
    where: { id: teamId },
    data: data as any,
    select: { id: true, name: true, ticketPrefix: true, velocityMode: true, spDaysRatio: true },
  });
}

export async function findTerminology(organizationId: string) {
  return prisma.systemSetting.findMany({
    where: { organizationId },
    select: { key: true, value: true },
    orderBy: { key: 'asc' },
  });
}

export async function upsertTerminology(organizationId: string, key: string, value: string) {
  return prisma.systemSetting.upsert({
    where: { organizationId_key: { organizationId, key } },
    update: { value },
    create: { organizationId, key, value },
    select: { key: true, value: true },
  });
}
