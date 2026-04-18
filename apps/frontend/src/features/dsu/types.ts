export type MemberDsuStatus = 'PRESENT' | 'ABSENT' | 'REMOTE';

export interface DsuMemberStatusData {
  id: string;
  dsuLogId: string;
  userId: string;
  yesterday: string | null;
  today: string | null;
  blockers: string | null;
  status: MemberDsuStatus;
  user?: { id: string; name: string; avatarUrl?: string | null };
  createdAt: string;
  updatedAt: string;
}

export interface DsuLog {
  id: string;
  sprintId: string;
  date: string;
  notes: string | null;
  organizationId: string;
  memberStatuses?: DsuMemberStatusData[];
  createdAt: string;
  updatedAt: string;
}

export interface DsuSprintGoal {
  id: string;
  title: string;
  status: string;
  longTermGoal?: { id: string; title: string };
  tickets?: { id: string; status: string; storyPoints?: number | null }[];
}

export interface DsuMemberCapacity {
  id: string;
  userId: string;
  availableDays: number;
  user?: { id: string; name: string; avatarUrl?: string | null };
}

export interface DsuSprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  goal?: string | null;
  organizationId: string;
  sprintGoals?: DsuSprintGoal[];
  tickets?: { id: string; status: string; storyPoints?: number | null }[];
  memberCapacities?: DsuMemberCapacity[];
}

export interface DsuTodayData {
  sprint: DsuSprint | null;
  dsuLog: DsuLog | null;
}

export interface DsuHistoryFilters {
  sprintId?: string;
  limit?: number;
  offset?: number;
}
