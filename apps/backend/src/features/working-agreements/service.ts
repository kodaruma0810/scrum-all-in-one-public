import * as repository from './repository.js';
import { prisma } from '../../db/client.js';
import type { WACategoryDto, WARuleDto, WAHistoryDto, WAListResponseDto } from './types.js';
import type { WAChangeType } from '@prisma/client';

async function resolveUserId(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (user) return user.id;
  const defaultUser = await prisma.user.findFirst({ select: { id: true } });
  if (defaultUser) return defaultUser.id;
  throw new Error('ユーザーが見つかりません');
}

function toRuleDto(rule: {
  id: string;
  teamId: string;
  categoryId: string | null;
  category: { id: string; name: string } | null;
  title: string;
  description: string | null;
  isActive: boolean;
  agreedAt: Date;
  proposedById: string;
  proposedBy: { id: string; name: string };
  lastModifiedById: string;
  lastModifiedBy: { id: string; name: string };
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}): WARuleDto {
  return {
    id: rule.id,
    teamId: rule.teamId,
    categoryId: rule.categoryId,
    categoryName: rule.category?.name ?? null,
    title: rule.title,
    description: rule.description,
    isActive: rule.isActive,
    agreedAt: rule.agreedAt.toISOString(),
    proposedById: rule.proposedBy.id,
    proposedByName: rule.proposedBy.name,
    lastModifiedById: rule.lastModifiedBy.id,
    lastModifiedByName: rule.lastModifiedBy.name,
    orderIndex: rule.orderIndex,
    createdAt: rule.createdAt.toISOString(),
    updatedAt: rule.updatedAt.toISOString(),
  };
}

function toHistoryDto(h: {
  id: string;
  ruleId: string;
  changedById: string;
  changedBy: { id: string; name: string };
  changedAt: Date;
  changeType: string;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
}): WAHistoryDto {
  return {
    id: h.id,
    ruleId: h.ruleId,
    changedById: h.changedBy.id,
    changedByName: h.changedBy.name,
    changedAt: h.changedAt.toISOString(),
    changeType: h.changeType,
    fieldName: h.fieldName,
    oldValue: h.oldValue,
    newValue: h.newValue,
  };
}

// --- Category ---

const DEFAULT_CATEGORIES = [
  'コミュニケーション',
  '作業時間',
  'DoD（完了条件）',
  'コードレビュー',
  'ミーティングルール',
];

export async function listAll(teamId: string): Promise<WAListResponseDto> {
  const categories = await repository.findCategoriesByTeam(teamId);

  // 初回アクセス時にデフォルトカテゴリを自動作成
  if (categories.length === 0) {
    for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
      await repository.createCategory(teamId, { name: DEFAULT_CATEGORIES[i], orderIndex: i });
    }
    const created = await repository.findCategoriesByTeam(teamId);
    const uncategorized = await repository.findUncategorizedRulesByTeam(teamId);
    return {
      categories: created.map((cat) => ({
        id: cat.id,
        teamId: cat.teamId,
        name: cat.name,
        orderIndex: cat.orderIndex,
        rules: cat.rules.map(toRuleDto),
      })),
      uncategorizedRules: uncategorized.map(toRuleDto),
    };
  }

  const uncategorized = await repository.findUncategorizedRulesByTeam(teamId);
  return {
    categories: categories.map((cat) => ({
      id: cat.id,
      teamId: cat.teamId,
      name: cat.name,
      orderIndex: cat.orderIndex,
      rules: cat.rules.map(toRuleDto),
    })),
    uncategorizedRules: uncategorized.map(toRuleDto),
  };
}

/** @deprecated 後方互換用 — listAll を使ってください */
export async function listCategories(teamId: string): Promise<WACategoryDto[]> {
  const result = await listAll(teamId);
  return result.categories;
}

export async function createCategory(
  teamId: string,
  input: { name: string; orderIndex?: number }
): Promise<{ id: string }> {
  const cat = await repository.createCategory(teamId, input);
  return { id: cat.id };
}

export async function updateCategory(
  id: string,
  input: { name?: string; orderIndex?: number }
): Promise<void> {
  await repository.updateCategory(id, input);
}

export async function deleteCategory(id: string): Promise<void> {
  await repository.deleteCategory(id);
}

// --- Rule ---

export async function createRule(
  input: {
    teamId: string;
    categoryId?: string | null;
    title: string;
    description?: string;
    agreedAt: Date;
    proposedById: string;
    orderIndex?: number;
  },
  userId: string
): Promise<WARuleDto> {
  const resolvedUserId = await resolveUserId(userId);
  const resolvedProposerId = await resolveUserId(input.proposedById);

  const rule = await repository.createRule({
    ...input,
    categoryId: input.categoryId ?? null,
    proposedById: resolvedProposerId,
    lastModifiedById: resolvedUserId,
  });

  await repository.createHistory({
    ruleId: rule.id,
    changedById: resolvedUserId,
    changeType: 'CREATED' as WAChangeType,
    fieldName: undefined,
    oldValue: undefined,
    newValue: rule.title,
  });

  return toRuleDto(rule);
}

export async function updateRule(
  id: string,
  input: {
    title?: string;
    description?: string | null;
    agreedAt?: Date;
    isActive?: boolean;
    categoryId?: string | null;
  },
  userId: string
): Promise<WARuleDto> {
  const resolvedUserId = await resolveUserId(userId);
  const existing = await repository.findRuleById(id);
  if (!existing) {
    throw Object.assign(new Error('ルールが見つかりません'), { statusCode: 404 });
  }

  // Diff を記録
  const diffs: { field: string; oldVal: string; newVal: string; type: WAChangeType }[] = [];

  if (input.title !== undefined && input.title !== existing.title) {
    diffs.push({ field: 'title', oldVal: existing.title, newVal: input.title, type: 'UPDATED' as WAChangeType });
  }
  if (input.description !== undefined && input.description !== existing.description) {
    diffs.push({
      field: 'description',
      oldVal: existing.description ?? '',
      newVal: input.description ?? '',
      type: 'UPDATED' as WAChangeType,
    });
  }
  if (input.agreedAt !== undefined) {
    const oldDate = existing.agreedAt.toISOString().split('T')[0];
    const newDate = input.agreedAt.toISOString().split('T')[0];
    if (oldDate !== newDate) {
      diffs.push({ field: 'agreedAt', oldVal: oldDate, newVal: newDate, type: 'UPDATED' as WAChangeType });
    }
  }
  if (input.isActive !== undefined && input.isActive !== existing.isActive) {
    const type = input.isActive ? 'ACTIVATED' : 'DEACTIVATED';
    diffs.push({
      field: 'isActive',
      oldVal: String(existing.isActive),
      newVal: String(input.isActive),
      type: type as WAChangeType,
    });
  }
  if (input.categoryId !== undefined && input.categoryId !== existing.categoryId) {
    const oldCatName = existing.category?.name ?? '未分類';
    // 新しいカテゴリ名を取得
    let newCatName = '未分類';
    if (input.categoryId) {
      const newCat = await repository.findCategoryById(input.categoryId);
      newCatName = newCat?.name ?? '不明';
    }
    diffs.push({
      field: 'category',
      oldVal: oldCatName,
      newVal: newCatName,
      type: 'UPDATED' as WAChangeType,
    });
  }

  const rule = await repository.updateRule(id, {
    ...input,
    lastModifiedById: resolvedUserId,
  });

  for (const diff of diffs) {
    await repository.createHistory({
      ruleId: id,
      changedById: resolvedUserId,
      changeType: diff.type,
      fieldName: diff.field,
      oldValue: diff.oldVal,
      newValue: diff.newVal,
    });
  }

  return toRuleDto(rule);
}

export async function toggleRuleActive(
  id: string,
  isActive: boolean,
  userId: string
): Promise<WARuleDto> {
  return updateRule(id, { isActive }, userId);
}

// --- History ---

export async function getRuleHistory(ruleId: string): Promise<WAHistoryDto[]> {
  const history = await repository.findHistoryByRule(ruleId);
  return history.map(toHistoryDto);
}

// --- Active (share view) ---

export async function getActiveRules(teamId: string): Promise<WAListResponseDto> {
  const categories = await repository.findActiveRulesByTeam(teamId);
  const uncategorized = await repository.findActiveUncategorizedRulesByTeam(teamId);
  return {
    categories: categories
      .filter((cat) => cat.rules.length > 0)
      .map((cat) => ({
        id: cat.id,
        teamId: cat.teamId,
        name: cat.name,
        orderIndex: cat.orderIndex,
        rules: cat.rules.map(toRuleDto),
      })),
    uncategorizedRules: uncategorized.map(toRuleDto),
  };
}
