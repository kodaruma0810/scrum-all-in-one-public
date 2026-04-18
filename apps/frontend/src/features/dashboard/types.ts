export interface ActiveSprintSummary {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  remainingDays: number;
  progressRate: number;
  totalTickets: number;
  doneTickets: number;
  totalStoryPoints: number;
  doneStoryPoints: number;
}

export interface LongTermGoalProgress {
  id: string;
  title: string;
  status: string;
  priority: string;
  progressRate: number;
  totalSprintGoals: number;
  achievedSprintGoals: number;
}

export interface MyTicket {
  id: string;
  ticketNumber: number;
  title: string;
  status: string;
  priority: string;
  storyPoints: number | null;
  sprint?: { id: string; name: string } | null;
  sprintGoal?: { id: string; title: string } | null;
}

export interface VelocityEntry {
  sprintId: string;
  sprintName: string;
  velocity: number | null;
  endDate: string;
}

export interface DashboardActionItem {
  id: string;
  title: string;
  assigneeId: string | null;
  assigneeName: string | null;
  retroId: string;
  retroTitle: string;
  createdAt: string;
}

export interface DashboardSummary {
  activeSprint: ActiveSprintSummary | null;
  longTermGoals: LongTermGoalProgress[];
  myTickets: MyTicket[];
  velocityHistory: VelocityEntry[];
  actionItems: DashboardActionItem[];
  waRules: DashboardWARule[];
}

export interface DashboardWARule {
  id: string;
  title: string;
  categoryName: string | null;
}
