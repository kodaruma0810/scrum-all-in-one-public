import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Square } from 'lucide-react';
import { useTerms } from '@/hooks/useTerms';
import { useDsuToday } from '@/features/dsu/hooks/useDsu';
import { useQueryClient } from '@tanstack/react-query';
import { useTickets, useCreateTicket, useUpdateTicket, useDeleteTicket } from '@/features/tickets/hooks/useTickets';
import { useSprints, useSprint, useCompleteSprint } from '@/features/sprints/hooks/useSprints';
import { useSprintGoals } from '@/features/goals/hooks/useGoals';
import { Ticket, TicketFilters } from '@/features/tickets/types';
import KanbanBoard from '@/features/tickets/components/KanbanBoard';
import TicketForm from '@/features/tickets/components/TicketForm';
import SprintCompleteDialog from '../components/SprintCompleteDialog';
import DsuMemberStatusForm from '@/features/dsu/components/DsuMemberStatusForm';
import DsuSprintSummary from '@/features/dsu/components/DsuSprintSummary';
import DsuSprintGoalCard from '@/features/dsu/components/DsuSprintGoalCard';
import BurndownChart from '@/features/dsu/components/BurndownChart';
import DsuNotesEditor from '../components/DsuNotesEditor';
import { cn } from '@/lib/utils';

export default function ActiveSprintPage() {
  const t = useTerms();
  const queryClient = useQueryClient();
  const { data: todayData, isLoading, isError } = useDsuToday();
  const { data: allSprints = [] } = useSprints();

  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | undefined>(undefined);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [nextSprintId, setNextSprintId] = useState('');

  const { sprint: activeSprint, dsuLog: activeDsuLog } = todayData ?? { sprint: null, dsuLog: null };

  // アクティブスプリントが取得できたらデフォルト選択
  useEffect(() => {
    if (activeSprint && !selectedSprintId) {
      setSelectedSprintId(activeSprint.id);
    }
  }, [activeSprint, selectedSprintId]);

  // 選択されたスプリントがアクティブスプリントかどうか
  const isViewingActive = !selectedSprintId || selectedSprintId === activeSprint?.id;

  // アクティブ以外のスプリントを選択した場合、個別に取得
  const { data: selectedSprintData } = useSprint(isViewingActive ? '' : (selectedSprintId ?? ''));

  // 表示するスプリントとDSUログを決定
  const sprint = isViewingActive ? activeSprint : selectedSprintData;
  const dsuLog = isViewingActive ? activeDsuLog : null;

  const sprintId = sprint?.id ?? '';

  // スプリントセレクター用: PI別にグループ化
  const sprintsByIncrement = new Map<string, { name: string; sprints: typeof allSprints }>();
  for (const s of [...allSprints].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())) {
    const incId = s.incrementId;
    const incName = s.increment?.name ?? 'PI';
    if (!sprintsByIncrement.has(incId)) {
      sprintsByIncrement.set(incId, { name: incName, sprints: [] });
    }
    sprintsByIncrement.get(incId)!.sprints.push(s);
  }

  const ticketFilters: TicketFilters = {
    sprintId: sprintId || undefined,
    sprintGoalId: selectedGoalId ?? undefined,
  };
  const { data: tickets = [] } = useTickets(sprintId ? ticketFilters : undefined);

  const createTicket = useCreateTicket();
  const updateTicket = useUpdateTicket();
  const deleteTicket = useDeleteTicket();
  const completeSprint = useCompleteSprint();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleCreate = (data: Partial<Ticket>) => {
    const submitData = { ...data, sprintId: data.sprintId || sprintId };
    createTicket.mutate(submitData as Ticket, {
      onSuccess: () => { setFormOpen(false); setEditingTicket(undefined); },
    });
  };

  const handleUpdate = (data: Partial<Ticket>) => {
    if (!editingTicket) return;
    updateTicket.mutate({ id: editingTicket.id, data }, {
      onSuccess: () => { setFormOpen(false); setEditingTicket(undefined); },
    });
  };

  const handleTicketClick = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setFormOpen(true);
  };

  // All sprint tickets (unfiltered) for the complete dialog
  const { data: allSprintTickets = [] } = useTickets(sprintId ? { sprintId } : undefined);
  const incompleteTickets = allSprintTickets.filter((t) => t.status !== 'DONE');

  // Next sprint candidates
  const plannedSprintsForComplete = allSprints
    .filter((s) => s.status === 'PLANNED')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  // Sprint goals for current and next sprint (for PI goal matching)
  const { data: currentSprintGoals = [] } = useSprintGoals(sprintId);
  const { data: nextSprintGoals = [] } = useSprintGoals(nextSprintId || '');

  function openCompleteDialog() {
    if (plannedSprintsForComplete.length > 0 && !nextSprintId) {
      setNextSprintId(plannedSprintsForComplete[0].id);
    }
    setCompleteDialogOpen(true);
  }

  async function handleComplete(actions: Map<string, 'next_sprint' | 'backlog' | 'delete'>) {
    setIsCompleting(true);
    try {
      // Build a map: current sprintGoalId → longTermGoalId
      const goalToLongTerm = new Map<string, string>();
      for (const g of currentSprintGoals) {
        if (g.longTermGoalId) goalToLongTerm.set(g.id, g.longTermGoalId);
      }
      // Build a map: longTermGoalId → next sprint's sprintGoalId
      const longTermToNextGoal = new Map<string, string>();
      for (const g of nextSprintGoals) {
        if (g.longTermGoalId) longTermToNextGoal.set(g.longTermGoalId, g.id);
      }

      // Process each ticket action
      const promises: Promise<unknown>[] = [];
      for (const [ticketId, action] of actions) {
        if (action === 'next_sprint' && nextSprintId) {
          // Find matching sprint goal in next sprint via PI goal
          const ticket = allSprintTickets.find((t) => t.id === ticketId);
          const currentGoalId = ticket?.sprintGoalId;
          const longTermGoalId = currentGoalId ? goalToLongTerm.get(currentGoalId) : undefined;
          const nextGoalId = longTermGoalId ? longTermToNextGoal.get(longTermGoalId) : undefined;

          promises.push(
            updateTicket.mutateAsync({
              id: ticketId,
              data: { sprintId: nextSprintId, sprintGoalId: nextGoalId ?? null } as any,
            })
          );
        } else if (action === 'backlog') {
          promises.push(
            updateTicket.mutateAsync({ id: ticketId, data: { sprintId: null, sprintGoalId: null } as any })
          );
        } else if (action === 'delete') {
          promises.push(deleteTicket.mutateAsync(ticketId));
        }
      }
      await Promise.all(promises);

      // Complete the sprint
      await completeSprint.mutateAsync(sprintId);

      // Ensure all caches are refreshed after all operations
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tickets'] }),
        queryClient.invalidateQueries({ queryKey: ['backlog'] }),
        queryClient.invalidateQueries({ queryKey: ['sprints'] }),
        queryClient.invalidateQueries({ queryKey: ['sprint'] }),
        queryClient.invalidateQueries({ queryKey: ['sprintGoals'] }),
        queryClient.invalidateQueries({ queryKey: ['dsu', 'today'] }),
      ]);

      setCompleteDialogOpen(false);
    } catch (err) {
      console.error('Failed to complete sprint:', err);
    } finally {
      setIsCompleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="px-4 py-6 md:p-8 flex items-center justify-center text-muted-foreground/70 text-sm">
        読み込み中...
      </div>
    );
  }

  const plannedSprints = allSprints.filter((s) => s.status === 'PLANNED');

  // スプリントセレクター（共通コンポーネント）
  const sprintSelector = allSprints.length > 0 && (
    <select
      value={selectedSprintId ?? ''}
      onChange={(e) => {
        setSelectedSprintId(e.target.value || null);
        setSelectedGoalId(null);
      }}
      className="bg-muted/50 border border-border text-foreground text-sm rounded-[var(--radius-md)] px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/50"
    >
      <option value="">{t('sprint')}を選択</option>
      {[...sprintsByIncrement.entries()].map(([incId, { name, sprints }]) => (
        <optgroup key={incId} label={name}>
          {sprints.map((s) => (
            <option key={s.id} value={s.id}>
              {name} / {s.name}
              {s.status === 'ACTIVE' ? '（実行中）' : s.status === 'COMPLETED' ? '（完了）' : '（計画中）'}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );

  if (!sprint) {
    return (
      <div className="px-4 py-6 md:p-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-foreground">{t('sprint')}</h1>
          {sprintSelector}
        </div>
        <div className="bg-card rounded-[var(--radius-lg)] border border-border p-8 text-center space-y-4">
          {isError ? (
            <>
              <p className="text-red-400 text-sm">データの取得に失敗しました</p>
              <p className="text-muted-foreground text-xs">ブラウザのコンソールを確認してください</p>
            </>
          ) : plannedSprints.length > 0 ? (
            <>
              <p className="text-muted-foreground text-sm">アクティブな{t('sprint')}がありません</p>
              <p className="text-muted-foreground/70 text-xs">
                {t('increment')}管理から計画中の{t('sprint')}を開始するか、上のセレクターから{t('sprint')}を選択してください
              </p>
              <Link
                to="/pi"
                className="text-sm text-primary hover:text-primary/80 underline transition-colors"
              >
                {t('increment')}管理へ
              </Link>
            </>
          ) : (
            <>
              <p className="text-muted-foreground text-sm">{t('sprint')}がありません</p>
              <Link
                to="/pi"
                className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
              >
                {t('increment')}管理へ
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  const allGoals = sprint.sprintGoals ?? [];
  const members = (sprint.memberCapacities ?? []).map((mc) => mc.user).filter(Boolean) as {
    id: string;
    name: string;
    avatarUrl?: string | null;
  }[];

  // --- Normal Mode ---
  return (
    <div className="px-4 py-4 md:p-6">
      {/* ═══ Header ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <DsuSprintSummary sprint={sprint} />
          {sprintSelector}
          {!isViewingActive && (
            <span className="text-xs text-muted-foreground bg-muted/50 border border-border px-2 py-0.5 rounded-[var(--radius-sm)]">
              過去の{t('sprint')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isViewingActive && (
            <>
              {/* Compact Timer */}
              <div className="flex items-center gap-2 bg-card border border-border rounded-[var(--radius-md)] px-3 py-1.5">
                <CompactTimer />
              </div>
              <button
                onClick={() => { setEditingTicket(undefined); setFormOpen(true); }}
                className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-[var(--radius-md)] hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                チケット作成
              </button>
              <button
                onClick={openCompleteDialog}
                className="flex items-center gap-1.5 px-3 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium rounded-[var(--radius-md)] transition-colors cursor-pointer"
              >
                <Square className="h-3.5 w-3.5" />
                {t('sprint')}終了
              </button>
            </>
          )}
        </div>
      </div>

      {/* ═══ IT Goals (横スクロール、選択でフィルタ) ═══ */}
      {allGoals.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest shrink-0">
              {t('sprintGoal')}
            </p>
            {selectedGoalId && (
              <button
                onClick={() => setSelectedGoalId(null)}
                className="text-xs text-primary hover:text-primary/80 cursor-pointer"
              >
                フィルタ解除
              </button>
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {allGoals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setSelectedGoalId(selectedGoalId === goal.id ? null : goal.id)}
                className={cn(
                  'shrink-0 w-64 sm:w-80 text-left cursor-pointer transition-all rounded-[var(--radius-md)] border-2',
                  selectedGoalId === goal.id
                    ? 'border-primary/50 shadow-[0_0_0_1px_hsl(var(--primary)/0.2)]'
                    : selectedGoalId !== null
                    ? 'border-border/50 opacity-50 hover:opacity-80'
                    : 'border-border hover:border-border/80'
                )}
              >
                <DsuSprintGoalCard goal={goal as any} readonly />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Kanban Board ═══ */}
      <div className="mb-6">
        <KanbanBoard
          tickets={tickets}
          onTicketClick={handleTicketClick}
        />
      </div>

      {/* ═══ Below Board: DSU Info (single column) ═══ */}
      {dsuLog && (
        <div className="space-y-5">
          {/* DSU Notes */}
          <div className="bg-card border border-border rounded-[var(--radius-lg)] p-4">
            <DsuNotesEditor dsuLogId={dsuLog.id} initialNotes={dsuLog.notes ?? ''} />
          </div>

          {/* Member Status */}
          {members.length > 0 && (
            <div className="bg-card border border-border rounded-[var(--radius-lg)] p-4">
              <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-3">
                メンバーステータス
              </p>
              <div className="space-y-3">
                {members.map((member) => (
                  <DsuMemberStatusForm
                    key={member.id}
                    dsuLogId={dsuLog.id}
                    member={member}
                    existingStatus={dsuLog.memberStatuses?.find((s) => s.userId === member.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Burndown Chart */}
          <div className="bg-card border border-border rounded-[var(--radius-lg)] p-4">
            <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-3">
              バーンダウン
            </p>
            <BurndownChart sprintId={sprint.id} />
          </div>
        </div>
      )}

      {/* Ticket Form */}
      <TicketForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingTicket(undefined); }}
        ticket={editingTicket}
        onSubmit={editingTicket ? handleUpdate : handleCreate}
        defaultSprintId={sprintId}
      />

      {/* Sprint Complete Dialog */}
      <SprintCompleteDialog
        open={completeDialogOpen}
        onClose={() => setCompleteDialogOpen(false)}
        onConfirm={handleComplete}
        isLoading={isCompleting}
        incompleteTickets={incompleteTickets}
        nextSprints={plannedSprintsForComplete}
        selectedNextSprintId={nextSprintId}
        onNextSprintChange={setNextSprintId}
      />
    </div>
  );
}

// ─── Compact Timer (inline, small) ────────────────────────────────────

function CompactTimer() {
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const colorClass =
    timeLeft > 5 * 60
      ? 'text-foreground'
      : timeLeft > 2 * 60
      ? 'text-yellow-400'
      : 'text-red-400 animate-pulse';

  return (
    <>
      <span className={`text-sm font-mono font-semibold tabular-nums ${colorClass}`}>
        {display}
      </span>
      <button
        onClick={() => setIsRunning((v) => !v)}
        className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
      >
        {isRunning ? '⏸' : '▶'}
      </button>
      <button
        onClick={() => { setIsRunning(false); setTimeLeft(15 * 60); }}
        className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
      >
        ↺
      </button>
    </>
  );
}
