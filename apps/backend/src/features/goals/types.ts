import { GoalPriority, GoalStatus, CommitmentType, SprintGoalStatus } from '@prisma/client';

export interface CreateIncrementInput {
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
  teamId: string;
  sprintDurationWeeks?: number;
}

export interface UpdateIncrementInput {
  name?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface CreateLongTermGoalInput {
  title: string;
  description?: string;
  priority: GoalPriority;
  commitment?: CommitmentType;
  assigneeId?: string;
}

export interface UpdateLongTermGoalInput {
  title?: string;
  description?: string;
  priority?: GoalPriority;
  status?: GoalStatus;
  commitment?: CommitmentType;
  assigneeId?: string | null;
}

export interface CreateSprintGoalInput {
  title: string;
  description?: string;
  longTermGoalId?: string;
}

export interface UpdateSprintGoalInput {
  title?: string;
  description?: string;
  status?: SprintGoalStatus;
  longTermGoalId?: string | null;
}
