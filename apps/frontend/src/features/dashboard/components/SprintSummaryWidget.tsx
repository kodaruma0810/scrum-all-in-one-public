import { ActiveSprintSummary } from '../types';
import { useTerms } from '@/hooks/useTerms';

interface Props {
  sprint: ActiveSprintSummary | null;
}

export default function SprintSummaryWidget({ sprint }: Props) {
  const t = useTerms();
  if (!sprint) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border bg-card px-8 py-7">
        <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-2">
          Active Sprint
        </p>
        <p className="text-muted-foreground text-sm">{`現在アクティブな${t('sprint')}はありません`}</p>
      </div>
    );
  }

  const progressWidth = Math.min(sprint.progressRate, 100);

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-card px-8 py-7">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-1.5">
            Active Sprint
          </p>
          <h2 className="text-xl font-semibold text-foreground">{sprint.name}</h2>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-3xl font-bold text-foreground">{sprint.progressRate}%</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">進捗率</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-1.5 mb-6">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${progressWidth}%` }}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-6">
        <div>
          <p className="text-2xl font-bold text-foreground">{sprint.doneTickets}
            <span className="text-muted-foreground/70 font-normal text-base"> / {sprint.totalTickets}</span>
          </p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">チケット完了</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{sprint.remainingDays}</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">残り日数</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{sprint.doneStoryPoints}</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">完了SP</p>
        </div>
      </div>
    </div>
  );
}
