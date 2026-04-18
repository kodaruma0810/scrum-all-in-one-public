export type SystemRole = 'ADMIN' | 'MEMBER';

export const SYSTEM_ROLE_LABELS: Record<SystemRole, string> = {
  ADMIN: '管理者',
  MEMBER: 'メンバー',
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: SystemRole;
  avatarUrl: string | null;
  createdAt: string;
}

export interface TeamSettings {
  id: string;
  name: string;
  ticketPrefix: string;
  velocityMode: 'STORY_POINTS' | 'TICKET_COUNT';
  spDaysRatio: number;
}

export interface TerminologyEntry {
  key: string;
  value: string;
}

export const DEFAULT_TERMINOLOGY: TerminologyEntry[] = [
  { key: 'increment', value: 'PI' },
  { key: 'sprint', value: 'スプリント' },
  { key: 'longTermGoal', value: 'PIゴール' },
  { key: 'sprintGoal', value: 'ITゴール' },
  { key: 'backlog', value: 'バックログ' },
  { key: 'ticket', value: 'チケット' },
  { key: 'storyPoints', value: 'ストーリーポイント' },
  { key: 'velocity', value: 'ベロシティ' },
  { key: 'retrospective', value: 'レトロスペクティブ' },
  { key: 'workingAgreement', value: 'ワーキングアグリーメント' },
  { key: 'dailyScrum', value: 'デイリースクラム' },
  { key: 'planning', value: 'プランニング' },
];
