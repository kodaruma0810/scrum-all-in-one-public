import * as repository from './repository.js';
import type {
  RetroDto,
  RetroSummaryDto,
  RetroItemDto,
  RetroActionDto,
} from './types.js';
import type { RetroActionStatus } from '@prisma/client';

function toItemDto(
  item: {
    id: string;
    type: string;
    body: string;
    authorId: string;
    author: { id: string; name: string };
    votes: { userId: string }[];
    orderIndex: number;
    posX: number;
    posY: number;
    fontSize: number;
    fontColor: string;
    createdAt: Date;
  },
  currentUserId: string
): RetroItemDto {
  return {
    id: item.id,
    type: item.type,
    body: item.body,
    authorId: item.author.id,
    authorName: item.author.name,
    voteCount: item.votes.length,
    votedByMe: item.votes.some((v) => v.userId === currentUserId),
    orderIndex: item.orderIndex,
    posX: item.posX,
    posY: item.posY,
    fontSize: item.fontSize,
    fontColor: item.fontColor,
    createdAt: item.createdAt.toISOString(),
  };
}

function toActionDto(action: {
  id: string;
  title: string;
  assigneeId: string | null;
  assignee: { id: string; name: string } | null;
  status: RetroActionStatus;
  createdAt: Date;
}): RetroActionDto {
  return {
    id: action.id,
    title: action.title,
    assigneeId: action.assigneeId,
    assigneeName: action.assignee?.name ?? null,
    status: action.status,
    createdAt: action.createdAt.toISOString(),
  };
}

// --- List ---

export async function listRetros(teamId: string): Promise<RetroSummaryDto[]> {
  const retros = await repository.findRetrosByTeam(teamId);
  return retros.map((r) => {
    const itemCounts: Record<string, number> = {};
    r.items.forEach((item) => {
      itemCounts[item.type] = (itemCounts[item.type] ?? 0) + 1;
    });
    const actionCounts = { OPEN: 0, DONE: 0 };
    r.actions.forEach((a) => {
      actionCounts[a.status]++;
    });
    return {
      id: r.id,
      sprintId: r.sprintId,
      sprintName: r.sprint?.name ?? null,
      incrementName: r.sprint?.increment?.name ?? null,
      title: r.title,
      format: r.format,
      mode: r.mode as 'CARD' | 'BOARD',
      createdAt: r.createdAt.toISOString(),
      itemCounts,
      actionCounts,
    };
  });
}

// --- Detail ---

export async function getRetro(id: string, currentUserId: string): Promise<RetroDto | null> {
  const r = await repository.findRetroById(id);
  if (!r) return null;
  return {
    id: r.id,
    teamId: r.teamId,
    sprintId: r.sprintId,
    sprintName: r.sprint?.name ?? null,
    incrementName: r.sprint?.increment?.name ?? null,
    title: r.title,
    format: r.format,
    mode: r.mode as 'CARD' | 'BOARD',
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    items: r.items.map((item) => toItemDto(item, currentUserId)),
    actions: r.actions.map(toActionDto),
  };
}

// --- CRUD Retro ---

export async function createRetro(
  teamId: string,
  input: { title: string; sprintId?: string | null; format?: string; mode?: 'CARD' | 'BOARD' }
): Promise<{ id: string }> {
  const retro = await repository.createRetro({ teamId, ...input });
  return { id: retro.id };
}

export async function updateRetro(
  id: string,
  input: { title?: string; sprintId?: string | null }
): Promise<void> {
  await repository.updateRetro(id, input);
}

export async function deleteRetro(id: string): Promise<void> {
  await repository.deleteRetro(id);
}

// --- Items ---

export async function addItem(
  retroId: string,
  input: { type: string; body: string },
  userId: string
): Promise<RetroItemDto> {
  const item = await repository.createItem({
    retrospectiveId: retroId,
    type: input.type,
    body: input.body,
    authorId: userId,
  });
  return toItemDto(item, userId);
}

export async function updateItem(
  id: string,
  input: { body?: string; type?: string; posX?: number; posY?: number; fontSize?: number; fontColor?: string },
  userId: string
): Promise<RetroItemDto> {
  const item = await repository.updateItem(id, input);
  return toItemDto(item, userId);
}

export async function deleteItem(id: string): Promise<void> {
  await repository.deleteItem(id);
}

// --- Votes ---

export async function toggleVote(itemId: string, userId: string): Promise<{ voted: boolean }> {
  const voted = await repository.toggleVote(itemId, userId);
  return { voted };
}

// --- Actions ---

export async function addAction(
  retroId: string,
  input: { title: string; assigneeId?: string | null }
): Promise<RetroActionDto> {
  const action = await repository.createAction({
    retrospectiveId: retroId,
    ...input,
  });
  return toActionDto(action);
}

export async function updateAction(
  id: string,
  input: { title?: string; assigneeId?: string | null; status?: RetroActionStatus }
): Promise<RetroActionDto> {
  const action = await repository.updateAction(id, input);
  return toActionDto(action);
}

export async function deleteAction(id: string): Promise<void> {
  await repository.deleteAction(id);
}
