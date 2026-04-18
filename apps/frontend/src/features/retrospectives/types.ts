export type RetroActionStatus = 'OPEN' | 'DONE';
export type RetroMode = 'CARD' | 'BOARD';

export interface RetroSummary {
  id: string;
  sprintId: string | null;
  sprintName: string | null;
  incrementName: string | null;
  title: string;
  format: string;
  mode: RetroMode;
  createdAt: string;
  itemCounts: Record<string, number>;
  actionCounts: { OPEN: number; DONE: number };
}

export interface Retro {
  id: string;
  teamId: string;
  sprintId: string | null;
  sprintName: string | null;
  incrementName: string | null;
  title: string;
  format: string;
  mode: RetroMode;
  createdAt: string;
  updatedAt: string;
  items: RetroItem[];
  actions: RetroAction[];
}

export interface RetroItem {
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

export interface RetroAction {
  id: string;
  title: string;
  assigneeId: string | null;
  assigneeName: string | null;
  status: RetroActionStatus;
  createdAt: string;
}
