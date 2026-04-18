import { cn } from '@/lib/utils';
import { SprintGoal, SprintGoalStatus } from '../types';
import { useTerms } from '@/hooks/useTerms';

interface SprintGoalCardProps {
  goal: SprintGoal;
}

function statusLabel(status: SprintGoalStatus) {
  switch (status) {
    case 'NOT_STARTED': return '未着手';
    case 'IN_PROGRESS': return '進行中';
    case 'ACHIEVED': return '達成';
    case 'NOT_ACHIEVED': return '未達成';
  }
}

function statusClass(status: SprintGoalStatus) {
  switch (status) {
    case 'NOT_STARTED': return 'bg-muted text-muted-foreground';
    case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-400';
    case 'ACHIEVED': return 'bg-emerald-500/10 text-emerald-400';
    case 'NOT_ACHIEVED': return 'bg-red-500/10 text-red-400';
  }
}

export default function SprintGoalCard({ goal }: SprintGoalCardProps) {
  const t = useTerms();
  const ticketCount = goal._count?.tickets ?? goal.tickets?.length ?? 0;

  return (
    <div className="bg-card border border-border rounded-[var(--radius-sm)] p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground flex-1">{goal.title}</p>
        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium shrink-0', statusClass(goal.status))}>
          {statusLabel(goal.status)}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
        {goal.longTermGoal && (
          <span className="truncate max-w-[160px]" title={goal.longTermGoal.title}>
            {t('longTermGoal')}: {goal.longTermGoal.title}
          </span>
        )}
        <span>チケット: <span className="tabular-nums">{ticketCount}</span>件</span>
      </div>
    </div>
  );
}
