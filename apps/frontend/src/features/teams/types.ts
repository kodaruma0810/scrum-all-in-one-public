export interface Team {
  id: string;
  name: string;
  ticketPrefix: string;
  velocityMode: string;
  memberCount: number;
}

export interface TeamMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  isOwner: boolean;
  joinedAt: string;
}
