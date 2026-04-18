import { Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LongTermGoal, GoalPriority, GoalStatus, CommitmentType } from '../types';
import { useTerms } from '@/hooks/useTerms';

interface LongTermGoalCardProps {
  goal: LongTermGoal;
  onEdit?: (goal: LongTermGoal) => void;
  onDelete?: (goal: LongTermGoal) => void;
}

function priorityLabel(priority: GoalPriority) {
  switch (priority) {
    case 'MUST_HAVE': return 'Must Have';
    case 'SHOULD_HAVE': return 'Should Have';
    case 'NICE_TO_HAVE': return 'Nice to Have';
  }
}

function priorityClass(priority: GoalPriority) {
  switch (priority) {
    case 'MUST_HAVE': return 'bg-red-500/10 text-red-400';
    case 'SHOULD_HAVE': return 'bg-amber-500/10 text-amber-300';
    case 'NICE_TO_HAVE': return 'bg-muted text-muted-foreground';
  }
}

function statusLabel(status: GoalStatus) {
  switch (status) {
    case 'NOT_STARTED': return '未着手';
    case 'IN_PROGRESS': return '進行中';
    case 'ACHIEVED': return '達成';
    case 'NOT_ACHIEVED': return '未達成';
    case 'PARTIALLY_ACHIEVED': return '部分達成';
  }
}

function statusClass(status: GoalStatus) {
  switch (status) {
    case 'ACHIEVED': return 'bg-emerald-500/10 text-emerald-400';
    case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-400';
    case 'NOT_STARTED': return 'bg-muted text-muted-foreground';
    case 'NOT_ACHIEVED': return 'bg-red-500/10 text-red-400';
    case 'PARTIALLY_ACHIEVED': return 'bg-amber-500/10 text-amber-300';
  }
}

function commitmentClass(commitment: CommitmentType) {
  if (commitment === 'COMMITTED') {
    return 'border border-blue-400/30 text-blue-400';
  }
  return 'border border-dashed border-border text-muted-foreground';
}

export default function LongTermGoalCard({ goal, onEdit, onDelete }: LongTermGoalCardProps) {
  const t = useTerms();
  const sprintGoalCount = goal.sprintGoals?.length ?? 0;

  return (
    <div className="bg-card border border-border rounded-[var(--radius-md)] p-4 transition-colors hover:bg-popover">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{goal.title}</h3>
          {goal.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{goal.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <button
              onClick={() => onEdit(goal)}
              className="p-1 text-muted-foreground hover:text-blue-400 rounded cursor-pointer"
              title="編集"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(goal)}
              className="p-1 text-muted-foreground hover:text-red-400 rounded cursor-pointer"
              title="削除"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', priorityClass(goal.priority))}>
          {priorityLabel(goal.priority)}
        </span>
        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', statusClass(goal.status))}>
          {statusLabel(goal.status)}
        </span>
        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', commitmentClass(goal.commitment))}>
          {goal.commitment === 'COMMITTED' ? 'コミット' : '非コミット'}
        </span>
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        {goal.assignee && (
          <span>担当: {goal.assignee.name}</span>
        )}
        <span>{t('sprintGoal')}: <span className="tabular-nums">{sprintGoalCount}</span>件</span>
      </div>
    </div>
  );
}
