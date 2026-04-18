import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DsuTimerProps {
  defaultMinutes?: number;
  onComplete?: () => void;
}

export default function DsuTimer({ defaultMinutes = 15, onComplete }: DsuTimerProps) {
  const [configMinutes, setConfigMinutes] = useState(defaultMinutes);
  const [timeLeft, setTimeLeft] = useState(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          onCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const totalSeconds = configMinutes * 60;
  const minutesLeft = Math.floor(timeLeft / 60);
  const secondsLeft = timeLeft % 60;
  const display = `${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;

  const colorClass = cn(
    'text-5xl font-mono font-bold tabular-nums transition-colors',
    timeLeft > 5 * 60
      ? 'text-foreground'
      : timeLeft > 2 * 60
      ? 'text-yellow-400'
      : 'text-red-400 animate-pulse'
  );

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(configMinutes * 60);
  };

  const handleConfigChange = (val: number) => {
    const mins = Math.max(1, Math.min(60, val));
    setConfigMinutes(mins);
    setTimeLeft(mins * 60);
  };

  const progressPct = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={colorClass}>{display}</div>

      <div className="w-48 bg-muted rounded-full h-1.5">
        <div
          className="bg-primary/60 h-1.5 rounded-full transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          onClick={() => setIsRunning((v) => !v)}
        >
          {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          onClick={handleReset}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {!isRunning && (
        <div className="flex items-center gap-1 text-muted-foreground text-xs">
          <Input
            type="number"
            min={1}
            max={60}
            value={configMinutes}
            onChange={(e) => handleConfigChange(parseInt(e.target.value, 10) || 1)}
            className="w-14 h-6 text-center text-xs bg-muted/40 border-border text-foreground/90"
          />
          <span>分</span>
        </div>
      )}
    </div>
  );
}
