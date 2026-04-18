import * as Progress from '@radix-ui/react-progress';
import { Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CapacityBarProps {
  totalCapacity: number;
  usedCapacity: number;
  averageVelocity?: number;
  unit?: string;
  onEditCapacity?: () => void;
}

export default function CapacityBar({ totalCapacity, usedCapacity, averageVelocity, unit = '', onEditCapacity }: CapacityBarProps) {
  const pct = totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 0;
  const isOver = usedCapacity > totalCapacity;

  return (
    <div className="bg-card border border-border rounded-[var(--radius-md)] p-4 space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground/90">キャパシティ</span>
          {onEditCapacity && (
            <button
              onClick={onEditCapacity}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="キャパシティ設定"
            >
              <Settings2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <span className={cn('font-semibold tabular-nums', isOver ? 'text-red-400' : 'text-foreground')}>
          {Number.isInteger(usedCapacity) ? usedCapacity : usedCapacity.toFixed(1)} / {Number.isInteger(totalCapacity) ? totalCapacity : totalCapacity.toFixed(1)}{unit && ` ${unit}`}
          {isOver && <span className="ml-1 text-red-400 text-xs">超過!</span>}
        </span>
      </div>

      <Progress.Root
        className="relative overflow-hidden bg-muted rounded-full h-3 w-full"
        value={Math.min(pct, 100)}
      >
        <Progress.Indicator
          className={cn(
            'h-full rounded-full transition-all duration-300',
            isOver ? 'bg-red-400' : pct >= 80 ? 'bg-yellow-400' : 'bg-primary/60'
          )}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </Progress.Root>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="tabular-nums">{pct}% 使用</span>
        {averageVelocity !== undefined && (
          <span className="tabular-nums">推奨: {averageVelocity} SP (過去平均)</span>
        )}
      </div>
    </div>
  );
}
