export type SystemRole = 'ADMIN' | 'MEMBER';

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: SystemRole;
  avatarUrl: string | null;
  createdAt: string;
}

export interface TeamDto {
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

export interface CreateUserInput {
  email: string;
  name: string;
  role: SystemRole;
  password: string;
}

export interface UpdateUserInput {
  name?: string;
  avatarUrl?: string | null;
}

export interface UpdateTeamInput {
  name?: string;
  ticketPrefix?: string;
  velocityMode?: 'STORY_POINTS' | 'TICKET_COUNT';
  spDaysRatio?: number;
}
