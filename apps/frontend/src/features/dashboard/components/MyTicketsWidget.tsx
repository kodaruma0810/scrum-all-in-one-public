import { MyTicket } from '../types';
import { useTeamSettings } from '@/features/users/hooks/useUsers';

const STATUS_STYLES: Record<string, string> = {
  BACKLOG: 'bg-muted text-muted-foreground',
  TODO: 'bg-blue-500/10 text-blue-400',
  IN_PROGRESS: 'bg-amber-500/10 text-amber-300',
  IN_REVIEW: 'bg-violet-500/10 text-violet-400',
  DONE: 'bg-emerald-500/10 text-emerald-400',
};

const STATUS_LABELS: Record<string, string> = {
  BACKLOG: 'Backlog',
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
};

interface Props {
  tickets: MyTicket[];
}

export default function MyTicketsWidget({ tickets }: Props) {
  const { data: teamSettings } = useTeamSettings();
  const ticketPrefix = teamSettings?.ticketPrefix || 'SCR';
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-card px-6 py-6">
      <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-5">
        担当チケット
      </p>
      {tickets.length === 0 ? (
        <p className="text-muted-foreground/70 text-sm">担当チケットはありません</p>
      ) : (
        <ul className="divide-y divide-border/60">
          {tickets.map((ticket) => (
            <li key={ticket.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground/60 mb-0.5 font-mono">{ticketPrefix}-{String(ticket.ticketNumber).padStart(3, '0')}</p>
                  <p className="text-sm text-foreground/90 truncate leading-snug">{ticket.title}</p>
                  {ticket.sprintGoal && (
                    <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
                      {ticket.sprintGoal.title}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-[var(--radius-sm)] font-medium ${STATUS_STYLES[ticket.status] ?? 'bg-muted text-muted-foreground'}`}>
                    {STATUS_LABELS[ticket.status] ?? ticket.status}
                  </span>
                  {ticket.storyPoints != null && (
                    <span className="text-xs text-muted-foreground/60 tabular-nums">{ticket.storyPoints} SP</span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
