import { Sprint, SprintStatus } from '../types';

interface SprintTimelineProps {
  sprints: Sprint[];
}

function statusColor(status: SprintStatus): string {
  switch (status) {
    case 'PLANNED':
      return 'bg-muted';
    case 'ACTIVE':
      return 'bg-blue-500/10';
    case 'COMPLETED':
      return 'bg-emerald-500/10';
    case 'ARCHIVED':
      return 'bg-muted/60';
    default:
      return 'bg-muted';
  }
}

function statusBarColor(status: SprintStatus): string {
  switch (status) {
    case 'PLANNED':
      return 'bg-muted-foreground/40';
    case 'ACTIVE':
      return 'bg-blue-400';
    case 'COMPLETED':
      return 'bg-emerald-400';
    case 'ARCHIVED':
      return 'bg-muted-foreground/30';
    default:
      return 'bg-muted-foreground/40';
  }
}

function statusLabel(status: SprintStatus): string {
  switch (status) {
    case 'PLANNED':
      return '計画中';
    case 'ACTIVE':
      return 'アクティブ';
    case 'COMPLETED':
      return '完了';
    case 'ARCHIVED':
      return 'アーカイブ';
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function SprintTimeline({ sprints }: SprintTimelineProps) {
  if (sprints.length === 0) {
    return (
      <div className="bg-card border border-border rounded-[var(--radius-md)] p-4 text-center text-muted-foreground text-sm">
        スプリントがありません
      </div>
    );
  }

  // Determine overall range
  const allDates = sprints.flatMap((s) => [new Date(s.startDate), new Date(s.endDate)]);
  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
  const totalMs = maxDate.getTime() - minDate.getTime() || 1;

  return (
    <div className="bg-card border border-border rounded-[var(--radius-md)] p-4 overflow-x-auto">
      <h3 className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-3">タイムライン</h3>
      <div className="min-w-[600px]">
        {sprints.map((sprint) => {
          const start = new Date(sprint.startDate);
          const end = new Date(sprint.endDate);
          const leftPct = ((start.getTime() - minDate.getTime()) / totalMs) * 100;
          const widthPct = ((end.getTime() - start.getTime()) / totalMs) * 100;

          return (
            <div key={sprint.id} className="flex items-center gap-2 mb-2">
              <div className="w-24 text-xs text-muted-foreground text-right truncate shrink-0">
                {sprint.name}
              </div>
              <div className="flex-1 relative h-7 bg-muted rounded-[var(--radius-sm)]">
                <div
                  className={`absolute top-0.5 bottom-0.5 rounded-[var(--radius-sm)] ${statusBarColor(sprint.status)} flex items-center px-2 min-w-[4px]`}
                  style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 2)}%` }}
                  title={`${sprint.name} (${statusLabel(sprint.status)})`}
                >
                  <span className="text-foreground text-xs truncate hidden sm:block">
                    {sprint.name}
                  </span>
                </div>
              </div>
              <div className="w-20 text-xs text-muted-foreground shrink-0 tabular-nums">
                {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
              </div>
            </div>
          );
        })}

        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
          {(['PLANNED', 'ACTIVE', 'COMPLETED', 'ARCHIVED'] as SprintStatus[]).map((s) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${statusBarColor(s)}`} />
              <span>{statusLabel(s)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
