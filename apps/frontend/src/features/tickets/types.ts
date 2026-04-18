export type TicketStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TicketType = 'USER_STORY' | 'TASK' | 'BUG' | 'SUBTASK';
export type TicketPriority = 'HIGHEST' | 'HIGH' | 'MEDIUM' | 'LOW' | 'LOWEST';

export interface Ticket {
  id: string;
  ticketNumber: number;
  title: string;
  description?: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  storyPoints?: number;
  assigneeId?: string;
  assignee?: { id: string; name: string; avatarUrl?: string };
  reporter?: { id: string; name: string };
  sprintId?: string;
  sprintGoalId?: string;
  parentId?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  dodCheckResults?: DodCheckResult[];
  comments?: TicketComment[];
  statusHistory?: Array<{ id: string; fromStatus?: TicketStatus; toStatus: TicketStatus; changedAt: string }>;
  subtasks?: Ticket[];
}

export interface TicketComment {
  id: string;
  content: string;
  authorId: string;
  author?: { id: string; name: string; avatarUrl?: string };
  ticketId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DodCheckResult {
  id: string;
  ticketId: string;
  dodItemId: string;
  dodItem?: { id: string; title: string; orderIndex: number };
  checked: boolean;
  checkedById?: string;
  checkedAt?: string;
}

export interface BurndownDataPoint {
  date: string;
  ideal: number;
  actual: number;
}

export interface TicketFilters {
  sprintId?: string;
  sprintGoalId?: string;
  status?: TicketStatus;
  assigneeId?: string;
}
