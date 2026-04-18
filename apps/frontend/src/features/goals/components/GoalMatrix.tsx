import { Increment, LongTermGoal, SprintGoal, Sprint } from '../types';
import { cn } from '@/lib/utils';
import { useTerms } from '@/hooks/useTerms';

interface GoalMatrixProps {
  increment: Increment & {
    longTermGoals?: (LongTermGoal & { sprintGoals?: SprintGoal[] })[];
    sprints?: Sprint[];
  };
}

function getSprintGoalsForCell(
  longTermGoal: LongTermGoal & { sprintGoals?: SprintGoal[] },
  sprint: Sprint
): SprintGoal[] {
  if (!longTermGoal.sprintGoals) return [];
  return longTermGoal.sprintGoals.filter((sg) => sg.sprintId === sprint.id);
}

export default function GoalMatrix({ increment }: GoalMatrixProps) {
  const t = useTerms();
  const longTermGoals = increment.longTermGoals ?? [];
  const sprints = increment.sprints ?? [];

  if (longTermGoals.length === 0 || sprints.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {longTermGoals.length === 0 ? `${t('longTermGoal')}がありません` : `${t('sprint')}がありません`}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-border text-sm">
        <thead>
          <tr className="bg-card">
            <th className="border border-border px-4 py-3 text-left font-semibold text-foreground min-w-[200px]">
              {t('longTermGoal')}
            </th>
            {sprints.map((sprint) => (
              <th
                key={sprint.id}
                className="border border-border px-4 py-3 text-left font-semibold text-foreground min-w-[160px]"
              >
                <div>{sprint.name}</div>
                <div className="text-xs font-normal text-muted-foreground tabular-nums">
                  {new Date(sprint.startDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                  {' - '}
                  {new Date(sprint.endDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {longTermGoals.map((goal) => (
            <tr key={goal.id} className="hover:bg-muted/30">
              <td className="border border-border px-4 py-3 align-top">
                <div className="font-medium text-foreground">{goal.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{goal.priority.replace('_', ' ')}</div>
              </td>
              {sprints.map((sprint) => {
                const cellGoals = getSprintGoalsForCell(goal, sprint);
                return (
                  <td key={sprint.id} className="border border-border px-3 py-3 align-top">
                    {cellGoals.length === 0 ? (
                      <span className="text-muted-foreground/60 text-xs">-</span>
                    ) : (
                      <div className="space-y-1">
                        {cellGoals.map((sg) => (
                          <div
                            key={sg.id}
                            className={cn(
                              'text-xs px-2 py-1 rounded-[var(--radius-sm)]',
                              sg.status === 'ACHIEVED' && 'bg-emerald-500/10 text-emerald-400',
                              sg.status === 'IN_PROGRESS' && 'bg-blue-500/10 text-blue-400',
                              sg.status === 'NOT_STARTED' && 'bg-muted text-muted-foreground',
                              sg.status === 'NOT_ACHIEVED' && 'bg-red-500/10 text-red-400'
                            )}
                          >
                            {sg.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
