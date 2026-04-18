import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Play, Square, RotateCcw, Plus, Target, CircleSlash } from 'lucide-react';
import { useSprint, useSprints, useStartSprint, useCompleteSprint, useReopenSprint, useVelocityHistory } from '../hooks/useSprints';
import { useCapacity, useUpsertCapacity } from '../hooks/useCapacity';
import CapacityBar from '../components/CapacityBar';
import CapacityForm from '../components/CapacityForm';
import { useBacklogTickets, useUpdateTicket, useCreateTicket } from '@/features/tickets/hooks/useTickets';
import TicketCard from '@/features/tickets/components/TicketCard';
import TicketForm from '@/features/tickets/components/TicketForm';
import { Ticket } from '@/features/tickets/types';
import { useTeamMembers } from '@/features/teams/hooks/useTeams';
import { useTeamSettings } from '@/features/users/hooks/useUsers';
import { useSprintGoals, useCreateSprintGoal, useLongTermGoals } from '@/features/goals/hooks/useGoals';
import { SprintGoalForm } from '@/features/goals/components/GoalForm';
import { SprintGoal } from '@/features/goals/types';
import { cn } from '@/lib/utils';
import { useTerms } from '@/hooks/useTerms';

// ─── Draggable Ticket Card ───────────────────────────────────────────

function DraggableTicketCard({ ticket, onEdit }: { ticket: Ticket; onEdit?: (ticket: Ticket) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ticket.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TicketCard ticket={ticket} onClick={onEdit ? () => onEdit(ticket) : undefined} />
    </div>
  );
}

// ─── Droppable Container ─────────────────────────────────────────────

function DroppableZone({
  id,
  children,
  className,
  isOver,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  isOver?: boolean;
}) {
  const { setNodeRef, isOver: dropIsOver } = useDroppable({ id });
  const highlight = isOver ?? dropIsOver;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        className,
        highlight && 'ring-2 ring-primary/30 bg-primary/5'
      )}
    >
      {children}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────

const BACKLOG_DROPPABLE = '__backlog__';
const UNLINKED_DROPPABLE = '__unlinked__';

export default function SprintPlanningPage() {
  const t = useTerms();
  const { id: piId = '', sprintId: paramSprintId } = useParams<{ id: string; sprintId: string }>();
  const id = paramSprintId || piId; // support both /pi/:id/planning/:sprintId and legacy /sprints/:id/planning
  const navigate = useNavigate();
  const { data: sprint } = useSprint(id);
  const { data: allSprints = [] } = useSprints();
  const { data: backlogTickets = [] } = useBacklogTickets();
  const { data: capacities = [] } = useCapacity(id);
  const { data: velocityHistory = [] } = useVelocityHistory();
  const { data: sprintGoals = [] } = useSprintGoals(id);
  const { data: longTermGoals = [] } = useLongTermGoals(sprint?.incrementId ?? '');
  const { data: teamMembers = [] } = useTeamMembers(sprint?.teamId ?? null);
  const { data: teamSettings } = useTeamSettings();
  const updateTicket = useUpdateTicket();
  const createTicket = useCreateTicket();
  const createSprintGoal = useCreateSprintGoal();
  const upsertCapacity = useUpsertCapacity();
  const startSprint = useStartSprint();
  const completeSprint = useCompleteSprint();
  const reopenSprint = useReopenSprint();

  // Sprint selector: group by increment, sort by startDate
  const sprintsByIncrement = new Map<string, { name: string; sprints: typeof allSprints }>();
  for (const s of [...allSprints].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())) {
    const incId = s.incrementId;
    const incName = s.increment?.name ?? 'PI';
    if (!sprintsByIncrement.has(incId)) {
      sprintsByIncrement.set(incId, { name: incName, sprints: [] });
    }
    sprintsByIncrement.get(incId)!.sprints.push(s);
  }

  // UI state
  const [showCapacityForm, setShowCapacityForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [ticketFormOpen, setTicketFormOpen] = useState(false);
  const [ticketFormGoalId, setTicketFormGoalId] = useState<string | undefined>(undefined);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [overContainerId, setOverContainerId] = useState<string | null>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const sprintTickets: Ticket[] = (sprint?.tickets ?? []) as Ticket[];

  // Left column: pure backlog only (not assigned to any sprint)
  const sprintTicketIds = new Set(sprintTickets.map((t) => t.id));
  const leftColumnTickets = backlogTickets.filter((t) => !sprintTicketIds.has(t.id));

  // Goal-unassigned sprint tickets (in sprint but no goal, or goal doesn't exist in this sprint)
  const sprintGoalIds = new Set(sprintGoals.map((g) => g.id));
  const unlinkedSprintTickets = sprintTickets.filter(
    (t) => !t.sprintGoalId || !sprintGoalIds.has(t.sprintGoalId),
  );

  // Right column: group tickets by sprint goal (only if goal exists in this sprint)
  const ticketsByGoal = new Map<string, Ticket[]>();
  for (const ticket of sprintTickets) {
    if (ticket.sprintGoalId && sprintGoalIds.has(ticket.sprintGoalId)) {
      const arr = ticketsByGoal.get(ticket.sprintGoalId) ?? [];
      arr.push(ticket);
      ticketsByGoal.set(ticket.sprintGoalId, arr);
    }
  }

  // Capacity (all in SP)
  const spDaysRatio = teamSettings?.spDaysRatio ?? 1;
  const totalCapacityDays = capacities.reduce((sum, c) => sum + c.availableDays, 0);
  const totalCapacity = totalCapacityDays / spDaysRatio;
  const usedCapacity = sprintTickets.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
  const avgVelocity =
    velocityHistory.length > 0
      ? Math.round(
          velocityHistory.reduce((sum, v) => sum + (v.velocity ?? 0), 0) / velocityHistory.length
        )
      : undefined;

  // ─── All ticket lookup (for drag) ────────────────────────────────
  const allTickets = [...sprintTickets, ...leftColumnTickets];
  const ticketMap = new Map(allTickets.map((t) => [t.id, t]));

  // ─── Find which container a ticket belongs to ────────────────────
  function findContainer(ticketId: string): string | null {
    const ticket = ticketMap.get(ticketId as string);
    if (!ticket) return null;
    if (ticket.sprintGoalId && sprintGoalIds.has(ticket.sprintGoalId)) {
      return ticket.sprintGoalId;
    }
    // In sprint but no goal (or goal doesn't exist) → unlinked zone
    if (ticket.sprintId) {
      return UNLINKED_DROPPABLE;
    }
    return BACKLOG_DROPPABLE;
  }

  // ─── Resolve drop target container ───────────────────────────────
  function resolveDropContainer(overId: string): string | null {
    // Dropped directly on a container?
    if (overId === BACKLOG_DROPPABLE) return BACKLOG_DROPPABLE;
    if (overId === UNLINKED_DROPPABLE) return UNLINKED_DROPPABLE;
    if (sprintGoals.some((g) => g.id === overId)) return overId;
    // Dropped on a ticket → find its container
    return findContainer(overId);
  }

  // ─── DnD Handlers ───────────────────────────────────────────────
  function handleDragStart(event: DragStartEvent) {
    const ticket = ticketMap.get(event.active.id as string);
    setActiveTicket(ticket ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    if (!over) {
      setOverContainerId(null);
      return;
    }
    setOverContainerId(resolveDropContainer(over.id as string));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTicket(null);
    setOverContainerId(null);

    if (!over) return;

    const ticketId = active.id as string;
    const ticket = ticketMap.get(ticketId);
    if (!ticket) return;

    const targetContainer = resolveDropContainer(over.id as string);
    if (!targetContainer) return;

    const sourceContainer = findContainer(ticketId);
    if (sourceContainer === targetContainer) return;

    if (targetContainer === BACKLOG_DROPPABLE) {
      // Move to backlog (remove from sprint & goal)
      updateTicket.mutate({
        id: ticketId,
        data: { sprintId: null, sprintGoalId: null } as unknown as Partial<Ticket>,
      });
    } else if (targetContainer === UNLINKED_DROPPABLE) {
      // Move to sprint but without a goal
      updateTicket.mutate({
        id: ticketId,
        data: { sprintId: id, sprintGoalId: null } as unknown as Partial<Ticket>,
      });
    } else {
      // Move to a sprint goal
      updateTicket.mutate({
        id: ticketId,
        data: { sprintId: id, sprintGoalId: targetContainer },
      });
    }
  }

  function handleDragCancel() {
    setActiveTicket(null);
    setOverContainerId(null);
  }

  // ─── Ticket form helpers ─────────────────────────────────────────
  function openTicketForm(goalId?: string) {
    setEditingTicket(null);
    setTicketFormGoalId(goalId);
    setTicketFormOpen(true);
  }

  function openEditForm(ticket: Ticket) {
    setEditingTicket(ticket);
    setTicketFormGoalId(undefined);
    setTicketFormOpen(true);
  }

  function handleTicketSubmit(data: Partial<Ticket>) {
    if (editingTicket) {
      updateTicket.mutate(
        { id: editingTicket.id, data },
        { onSuccess: () => { setTicketFormOpen(false); setEditingTicket(null); } }
      );
    } else {
      createTicket.mutate(data, {
        onSuccess: () => setTicketFormOpen(false),
      });
    }
  }

  function handleCreateGoal(data: Partial<SprintGoal>) {
    createSprintGoal.mutate(
      { sprintId: id, data },
      { onSuccess: () => setShowGoalForm(false) }
    );
  }

  function getGoalSP(goalId: string): number {
    return (ticketsByGoal.get(goalId) ?? []).reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="px-4 py-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <nav className="text-sm text-muted-foreground flex items-center gap-1">
              <Link to="/pi" className="hover:text-muted-foreground cursor-pointer">{t('increment')}管理</Link>
              <span>/</span>
              {sprint?.incrementId && (
                <>
                  <Link to={`/pi/${sprint.incrementId}`} className="hover:text-muted-foreground cursor-pointer">
                    {sprint?.increment?.name ?? 'PI'}
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-foreground font-medium">プランニング</span>
            </nav>
            <select
              value={id}
              onChange={(e) => {
                const selected = allSprints.find((s) => s.id === e.target.value);
                if (selected) {
                  navigate(`/pi/${selected.incrementId}/planning/${selected.id}`, { replace: true });
                }
              }}
              className="bg-muted/40 border border-border rounded-[var(--radius-sm)] px-2 py-1 text-sm text-foreground/80 focus:outline-none focus:border-primary/30"
            >
              {Array.from(sprintsByIncrement.entries()).map(([incId, { name, sprints: incSprints }]) => (
                <optgroup key={incId} label={name}>
                  {incSprints.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}{s.status === 'ACTIVE' ? ' (実行中)' : s.status === 'COMPLETED' ? ' (完了)' : ''}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {sprint?.status === 'PLANNED' && (
              <button
                onClick={() => {
                  if (window.confirm(`「${sprint.name}」を開始しますか？`)) {
                    startSprint.mutate(sprint.id);
                  }
                }}
                disabled={startSprint.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-[var(--radius-md)] hover:bg-emerald-500 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5" />
                {t('sprint')}開始
              </button>
            )}
            {sprint?.status === 'ACTIVE' && (
              <button
                onClick={() => {
                  if (window.confirm(`「${sprint.name}」を終了しますか？ DONEチケットのSP合計がベロシティとして記録されます。`)) {
                    completeSprint.mutate(sprint.id);
                  }
                }}
                disabled={completeSprint.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-[var(--radius-md)] hover:bg-red-500 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Square className="h-3.5 w-3.5" />
                {t('sprint')}終了
              </button>
            )}
            {sprint?.status === 'COMPLETED' && (
              <button
                onClick={() => {
                  if (window.confirm(`「${sprint.name}」を再開しますか？ベロシティはリセットされます。`)) {
                    reopenSprint.mutate(sprint.id);
                  }
                }}
                disabled={reopenSprint.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-amber-600 text-white rounded-[var(--radius-md)] hover:bg-amber-500 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t('sprint')}再開
              </button>
            )}
          </div>
        </div>

        {/* Capacity Bar */}
        <CapacityBar
          totalCapacity={totalCapacity}
          usedCapacity={usedCapacity}
          averageVelocity={avgVelocity}
          unit="SP"
          onEditCapacity={() => setShowCapacityForm(true)}
        />

        {/* Two Column Layout — backlog narrower */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,5fr)] gap-4 lg:gap-6">
          {/* ════════ Left: Product Backlog ════════ */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest">
                プロダクトバックログ ({leftColumnTickets.length}件)
              </h2>
            </div>

            <DroppableZone
              id={BACKLOG_DROPPABLE}
              isOver={overContainerId === BACKLOG_DROPPABLE}
              className="rounded-[var(--radius-md)] min-h-[200px] transition-all"
            >
              <SortableContext
                id={BACKLOG_DROPPABLE}
                items={leftColumnTickets.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {leftColumnTickets.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8 text-sm bg-muted/20 rounded-[var(--radius-md)] border border-dashed border-border">
                    プロダクトバックログにチケットがありません
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leftColumnTickets.map((ticket) => (
                      <DraggableTicketCard key={ticket.id} ticket={ticket} onEdit={openEditForm} />
                    ))}
                  </div>
                )}
              </SortableContext>
            </DroppableZone>
          </div>

          {/* ════════ Right: Sprint Goals ════════ */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest">
                {t('sprintGoal')} ({sprintGoals.length}件)
              </h2>
              <button
                onClick={() => setShowGoalForm(true)}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 cursor-pointer"
              >
                <Target className="h-3.5 w-3.5" />
                ゴール追加
              </button>
            </div>

            <div className="space-y-3">
              {sprintGoals.map((goal) => {
                const goalTickets = ticketsByGoal.get(goal.id) ?? [];
                const goalSP = getGoalSP(goal.id);
                const isOverThis = overContainerId === goal.id;

                return (
                  <DroppableZone
                    key={goal.id}
                    id={goal.id}
                    isOver={isOverThis}
                    className="border border-blue-400/20 rounded-[var(--radius-md)] bg-blue-500/5 overflow-hidden transition-all"
                  >
                    {/* Goal Header */}
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      <Target className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      <span className="text-sm font-medium text-blue-400 truncate flex-1">
                        {goal.title}
                      </span>
                      <span className="text-xs text-blue-400/60 shrink-0">
                        {goalTickets.length}件 / {goalSP} SP
                      </span>
                    </div>

                    {/* Goal Content */}
                    <SortableContext
                      id={goal.id}
                      items={goalTickets.map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="px-3 pb-3 space-y-2">
                        {goal.longTermGoal && (
                          <div className="text-xs text-muted-foreground/50 px-1">
                            {t('longTermGoal')}: {goal.longTermGoal.title}
                          </div>
                        )}

                        {goalTickets.map((ticket) => (
                          <DraggableTicketCard key={ticket.id} ticket={ticket} onEdit={openEditForm} />
                        ))}

                        {goalTickets.length === 0 && !isOverThis && (
                          <div className="text-center text-muted-foreground/40 py-4 text-xs border border-dashed border-border/50 rounded-[var(--radius-sm)]">
                            バックログからチケットをドラッグ
                          </div>
                        )}

                        {isOverThis && goalTickets.length === 0 && (
                          <div className="text-center text-primary/60 py-4 text-xs border-2 border-dashed border-primary/30 rounded-[var(--radius-sm)] bg-primary/5">
                            ここにドロップ
                          </div>
                        )}

                        {/* Create ticket button */}
                        <button
                          onClick={() => openTicketForm(goal.id)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer px-2 py-1 rounded-[var(--radius-sm)] border border-dashed border-border hover:border-border/80 transition-colors w-full justify-center"
                        >
                          <Plus className="h-3 w-3" />
                          チケット作成
                        </button>
                      </div>
                    </SortableContext>
                  </DroppableZone>
                );
              })}

              {/* Empty state */}
              {sprintGoals.length === 0 && (
                <div className="text-center py-12 space-y-3">
                  <Target className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                  <div className="text-sm text-muted-foreground/60">
                    まずスプリントゴールを作成して、<br />
                    チケットをドラッグで紐づけましょう
                  </div>
                  <button
                    onClick={() => setShowGoalForm(true)}
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 cursor-pointer px-4 py-2 rounded-[var(--radius-md)] border border-primary/20 hover:border-primary/30 transition-colors"
                  >
                    <Target className="h-4 w-4" />
                    {t('sprintGoal')}を作成
                  </button>
                </div>
              )}

              {/* ──── Unlinked: sprint tickets without a goal ──── */}
              <DroppableZone
                id={UNLINKED_DROPPABLE}
                isOver={overContainerId === UNLINKED_DROPPABLE}
                className="border border-amber-400/20 rounded-[var(--radius-md)] bg-amber-500/5 overflow-hidden transition-all"
              >
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <CircleSlash className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="text-sm font-medium text-amber-400 truncate flex-1">
                    ゴール未割当
                  </span>
                  <span className="text-xs text-amber-400/60 shrink-0">
                    {unlinkedSprintTickets.length}件 / {unlinkedSprintTickets.reduce((s, t) => s + (t.storyPoints ?? 0), 0)} SP
                  </span>
                </div>

                <SortableContext
                  id={UNLINKED_DROPPABLE}
                  items={unlinkedSprintTickets.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="px-3 pb-3 space-y-2">
                    {unlinkedSprintTickets.map((ticket) => (
                      <DraggableTicketCard key={ticket.id} ticket={ticket} onEdit={openEditForm} />
                    ))}

                    {unlinkedSprintTickets.length === 0 && !(overContainerId === UNLINKED_DROPPABLE) && (
                      <div className="text-center text-muted-foreground/40 py-4 text-xs border border-dashed border-border/50 rounded-[var(--radius-sm)]">
                        ゴール未割当のチケットはありません
                      </div>
                    )}

                    {overContainerId === UNLINKED_DROPPABLE && unlinkedSprintTickets.length === 0 && (
                      <div className="text-center text-primary/60 py-4 text-xs border-2 border-dashed border-primary/30 rounded-[var(--radius-sm)] bg-primary/5">
                        ここにドロップ
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DroppableZone>

              {/* Bottom action buttons */}
              {sprintGoals.length > 0 && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setShowGoalForm(true)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer px-2 py-1.5 rounded-[var(--radius-sm)] border border-dashed border-border hover:border-border/80 transition-colors"
                  >
                    <Target className="h-3 w-3" />
                    ゴール追加
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTicket && (
          <div className="rotate-1 opacity-80 w-[320px]">
            <TicketCard ticket={activeTicket} />
          </div>
        )}
      </DragOverlay>

      {/* Capacity Form Dialog */}
      <CapacityForm
        open={showCapacityForm}
        onClose={() => setShowCapacityForm(false)}
        onSubmit={(members) => {
          upsertCapacity.mutate(
            { sprintId: id, members },
            { onSuccess: () => setShowCapacityForm(false) }
          );
        }}
        isLoading={upsertCapacity.isPending}
        capacities={capacities}
        users={teamMembers.map((m) => ({ id: m.userId, name: m.userName }))}
        teamMemberIds={teamMembers.map((m) => m.userId)}
      />

      {/* Sprint Goal Form Dialog */}
      <SprintGoalForm
        open={showGoalForm}
        onClose={() => setShowGoalForm(false)}
        onSubmit={handleCreateGoal}
        isLoading={createSprintGoal.isPending}
        longTermGoals={longTermGoals.map((g) => ({ id: g.id, title: g.title }))}
      />

      {/* Ticket Form Dialog */}
      <TicketForm
        open={ticketFormOpen}
        onClose={() => { setTicketFormOpen(false); setEditingTicket(null); }}
        onSubmit={handleTicketSubmit}
        ticket={editingTicket ?? undefined}
        defaultSprintId={id}
        defaultSprintGoalId={ticketFormGoalId}
      />
    </DndContext>
  );
}
