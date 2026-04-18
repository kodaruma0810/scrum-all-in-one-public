import { TeamCalendarEntry, JapaneseHoliday } from '../types';
import { cn } from '@/lib/utils';

interface TeamCalendarProps {
  entries: TeamCalendarEntry[];
  holidays: JapaneseHoliday[];
  year: number;
  month: number; // 1-12
  onMonthChange: (year: number, month: number) => void;
}

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function TeamCalendar({
  entries,
  holidays,
  year,
  month,
  onMonthChange,
}: TeamCalendarProps) {
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();

  const holidaySet = new Set(holidays.map((h) => h.date));
  const holidayMap = new Map(holidays.map((h) => [h.date, h.name]));

  // Group entries by date
  const entriesByDate = new Map<string, TeamCalendarEntry[]>();
  for (const entry of entries) {
    const dateKey = entry.date.slice(0, 10);
    if (!entriesByDate.has(dateKey)) entriesByDate.set(dateKey, []);
    entriesByDate.get(dateKey)!.push(entry);
  }

  function handlePrev() {
    if (month === 1) onMonthChange(year - 1, 12);
    else onMonthChange(year, month - 1);
  }

  function handleNext() {
    if (month === 12) onMonthChange(year + 1, 1);
    else onMonthChange(year, month + 1);
  }

  // Build grid cells
  const cells: Array<{ day: number | null; dateStr: string | null }> = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: null, dateStr: null });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, dateStr: toDateStr(year, month, d) });
  }

  return (
    <div className="bg-card border border-border rounded-[var(--radius-md)] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrev}
          className="p-1 rounded-[var(--radius-sm)] hover:bg-muted text-muted-foreground hover:text-muted-foreground text-sm cursor-pointer"
        >
          ◀
        </button>
        <span className="font-semibold text-foreground tabular-nums">
          {year}年 {month}月
        </span>
        <button
          onClick={handleNext}
          className="p-1 rounded-[var(--radius-sm)] hover:bg-muted text-muted-foreground hover:text-muted-foreground text-sm cursor-pointer"
        >
          ▶
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-px mb-1">
        {DAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={cn(
              'text-xs font-medium text-center py-1',
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-muted-foreground'
            )}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-muted">
        {cells.map((cell, idx) => {
          if (!cell.day || !cell.dateStr) {
            return <div key={`empty-${idx}`} className="bg-background h-16" />;
          }
          const dow = (firstDay + cell.day - 1) % 7;
          const isHoliday = holidaySet.has(cell.dateStr);
          const holidayName = holidayMap.get(cell.dateStr);
          const dayEntries = entriesByDate.get(cell.dateStr) ?? [];
          const isWeekend = dow === 0 || dow === 6;

          return (
            <div
              key={cell.dateStr}
              className={cn(
                'bg-card min-h-[64px] p-1 text-xs',
                isHoliday && 'bg-red-500/5',
                isWeekend && !isHoliday && 'bg-muted/20'
              )}
            >
              <div
                className={cn(
                  'font-medium mb-0.5 tabular-nums',
                  dow === 0 || isHoliday ? 'text-red-400' : dow === 6 ? 'text-blue-400' : 'text-foreground/90'
                )}
              >
                {cell.day}
              </div>
              {isHoliday && holidayName && (
                <div className="text-red-400/60 text-[10px] truncate" title={holidayName}>
                  {holidayName}
                </div>
              )}
              {dayEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-orange-500/10 text-orange-400 rounded px-1 py-0.5 text-[10px] truncate mb-0.5"
                  title={entry.user?.name}
                >
                  {entry.user?.name ?? '不在'}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500/5 border border-red-400/20 rounded" />
          <span>祝日</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-orange-500/10 rounded" />
          <span>不在/休暇</span>
        </div>
      </div>
    </div>
  );
}
