import * as repository from './repository.js';
import {
  CreateIncrementInput,
  UpdateIncrementInput,
  CreateLongTermGoalInput,
  UpdateLongTermGoalInput,
  CreateSprintGoalInput,
  UpdateSprintGoalInput,
} from './types.js';

export async function listIncrements(organizationId: string, teamId: string) {
  return repository.findIncrements(organizationId, teamId);
}

export async function getIncrement(id: string, organizationId: string) {
  const increment = await repository.findIncrementById(id, organizationId);
  if (!increment) {
    throw Object.assign(new Error('Increment not found'), { status: 404 });
  }
  return increment;
}

export async function createIncrement(organizationId: string, data: CreateIncrementInput) {
  const increment = await repository.createIncrement(organizationId, data);

  // スプリントひな型の自動生成
  if (data.sprintDurationWeeks && data.sprintDurationWeeks > 0) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const durationMs = data.sprintDurationWeeks * 7 * 24 * 60 * 60 * 1000;
    let sprintStart = new Date(start);
    let sprintNum = 1;

    while (sprintStart.getTime() < end.getTime()) {
      const sprintEnd = new Date(Math.min(sprintStart.getTime() + durationMs - 1, end.getTime()));
      await repository.createSprint(organizationId, {
        name: `Sprint ${sprintNum}`,
        startDate: sprintStart.toISOString(),
        endDate: sprintEnd.toISOString(),
        incrementId: increment.id,
        teamId: data.teamId,
      });
      sprintStart = new Date(sprintStart.getTime() + durationMs);
      sprintNum++;
    }
  }

  return increment;
}

export async function updateIncrement(id: string, organizationId: string, data: UpdateIncrementInput) {
  const existing = await repository.findIncrementById(id, organizationId);
  if (!existing) {
    throw Object.assign(new Error('Increment not found'), { status: 404 });
  }
  return repository.updateIncrement(id, organizationId, data);
}

export async function deleteIncrement(id: string, organizationId: string) {
  const existing = await repository.findIncrementById(id, organizationId);
  if (!existing) {
    throw Object.assign(new Error('Increment not found'), { status: 404 });
  }
  return repository.deleteIncrement(id, organizationId);
}

export async function listLongTermGoals(incrementId: string, organizationId: string) {
  return repository.findLongTermGoals(incrementId, organizationId);
}

export async function createLongTermGoal(
  incrementId: string,
  organizationId: string,
  data: CreateLongTermGoalInput
) {
  const increment = await repository.findIncrementById(incrementId, organizationId);
  if (!increment) {
    throw Object.assign(new Error('Increment not found'), { status: 404 });
  }
  return repository.createLongTermGoal(incrementId, organizationId, data);
}

export async function updateLongTermGoal(
  id: string,
  incrementId: string,
  organizationId: string,
  data: UpdateLongTermGoalInput
) {
  return repository.updateLongTermGoal(id, incrementId, organizationId, data);
}

export async function deleteLongTermGoal(id: string, incrementId: string, organizationId: string) {
  return repository.deleteLongTermGoal(id, incrementId, organizationId);
}

export async function listSprintGoals(sprintId: string, organizationId: string) {
  return repository.findSprintGoals(sprintId, organizationId);
}

export async function createSprintGoal(
  sprintId: string,
  organizationId: string,
  data: CreateSprintGoalInput
) {
  return repository.createSprintGoal(sprintId, organizationId, data);
}

export async function updateSprintGoal(
  id: string,
  sprintId: string,
  organizationId: string,
  data: UpdateSprintGoalInput
) {
  return repository.updateSprintGoal(id, sprintId, organizationId, data);
}

export async function getHierarchy(incrementId: string, organizationId: string) {
  const data = await repository.getHierarchyData(incrementId, organizationId);
  if (!data) {
    throw Object.assign(new Error('Increment not found'), { status: 404 });
  }
  return data;
}

export async function getProgress(incrementId: string, organizationId: string) {
  return repository.getProgressData(incrementId, organizationId);
}
