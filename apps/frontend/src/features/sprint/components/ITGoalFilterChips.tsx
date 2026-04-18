import { cn } from '@/lib/utils';
import { useTerms } from '@/hooks/useTerms';

interface ITGoal {
  id: string;
  title: string;
}

interface ITGoalFilterChipsProps {
  goals: ITGoal[];
  selectedGoalId: string | null;
  onSelect: (goalId: string | null) => void;
}

export default function ITGoalFilterChips({ goals, selectedGoalId, onSelect }: ITGoalFilterChipsProps) {
  const t = useTerms();
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground/70 font-medium shrink-0">{t('sprintGoal')}:</span>
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'px-3 py-1 text-xs rounded-full border transition-colors cursor-pointer',
          selectedGoalId === null
            ? 'bg-primary/10 border-primary/30 text-primary font-medium'
            : 'border-border text-muted-foreground hover:text-foreground hover:border-border/80'
        )}
      >
        すべて
      </button>
      {goals.map((goal) => (
        <button
          key={goal.id}
          onClick={() => onSelect(goal.id)}
          className={cn(
            'px-3 py-1 text-xs rounded-full border transition-colors cursor-pointer truncate max-w-[200px]',
            selectedGoalId === goal.id
              ? 'bg-primary/10 border-primary/30 text-primary font-medium'
              : 'border-border text-muted-foreground hover:text-foreground hover:border-border/80'
          )}
          title={goal.title}
        >
          {goal.title}
        </button>
      ))}
    </div>
  );
}
