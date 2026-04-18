import { TicketStatus, TicketType, TicketPriority } from '@prisma/client';

export interface CreateTicketInput {
  title: string;
  description?: string;
  type: TicketType;
  priority?: TicketPriority;
  storyPoints?: number;
  assigneeId?: string;
  sprintId?: string;
  sprintGoalId?: string;
  parentId?: string;
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  type?: TicketType;
  priority?: TicketPriority;
  storyPoints?: number | null;
  assigneeId?: string | null;
  sprintId?: string | null;
  sprintGoalId?: string | null;
  parentId?: string | null;
}

export interface TicketFilters {
  sprintId?: string;
  sprintGoalId?: string;
  status?: TicketStatus;
  assigneeId?: string;
  type?: TicketType;
}

export interface BurndownDataPoint {
  date: string;
  ideal: number;
  actual: number;
}
