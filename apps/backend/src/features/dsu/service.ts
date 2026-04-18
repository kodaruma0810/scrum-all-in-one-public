import * as repository from './repository.js';
import { CreateDsuLogInput, UpsertMemberStatusInput, DsuHistoryFilters } from './types.js';

export async function getTodayDsu(organizationId: string, teamId: string) {
  const { sprint, dsuLog } = await repository.findTodayInfo(organizationId, teamId);

  if (!sprint) {
    return { sprint: null, dsuLog: null };
  }

  if (!dsuLog) {
    const today = new Date().toISOString().split('T')[0];
    const created = await repository.createDsuLog(organizationId, {
      sprintId: sprint.id,
      date: today,
    });
    return { sprint, dsuLog: created };
  }

  return { sprint, dsuLog };
}

export async function createDsuLog(organizationId: string, data: CreateDsuLogInput) {
  const sprint = await import('../../db/client.js').then(({ prisma }) =>
    prisma.sprint.findFirst({ where: { id: data.sprintId, organizationId } })
  );

  if (!sprint) {
    throw { statusCode: 404, message: 'Sprint not found' };
  }

  return repository.createDsuLog(organizationId, data);
}

export async function getDsuLog(id: string, organizationId: string) {
  const log = await repository.findDsuLogById(id, organizationId);
  if (!log) {
    throw { statusCode: 404, message: 'DSU log not found' };
  }
  return log;
}

export async function upsertMemberStatus(
  dsuLogId: string,
  organizationId: string,
  input: UpsertMemberStatusInput
) {
  const log = await repository.findDsuLogById(dsuLogId, organizationId);
  if (!log) {
    throw { statusCode: 404, message: 'DSU log not found' };
  }
  return repository.upsertMemberStatus(dsuLogId, input);
}

export async function updateDsuNotes(id: string, organizationId: string, notes: string) {
  const log = await repository.findDsuLogById(id, organizationId);
  if (!log) {
    throw { statusCode: 404, message: 'DSU log not found' };
  }
  return repository.updateNotes(id, organizationId, notes);
}

export async function getDsuHistory(organizationId: string, filters: DsuHistoryFilters = {}) {
  return repository.findDsuHistory(organizationId, filters);
}
