import { useState } from 'react';
import { ChevronDown, Pencil, Trash2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LongTermGoal, SprintGoal, GoalPriority, GoalStatus, CommitmentType, SprintGoalStatus } from '@/features/goals/types';
import { useTerms } from '@/hooks/useTerms';

interface SprintSlot {
  id: string;
  name: string;
}

interface PIGoalAccordionProps {
  goal: LongTermGoal;
  sprintGoals: SprintGoal[];
  sprints: SprintSlot[];
  onEditGoal: (goal: LongTermGoal) => void;
  onDeleteGoal: (goal: LongTermGoal) => void;
  onCreateITGoal: (sprintId: string, longTermGoalId: string, title: string) => void;
  onUpdateITGoal: (sprintId: string, goalId: string, data: Partial<SprintGoal>) => void;
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

function itGoalStatusLabel(status: SprintGoalStatus) {
  switch (status) {
    case 'NOT_STARTED': return '未着手';
    case 'IN_PROGRESS': return '進行中';
    case 'ACHIEVED': return '達成';
    case 'NOT_ACHIEVED': return '未達成';
  }
}

function itGoalStatusClass(status: SprintGoalStatus) {
  switch (status) {
    case 'ACHIEVED': return 'bg-emerald-500/10 text-emerald-400';
    case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-400';
    case 'NOT_STARTED': return 'bg-muted text-muted-foreground';
    case 'NOT_ACHIEVED': return 'bg-red-500/10 text-red-400';
  }
}

function SprintGoalSlot({
  sprint,
  index,
  existingGoal,
  onCreateITGoal,
  onUpdateITGoal,
  longTermGoalId,
}: {
  sprint: SprintSlot;
  index: number;
  existingGoal: SprintGoal | undefined;
  onCreateITGoal: (sprintId: string, longTermGoalId: string, title: string) => void;
  onUpdateITGoal: (sprintId: string, goalId: string, data: Partial<SprintGoal>) => void;
  longTermGoalId: string;
}) {
  const t = useTerms();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const label = `IT${String(index + 1).padStart(2, '0')}`;

  const handleStartEdit = () => {
    setTitle(existingGoal?.title ?? '');
    setEditing(true);
  };

  const handleSave = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setEditing(false);
      return;
    }

    if (existingGoal) {
      if (trimmed !== existingGoal.title) {
        onUpdateITGoal(sprint.id, existingGoal.id, { title: trimmed });
      }
    } else {
      onCreateITGoal(sprint.id, longTermGoalId, trimmed);
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="flex items-center gap-3 bg-card border border-border/60 rounded-[var(--radius-sm)] px-3 py-2">
      {/* IT番号ラベル */}
      <span className="text-xs font-mono font-semibold text-primary/70 shrink-0 w-10">
        {label}
      </span>

      {editing ? (
        /* 編集モード */
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            placeholder={`${t('sprintGoal')}を入力...`}
            className="flex-1 bg-muted/40 border border-border rounded-[var(--radius-sm)] px-2 py-1 text-sm text-foreground/90 placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30"
          />
          <button
            onClick={handleSave}
            className="p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
            title="保存"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
            title="キャンセル"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : existingGoal ? (
        /* 既存ゴール表示 */
        <div className="flex items-center justify-between flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm text-foreground truncate">{existingGoal.title}</span>
            <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0', itGoalStatusClass(existingGoal.status))}>
              {itGoalStatusLabel(existingGoal.status)}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground/60">
            <span className="tabular-nums">チケット {existingGoal._count?.tickets ?? 0}</span>
            <button
              onClick={handleStartEdit}
              className="p-0.5 text-muted-foreground hover:text-blue-400 cursor-pointer"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* 空スロット */
        <button
          onClick={handleStartEdit}
          className="flex-1 text-left text-sm text-muted-foreground/40 italic hover:text-muted-foreground/60 cursor-pointer py-0.5"
        >
          クリックして{t('sprintGoal')}を入力...
        </button>
      )}
    </div>
  );
}

export default function PIGoalAccordion({
  goal,
  sprintGoals,
  sprints,
  onEditGoal,
  onDeleteGoal,
  onCreateITGoal,
  onUpdateITGoal,
}: PIGoalAccordionProps) {
  const t = useTerms();
  const [expanded, setExpanded] = useState(false);

  const linkedITGoals = sprintGoals.filter((sg) => sg.longTermGoalId === goal.id);
  const filledCount = sprints.filter((s) =>
    linkedITGoals.some((sg) => sg.sprintId === s.id)
  ).length;

  return (
    <div className="bg-card border border-border rounded-[var(--radius-md)] transition-colors hover:bg-popover">
      {/* PIゴールヘッダー */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{goal.title}</h3>
            {goal.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{goal.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEditGoal(goal)}
              className="p-1 text-muted-foreground hover:text-blue-400 rounded cursor-pointer"
              title="編集"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDeleteGoal(goal)}
              className="p-1 text-muted-foreground hover:text-red-400 rounded cursor-pointer"
              title="削除"
            >
              <Trash2 className="h-4 w-4" />
            </button>
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
          {goal.assignee && <span>担当: {goal.assignee.name}</span>}
          <span>{t('sprintGoal')}: <span className="tabular-nums">{filledCount}</span> / <span className="tabular-nums">{sprints.length}</span></span>
        </div>
      </div>

      {/* 展開トグル */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 py-2 border-t border-border/60 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-180')} />
        {expanded ? `${t('sprintGoal')}を閉じる` : `${t('sprintGoal')}を表示 (${filledCount}/${sprints.length})`}
      </button>

      {/* ITゴールスロット一覧 */}
      {expanded && (
        <div className="border-t border-border/60 p-4 space-y-2 bg-muted/20">
          {sprints.length === 0 ? (
            <p className="text-xs text-muted-foreground/60 text-center py-2">{t('sprint')}がありません</p>
          ) : (
            sprints.map((sprint, index) => {
              const existingGoal = linkedITGoals.find((sg) => sg.sprintId === sprint.id);
              return (
                <SprintGoalSlot
                  key={sprint.id}
                  sprint={sprint}
                  index={index}
                  existingGoal={existingGoal}
                  onCreateITGoal={onCreateITGoal}
                  onUpdateITGoal={onUpdateITGoal}
                  longTermGoalId={goal.id}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
