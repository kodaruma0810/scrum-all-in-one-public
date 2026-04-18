import { DodCheckResult } from '../types';
import { useUpdateDod } from '../hooks/useTickets';
import { cn } from '@/lib/utils';

interface DodChecklistProps {
  ticketId: string;
  checkResults: DodCheckResult[];
}

export default function DodChecklist({ ticketId, checkResults }: DodChecklistProps) {
  const updateDod = useUpdateDod();

  const allChecked = checkResults.length > 0 && checkResults.every((r) => r.checked);

  const handleChange = (dodItemId: string, checked: boolean) => {
    const items = checkResults.map((r) => ({
      dodItemId: r.dodItemId,
      checked: r.dodItemId === dodItemId ? checked : r.checked,
    }));
    updateDod.mutate({ ticketId, items });
  };

  if (checkResults.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        DoDアイテムがありません
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-foreground">Definition of Done</h4>
        {allChecked && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
            完了
          </span>
        )}
      </div>
      {checkResults.map((result) => (
        <label
          key={result.id}
          className={cn(
            'flex items-center gap-3 p-2 rounded-[var(--radius-sm)] cursor-pointer hover:bg-muted transition-colors',
            result.checked && 'opacity-70'
          )}
        >
          <input
            type="checkbox"
            checked={result.checked}
            onChange={(e) => handleChange(result.dodItemId, e.target.checked)}
            className="h-4 w-4 rounded border-border bg-muted/40 cursor-pointer"
            disabled={updateDod.isPending}
          />
          <span
            className={cn(
              'text-sm text-foreground/90',
              result.checked && 'line-through text-muted-foreground'
            )}
          >
            {result.dodItem?.title ?? result.dodItemId}
          </span>
        </label>
      ))}
    </div>
  );
}
