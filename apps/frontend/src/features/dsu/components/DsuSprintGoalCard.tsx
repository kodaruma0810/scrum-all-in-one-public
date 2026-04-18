import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { DsuSprintGoal } from '../types';

interface DsuSprintGoalCardProps {
  goal: DsuSprintGoal;
  readonly?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  BACKLOG:     'bg-muted text-muted-foreground',
  TODO:        'bg-blue-500/10 text-blue-400',
  IN_PROGRESS: 'bg-amber-500/10 text-amber-300',
  IN_REVIEW:   'bg-violet-500/10 text-violet-400',
  DONE:        'bg-emerald-500/10 text-emerald-400',
};

const STATUS_LABELS: Record<string, string> = {
  BACKLOG: 'Backlog', TODO: 'To Do', IN_PROGRESS: '進行中', IN_REVIEW: 'レビュー', DONE: '完了',
};

const GOAL_STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: 'bg-muted text-muted-foreground',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-400',
  COMPLETED:   'bg-emerald-500/10 text-emerald-400',
  CANCELLED:   'bg-red-500/10 text-red-400',
};

const GOAL_STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: '未着手', IN_PROGRESS: '進行中', COMPLETED: '完了', CANCELLED: 'キャンセル',
};

const TICKET_STATUSES = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as const;

export default function DsuSprintGoalCard({ goal, readonly = false }: DsuSprintGoalCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: goal.id,
    disabled: readonly,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const tickets = goal.tickets ?? [];
  const totalTickets = tickets.length;

  const countByStatus = TICKET_STATUSES.reduce((acc, s) => {
    acc[s] = tickets.filter((t) => t.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const doneCount = countByStatus['DONE'] ?? 0;
  const progressPct = totalTickets > 0 ? Math.round((doneCount / totalTickets) * 100) : 0;

  return (
    <div ref={setNodeRef} style={style} className="bg-card rounded-[var(--radius-md)] border border-border p-3">
      <div className="flex items-start gap-2">
        {!readonly && (
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 text-muted-foreground/30 hover:text-muted-foreground cursor-grab active:cursor-grabbing shrink-0"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-sm font-medium text-foreground/90">{goal.title}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-[var(--radius-sm)] shrink-0 ${GOAL_STATUS_COLORS[goal.status] ?? 'bg-muted text-muted-foreground'}`}>
              {GOAL_STATUS_LABELS[goal.status] ?? goal.status}
            </span>
          </div>

          {goal.longTermGoal && (
            <p className="text-xs text-muted-foreground/60 mb-2 truncate">{goal.longTermGoal.title}</p>
          )}

          {totalTickets > 0 && (
            <>
              <div className="flex flex-wrap gap-1 mb-2">
                {TICKET_STATUSES.filter((s) => countByStatus[s] > 0).map((s) => (
                  <span key={s} className={`text-xs px-1.5 py-0.5 rounded-[var(--radius-sm)] ${STATUS_COLORS[s]}`}>
                    {STATUS_LABELS[s]} {countByStatus[s]}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-1">
                  <div className="bg-primary/60 h-1 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                </div>
                <span className="text-xs text-muted-foreground/70 shrink-0 tabular-nums">{doneCount}/{totalTickets}</span>
              </div>
            </>
          )}

          {totalTickets === 0 && (
            <p className="text-xs text-muted-foreground/60">チケットなし</p>
          )}
        </div>
      </div>
    </div>
  );
}
