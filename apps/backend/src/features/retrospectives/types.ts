export type RetroModeType = 'CARD' | 'BOARD';

export interface RetroDto {
  id: string;
  teamId: string;
  sprintId: string | null;
  sprintName: string | null;
  incrementName: string | null;
  title: string;
  format: string;
  mode: RetroModeType;
  createdAt: string;
  updatedAt: string;
  items: RetroItemDto[];
  actions: RetroActionDto[];
}

export interface RetroSummaryDto {
  id: string;
  sprintId: string | null;
  sprintName: string | null;
  incrementName: string | null;
  title: string;
  format: string;
  mode: RetroModeType;
  createdAt: string;
  itemCounts: Record<string, number>;
  actionCounts: { OPEN: number; DONE: number };
}

export interface RetroItemDto {
  id: string;
  type: string;
  body: string;
  authorId: string;
  authorName: string;
  voteCount: number;
  votedByMe: boolean;
  orderIndex: number;
  posX: number;
  posY: number;
  fontSize: number;
  fontColor: string;
  createdAt: string;
}

export interface RetroActionDto {
  id: string;
  title: string;
  assigneeId: string | null;
  assigneeName: string | null;
  status: 'OPEN' | 'DONE';
  createdAt: string;
}
