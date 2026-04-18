export interface CreateDsuLogInput {
  sprintId: string;
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface UpsertMemberStatusInput {
  userId: string;
  yesterday?: string;
  today?: string;
  blockers?: string;
  status: 'PRESENT' | 'ABSENT' | 'REMOTE';
}

export interface DsuHistoryFilters {
  sprintId?: string;
  limit?: number;
  offset?: number;
}
