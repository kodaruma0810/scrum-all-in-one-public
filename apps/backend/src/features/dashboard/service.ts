import * as repository from './repository.js';
import { DashboardSummary, ActiveSprintSummary, LongTermGoalProgress, VelocityEntry, DashboardActionItem, DashboardWARule } from './types.js';

function calcRemainingDays(endDate: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export async function getDashboardSummary(
  organizationId: string,
  userId: string,
  teamId: string
): Promise<DashboardSummary> {
  const [sprint, longTermGoals, myTickets, velocityRaw, actionItemsRaw, waRulesRaw] = await Promise.all([
    repository.findActiveSprint(organizationId, teamId),
    repository.findLongTermGoalsWithProgress(organizationId, teamId),
    repository.findMyTickets(organizationId, userId, teamId),
    repository.findVelocityHistory(organizationId, teamId),
    repository.findOpenActionItems(teamId),
    repository.findActiveWARules(teamId),
  ]);

  let activeSprint: ActiveSprintSummary | null = null;
  if (sprint) {
    const totalTickets = sprint.tickets.length;
    const doneTickets = sprint.tickets.filter((t) => t.status === 'DONE').length;
    const totalStoryPoints = sprint.tickets.reduce((s, t) => s + (t.storyPoints ?? 0), 0);
    const doneStoryPoints = sprint.tickets
      .filter((t) => t.status === 'DONE')
      .reduce((s, t) => s + (t.storyPoints ?? 0), 0);
    activeSprint = {
      id: sprint.id,
      name: sprint.name,
      startDate: sprint.startDate.toISOString(),
      endDate: sprint.endDate.toISOString(),
      remainingDays: calcRemainingDays(sprint.endDate),
      progressRate: totalTickets > 0 ? Math.round((doneTickets / totalTickets) * 100) : 0,
      totalTickets,
      doneTickets,
      totalStoryPoints,
      doneStoryPoints,
    };
  }

  const goals: LongTermGoalProgress[] = longTermGoals.map((g) => {
    const total = g.sprintGoals.length;
    const achieved = g.sprintGoals.filter((sg) => sg.status === 'ACHIEVED').length;
    return {
      id: g.id,
      title: g.title,
      status: g.status,
      priority: g.priority,
      progressRate: total > 0 ? Math.round((achieved / total) * 100) : 0,
      totalSprintGoals: total,
      achievedSprintGoals: achieved,
    };
  });

  const velocityHistory: VelocityEntry[] = [...velocityRaw]
    .reverse()
    .map((s) => ({
      sprintId: s.id,
      sprintName: s.name,
      velocity: s.velocity,
      endDate: s.endDate.toISOString(),
    }));

  const actionItems: DashboardActionItem[] = actionItemsRaw.map((a) => ({
    id: a.id,
    title: a.title,
    assigneeId: a.assigneeId,
    assigneeName: a.assignee?.name ?? null,
    retroId: a.retrospectiveId,
    retroTitle: a.retrospective.title,
    createdAt: a.createdAt.toISOString(),
  }));

  const waRules: DashboardWARule[] = waRulesRaw.map((r) => ({
    id: r.id,
    title: r.title,
    categoryName: r.category?.name ?? null,
  }));

  return {
    activeSprint,
    longTermGoals: goals,
    actionItems,
    waRules,
    myTickets: myTickets.map((t) => ({
      id: t.id,
      ticketNumber: t.ticketNumber,
      title: t.title,
      status: t.status,
      priority: t.priority,
      storyPoints: t.storyPoints,
      sprint: t.sprint,
      sprintGoal: t.sprintGoal,
    })),
    velocityHistory,
  };
}
