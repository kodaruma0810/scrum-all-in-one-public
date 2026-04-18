export type GoalPriority = 'MUST_HAVE' | 'SHOULD_HAVE' | 'NICE_TO_HAVE';
export type GoalStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED' | 'NOT_ACHIEVED' | 'PARTIALLY_ACHIEVED';
export type CommitmentType = 'COMMITTED' | 'UNCOMMITTED';
export type SprintGoalStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED' | 'NOT_ACHIEVED';

export interface Increment {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
  teamId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  team?: { id: string; name: string };
  longTermGoals?: LongTermGoal[];
  sprints?: Sprint[];
  _count?: { sprints: number; longTermGoals: number };
}

export interface LongTermGoal {
  id: string;
  title: string;
  description?: string;
  priority: GoalPriority;
  status: GoalStatus;
  commitment: CommitmentType;
  assigneeId?: string;
  assignee?: { id: string; name: string; avatarUrl?: string };
  incrementId: string;
  organizationId: string;
  sprintGoals?: SprintGoal[];
  createdAt: string;
  updatedAt: string;
}

export interface SprintGoal {
  id: string;
  title: string;
  description?: string;
  status: SprintGoalStatus;
  longTermGoalId?: string;
  longTermGoal?: { id: string; title: string };
  sprintId: string;
  organizationId: string;
  tickets?: { id: string }[];
  _count?: { tickets: number };
  createdAt: string;
  updatedAt: string;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface HierarchyData {
  increment: Increment;
  longTermGoals: Array<
    LongTermGoal & {
      sprintGoals: Array<SprintGoal & { ticketCount: number }>;
    }
  >;
}

export interface ProgressData {
  longTermGoalId: string;
  title: string;
  status: GoalStatus;
  totalSprintGoals: number;
  achievedSprintGoals: number;
  progressRate: number;
}
