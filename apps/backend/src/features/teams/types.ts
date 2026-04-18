export interface TeamDto {
  id: string;
  name: string;
  ticketPrefix: string;
  velocityMode: string;
  memberCount: number;
}

export interface TeamMemberDto {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  isOwner: boolean;
  joinedAt: string;
}

export interface CreateTeamInput {
  name: string;
  ticketPrefix?: string;
}

export interface AddMemberInput {
  userId: string;
}
