import { prisma } from '../../db/client.js';
import type { WAChangeType } from '@prisma/client';

// --- Category ---

export async function findCategoriesByTeam(teamId: string) {
  return prisma.workingAgreementCategory.findMany({
    where: { teamId },
    include: {
      rules: {
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
        include: {
          proposedBy: { select: { id: true, name: true } },
          lastModifiedBy: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
  });
}

export async function findCategoryById(id: string) {
  return prisma.workingAgreementCategory.findUnique({
    where: { id },
  });
}

export async function createCategory(teamId: string, data: { name: string; orderIndex?: number }) {
  return prisma.workingAgreementCategory.create({
    data: {
      teamId,
      name: data.name,
      orderIndex: data.orderIndex ?? 0,
    },
  });
}

export async function updateCategory(id: string, data: { name?: string; orderIndex?: number }) {
  return prisma.workingAgreementCategory.update({
    where: { id },
    data,
  });
}

export async function deleteCategory(id: string) {
  return prisma.workingAgreementCategory.delete({
    where: { id },
  });
}

// --- Rule ---

export async function findRuleById(id: string) {
  return prisma.workingAgreementRule.findUnique({
    where: { id },
    include: {
      proposedBy: { select: { id: true, name: true } },
      lastModifiedBy: { select: { id: true, name: true } },
      category: { select: { id: true, name: true, teamId: true } },
    },
  });
}

export async function findUncategorizedRulesByTeam(teamId: string) {
  return prisma.workingAgreementRule.findMany({
    where: { teamId, categoryId: null },
    orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
    include: {
      proposedBy: { select: { id: true, name: true } },
      lastModifiedBy: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
    },
  });
}

export async function findActiveRulesByTeam(teamId: string) {
  return prisma.workingAgreementCategory.findMany({
    where: { teamId },
    include: {
      rules: {
        where: { isActive: true },
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
        include: {
          proposedBy: { select: { id: true, name: true } },
          lastModifiedBy: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
  });
}

export async function findActiveUncategorizedRulesByTeam(teamId: string) {
  return prisma.workingAgreementRule.findMany({
    where: { teamId, categoryId: null, isActive: true },
    orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
    include: {
      proposedBy: { select: { id: true, name: true } },
      lastModifiedBy: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
    },
  });
}

export async function createRule(data: {
  teamId: string;
  categoryId?: string | null;
  title: string;
  description?: string;
  agreedAt: Date;
  proposedById: string;
  lastModifiedById: string;
  orderIndex?: number;
}) {
  return prisma.workingAgreementRule.create({
    data: {
      teamId: data.teamId,
      categoryId: data.categoryId ?? null,
      title: data.title,
      description: data.description ?? null,
      agreedAt: data.agreedAt,
      proposedById: data.proposedById,
      lastModifiedById: data.lastModifiedById,
      orderIndex: data.orderIndex ?? 0,
    },
    include: {
      proposedBy: { select: { id: true, name: true } },
      lastModifiedBy: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
    },
  });
}

export async function updateRule(
  id: string,
  data: {
    title?: string;
    description?: string | null;
    agreedAt?: Date;
    isActive?: boolean;
    categoryId?: string | null;
    lastModifiedById: string;
  }
) {
  return prisma.workingAgreementRule.update({
    where: { id },
    data,
    include: {
      proposedBy: { select: { id: true, name: true } },
      lastModifiedBy: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
    },
  });
}

// --- History ---

export async function createHistory(data: {
  ruleId: string;
  changedById: string;
  changeType: WAChangeType;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
}) {
  return prisma.workingAgreementHistory.create({
    data: {
      ruleId: data.ruleId,
      changedById: data.changedById,
      changeType: data.changeType,
      fieldName: data.fieldName ?? null,
      oldValue: data.oldValue ?? null,
      newValue: data.newValue ?? null,
    },
  });
}

export async function findHistoryByRule(ruleId: string) {
  return prisma.workingAgreementHistory.findMany({
    where: { ruleId },
    include: {
      changedBy: { select: { id: true, name: true } },
    },
    orderBy: { changedAt: 'desc' },
  });
}
