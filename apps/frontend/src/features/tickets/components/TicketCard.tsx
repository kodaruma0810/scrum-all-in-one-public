import { Ticket, TicketType, TicketPriority } from '../types';
import { useTeamSettings } from '@/features/users/hooks/useUsers';
import { cn } from '@/lib/utils';

interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
}

function getTypeStyle(type: TicketType): string {
  switch (type) {
    case 'USER_STORY':
      return 'bg-blue-500/10 text-blue-400';
    case 'TASK':
      return 'bg-muted text-muted-foreground';
    case 'BUG':
      return 'bg-red-500/10 text-red-400';
    case 'SUBTASK':
      return 'bg-amber-500/10 text-amber-300';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function getTypeLabel(type: TicketType): string {
  switch (type) {
    case 'USER_STORY': return 'Story';
    case 'TASK': return 'Task';
    case 'BUG': return 'Bug';
    case 'SUBTASK': return 'Subtask';
    default: return type;
  }
}

function PriorityDot({ priority }: { priority: TicketPriority }) {
  switch (priority) {
    case 'HIGHEST': return <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />;
    case 'HIGH':    return <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />;
    case 'MEDIUM':  return <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />;
    case 'LOW':     return <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />;
    case 'LOWEST':  return <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground/30 shrink-0" />;
    default: return null;
  }
}

export default function TicketCard({ ticket, onClick }: TicketCardProps) {
  const { data: teamSettings } = useTeamSettings();
  const prefix = teamSettings?.ticketPrefix || 'SCR';
  const initials = ticket.assignee?.name
    ? ticket.assignee.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : null;

  return (
    <div
      className={cn(
        'bg-popover rounded-[var(--radius-md)] border border-border p-3 transition-colors',
        onClick && 'cursor-pointer hover:border-border/80 hover:bg-secondary'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs text-muted-foreground/60 font-mono shrink-0">
          {prefix}-{String(ticket.ticketNumber).padStart(3, '0')}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <PriorityDot priority={ticket.priority} />
          <span className={cn('text-xs px-1.5 py-0.5 rounded-[var(--radius-sm)] font-medium', getTypeStyle(ticket.type))}>
            {getTypeLabel(ticket.type)}
          </span>
        </div>
      </div>

      <p className="text-sm font-medium text-foreground/90 truncate mb-2">{ticket.title}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {ticket.storyPoints !== undefined && ticket.storyPoints !== null && (
            <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-[var(--radius-sm)] font-mono">
              {ticket.storyPoints} SP
            </span>
          )}
        </div>
        {initials && (
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-accent text-muted-foreground text-xs font-semibold shrink-0">
            {initials}
          </div>
        )}
      </div>
    </div>
  );
}
