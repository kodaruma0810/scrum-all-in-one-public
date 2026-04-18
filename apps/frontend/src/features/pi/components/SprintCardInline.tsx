import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sprint, SprintStatus } from '@/features/sprints/types';
import { useStartSprint, useCompleteSprint, useReopenSprint } from '@/features/sprints/hooks/useSprints';
import { useTerms } from '@/hooks/useTerms';

interface SprintCardInlineProps {
  sprint: Sprint;
  piId: string;
}

function statusLabel(status: SprintStatus): string {
  switch (status) {
    case 'PLANNED':   return '計画中';
    case 'ACTIVE':    return 'アクティブ';
    case 'COMPLETED': return '完了';
    case 'ARCHIVED':  return 'アーカイブ';
  }
}

function statusClass(status: SprintStatus): string {
  switch (status) {
    case 'PLANNED':   return 'bg-muted text-muted-foreground';
    case 'ACTIVE':    return 'bg-blue-500/10 text-blue-400';
    case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400';
    case 'ARCHIVED':  return 'bg-muted/60 text-muted-foreground/60';
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export default function SprintCardInline({ sprint, piId }: SprintCardInlineProps) {
  const t = useTerms();
  const startSprint = useStartSprint();
  const completeSprint = useCompleteSprint();
  const reopenSprint = useReopenSprint();

  const handleStart = () => {
    if (!window.confirm(`「${sprint.name}」を開始しますか？`)) return;
    startSprint.mutate(sprint.id);
  };

  return (
    <div className="bg-card border border-border rounded-[var(--radius-lg)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-foreground text-sm truncate">{sprint.name}</h3>
            <span className={cn('text-xs px-2 py-0.5 rounded-[var(--radius-sm)] font-medium shrink-0', statusClass(sprint.status))}>
              {statusLabel(sprint.status)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground/70 tabular-nums">
            {formatDate(sprint.startDate)} 〜 {formatDate(sprint.endDate)}
          </div>
          {sprint.goal && (
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{sprint.goal}</p>
          )}
          <div className="flex gap-4 text-xs text-muted-foreground/60 mt-2 tabular-nums">
            <span>チケット: {sprint._count?.tickets ?? 0}</span>
            <span>{t('sprintGoal')}: {sprint._count?.sprintGoals ?? 0}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex gap-2">
            {sprint.status === 'PLANNED' && (
              <button
                onClick={handleStart}
                disabled={startSprint.isPending}
                className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-[var(--radius-sm)] hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
              >
                開始
              </button>
            )}
            {sprint.status === 'ACTIVE' && (
              <button
                onClick={() => completeSprint.mutate(sprint.id)}
                disabled={completeSprint.isPending}
                className="px-3 py-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-[var(--radius-sm)] hover:bg-emerald-500/20 disabled:opacity-50 cursor-pointer"
              >
                終了
              </button>
            )}
            {sprint.status === 'COMPLETED' && (
              <button
                onClick={() => reopenSprint.mutate(sprint.id)}
                disabled={reopenSprint.isPending}
                className="px-3 py-1.5 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-[var(--radius-sm)] hover:bg-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                再開
              </button>
            )}
          </div>
          <Link
            to={`/pi/${piId}/planning/${sprint.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-[var(--radius-sm)] hover:bg-blue-500/20 transition-colors"
          >
            プランニングへ →
          </Link>
        </div>
      </div>
    </div>
  );
}
