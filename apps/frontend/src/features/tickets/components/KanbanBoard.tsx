import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  rectIntersection,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Ticket, TicketStatus } from '../types';
import { useChangeTicketStatus } from '../hooks/useTickets';
import TicketCard from './TicketCard';
import { cn } from '@/lib/utils';

interface KanbanColumnConfig {
  status: TicketStatus;
  label: string;
  dotClass: string;
}

const COLUMNS: KanbanColumnConfig[] = [
  { status: 'TODO',        label: 'To Do',       dotClass: 'bg-blue-400' },
  { status: 'IN_PROGRESS', label: '進行中',      dotClass: 'bg-amber-400' },
  { status: 'IN_REVIEW',   label: 'レビュー',    dotClass: 'bg-violet-400' },
  { status: 'DONE',        label: '完了',        dotClass: 'bg-emerald-400' },
];

function SortableTicketCard({ ticket, onTicketClick }: { ticket: Ticket; onTicketClick?: (ticket: Ticket) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ticket.id,
    data: { type: 'ticket', status: ticket.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TicketCard ticket={ticket} onClick={onTicketClick ? () => onTicketClick(ticket) : undefined} />
    </div>
  );
}

function DroppableColumn({ status, isOver, children }: { status: string; isOver: boolean; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id: status, data: { type: 'column', status } });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col gap-2 p-2 flex-1 min-h-[200px] rounded-b-[var(--radius-lg)] transition-colors',
        isOver && 'bg-primary/10'
      )}
    >
      {children}
    </div>
  );
}

interface KanbanBoardProps {
  tickets: Ticket[];
  onTicketClick?: (ticket: Ticket) => void;
}

export default function KanbanBoard({ tickets, onTicketClick }: KanbanBoardProps) {
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const changeStatus = useChangeTicketStatus();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const getTicketsForStatus = (status: TicketStatus) =>
    tickets.filter((t) =>
      status === 'TODO' ? (t.status === 'TODO' || t.status === 'BACKLOG') : t.status === status
    );

  // Resolve which column an overId belongs to
  function resolveColumn(overId: string): TicketStatus | null {
    const col = COLUMNS.find((c) => c.status === overId);
    if (col) return col.status;
    // It's a ticket — find its column
    const ticket = tickets.find((t) => t.id === overId);
    if (!ticket) return null;
    // BACKLOG tickets are shown in TODO column
    return ticket.status === 'BACKLOG' ? 'TODO' : ticket.status;
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTicket(tickets.find((t) => t.id === event.active.id) ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) { setOverColumnId(null); return; }
    setOverColumnId(resolveColumn(over.id as string));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTicket(null);
    setOverColumnId(null);

    if (!over) return;

    const ticketId = active.id as string;
    const targetStatus = resolveColumn(over.id as string);
    if (!targetStatus) return;

    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const currentStatus = ticket.status === 'BACKLOG' ? 'TODO' : ticket.status;
    if (currentStatus !== targetStatus) {
      changeStatus.mutate({ id: ticketId, status: targetStatus });
    }
  };

  const handleDragCancel = () => {
    setActiveTicket(null);
    setOverColumnId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-3 min-h-[400px] overflow-x-auto pb-2">
        {COLUMNS.map((col) => {
          const columnTickets = getTicketsForStatus(col.status);
          const isOver = overColumnId === col.status;
          return (
            <div
              key={col.status}
              className={cn(
                'flex flex-col rounded-[var(--radius-lg)] bg-card border-2 min-w-[200px] sm:min-w-[220px] flex-1 transition-colors',
                isOver ? 'border-primary/50 shadow-[0_0_0_1px_hsl(var(--primary)/0.2)]' : 'border-border'
              )}
            >
              <div className={cn(
                'flex items-center justify-between px-3 py-2.5 border-b transition-colors',
                isOver ? 'border-primary/30 bg-primary/5' : 'border-border/60'
              )}>
                <div className="flex items-center gap-2">
                  <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', col.dotClass)} />
                  <span className="text-xs font-medium text-muted-foreground">{col.label}</span>
                </div>
                <span className="text-xs text-muted-foreground/60 tabular-nums">{columnTickets.length}</span>
              </div>
              <SortableContext
                id={col.status}
                items={columnTickets.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <DroppableColumn status={col.status} isOver={isOver}>
                  {columnTickets.map((ticket) => (
                    <SortableTicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onTicketClick={onTicketClick}
                    />
                  ))}
                </DroppableColumn>
              </SortableContext>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeTicket && (
          <div className="rotate-1 opacity-80 w-[250px]">
            <TicketCard ticket={activeTicket} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
