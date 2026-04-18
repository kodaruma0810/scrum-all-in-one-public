import { LongTermGoalProgress } from '../types';
import { useTerms } from '@/hooks/useTerms';

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  NOT_STARTED: { label: '未着手', className: 'bg-muted text-muted-foreground' },
  IN_PROGRESS: { label: '進行中', className: 'bg-blue-500/10 text-blue-400' },
  ACHIEVED: { label: '達成', className: 'bg-emerald-500/10 text-emerald-400' },
  NOT_ACHIEVED: { label: '未達成', className: 'bg-red-500/10 text-red-400' },
  PARTIALLY_ACHIEVED: { label: '一部達成', className: 'bg-amber-500/10 text-amber-300' },
};

interface Props {
  goals: LongTermGoalProgress[];
}

export default function GoalProgressWidget({ goals }: Props) {
  const t = useTerms();
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-card px-6 py-6">
      <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-5">
        {t('longTermGoal')}
      </p>
      {goals.length === 0 ? (
        <p className="text-muted-foreground/70 text-sm">ゴールが登録されていません</p>
      ) : (
        <ul className="space-y-4">
          {goals.map((goal) => {
            const s = STATUS_LABELS[goal.status] ?? { label: goal.status, className: 'bg-muted text-muted-foreground' };
            return (
              <li key={goal.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground/90 truncate flex-1 mr-3">
                    {goal.title}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-[var(--radius-sm)] font-medium shrink-0 ${s.className}`}>
                    {s.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-muted rounded-full h-1">
                    <div
                      className="bg-primary/60 h-1 rounded-full transition-all"
                      style={{ width: `${goal.progressRate}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground/70 whitespace-nowrap tabular-nums">
                    {goal.achievedSprintGoals}/{goal.totalSprintGoals}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
