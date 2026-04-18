import { DsuSprint } from '../types';

interface DsuSprintSummaryProps {
  sprint: DsuSprint;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

export default function DsuSprintSummary({ sprint }: DsuSprintSummaryProps) {
  const start = new Date(sprint.startDate);
  const end = new Date(sprint.endDate);
  const today = new Date();

  const totalMs = end.getTime() - start.getTime();
  const elapsedMs = Math.min(today.getTime() - start.getTime(), totalMs);
  const progressPct = totalMs > 0 ? Math.max(0, Math.round((elapsedMs / totalMs) * 100)) : 0;

  const totalDays = Math.ceil(totalMs / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.max(0, Math.min(Math.ceil(elapsedMs / (1000 * 60 * 60 * 24)), totalDays));

  const tickets = sprint.tickets ?? [];
  const totalSp = tickets.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
  const doneSp = tickets.filter((t) => t.status === 'DONE').reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);

  return (
    <div className="bg-card rounded-[var(--radius-lg)] border border-border px-6 py-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-foreground">{sprint.name}</h2>
        <span className="text-xs text-muted-foreground/70 tabular-nums">
          {formatDate(sprint.startDate)} 〜 {formatDate(sprint.endDate)}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-muted-foreground/70 mb-1.5">
          <span>期間進捗</span>
          <span className="tabular-nums">{elapsedDays} / {totalDays} 日</span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="flex gap-5 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground/70">総SP</span>
          <span className="font-semibold text-foreground tabular-nums">{totalSp}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground/70">完了SP</span>
          <span className="font-semibold text-emerald-400 tabular-nums">{doneSp}</span>
        </div>
        {totalSp > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground/70">達成率</span>
            <span className="font-semibold text-foreground tabular-nums">{Math.round((doneSp / totalSp) * 100)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
