import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, ArrowRight, ArchiveRestore, Trash2 } from 'lucide-react';
import { Ticket } from '@/features/tickets/types';
import { Sprint } from '@/features/sprints/types';
import { cn } from '@/lib/utils';
import { useTerms } from '@/hooks/useTerms';
import { useTeamSettings } from '@/features/users/hooks/useUsers';

type TicketAction = 'next_sprint' | 'backlog' | 'delete';

interface SprintCompleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (actions: Map<string, TicketAction>) => void;
  isLoading: boolean;
  incompleteTickets: Ticket[];
  nextSprints: Sprint[];
  selectedNextSprintId: string;
  onNextSprintChange: (id: string) => void;
}

function getActionConfig(t: ReturnType<typeof useTerms>): { value: TicketAction; label: string; icon: typeof ArrowRight; colorClass: string }[] {
  return [
    { value: 'next_sprint', label: `次${t('sprint')}`, icon: ArrowRight, colorClass: 'text-blue-400' },
    { value: 'backlog', label: 'バックログ', icon: ArchiveRestore, colorClass: 'text-amber-400' },
    { value: 'delete', label: '削除', icon: Trash2, colorClass: 'text-red-400' },
  ];
}

export default function SprintCompleteDialog({
  open,
  onClose,
  onConfirm,
  isLoading,
  incompleteTickets,
  nextSprints,
  selectedNextSprintId,
  onNextSprintChange,
}: SprintCompleteDialogProps) {
  const t = useTerms();
  const { data: teamSettings } = useTeamSettings();
  const ticketPrefix = teamSettings?.ticketPrefix || 'SCR';
  const ACTION_CONFIG = getActionConfig(t);
  const [actions, setActions] = useState<Map<string, TicketAction>>(new Map());
  const [bulkAction, setBulkAction] = useState<TicketAction>('next_sprint');

  const getAction = (ticketId: string): TicketAction => actions.get(ticketId) ?? bulkAction;

  function setTicketAction(ticketId: string, action: TicketAction) {
    setActions((prev) => {
      const next = new Map(prev);
      next.set(ticketId, action);
      return next;
    });
  }

  function applyBulkAction(action: TicketAction) {
    setBulkAction(action);
    setActions(new Map());
  }

  function handleConfirm() {
    const finalActions = new Map<string, TicketAction>();
    for (const ticket of incompleteTickets) {
      finalActions.set(ticket.id, getAction(ticket.id));
    }
    onConfirm(finalActions);
  }

  const hasNextSprint = nextSprints.length > 0;
  const deleteCount = incompleteTickets.filter((t) => getAction(t.id) === 'delete').length;

  const inputClass = 'w-full bg-muted/40 border border-border rounded-[var(--radius-sm)] px-3 py-2 text-sm text-foreground/90 focus:outline-none focus:border-primary/30';

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-popover rounded-[var(--radius-lg)] w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto border border-border">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              {t('sprint')}終了
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground/90 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {incompleteTickets.length === 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {`すべてのチケットが完了しています。${t('sprint')}を終了しますか？`}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium border border-border text-muted-foreground hover:text-foreground rounded-[var(--radius-md)] transition-colors cursor-pointer"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-[var(--radius-md)] hover:bg-red-500 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? '処理中...' : `${t('sprint')}終了`}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                未完了のチケットが <span className="text-foreground font-semibold">{incompleteTickets.length}件</span> あります。それぞれの処理方法を選択してください。
              </p>

              {/* Next sprint selector */}
              {hasNextSprint && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground/70 mb-1">{`移動先${t('sprint')}`}</label>
                  <select
                    value={selectedNextSprintId}
                    onChange={(e) => onNextSprintChange(e.target.value)}
                    className={cn(inputClass, 'cursor-pointer w-auto')}
                  >
                    {nextSprints.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Bulk action */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground/70">一括設定:</span>
                {ACTION_CONFIG.map(({ value, label, icon: Icon, colorClass }) => {
                  if (value === 'next_sprint' && !hasNextSprint) return null;
                  return (
                    <button
                      key={value}
                      onClick={() => applyBulkAction(value)}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1 text-xs rounded-[var(--radius-sm)] border transition-colors cursor-pointer',
                        bulkAction === value && actions.size === 0
                          ? 'border-primary/40 bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:text-foreground hover:border-border/80'
                      )}
                    >
                      <Icon className={cn('h-3 w-3', colorClass)} />
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Ticket list */}
              <div className="border border-border rounded-[var(--radius-md)] divide-y divide-border max-h-[400px] overflow-y-auto">
                {incompleteTickets.map((ticket) => {
                  const currentAction = getAction(ticket.id);
                  return (
                    <div key={ticket.id} className="flex items-center gap-3 px-3 py-2.5">
                      {/* Ticket info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground/60 font-mono shrink-0">
                            {ticketPrefix}-{String(ticket.ticketNumber).padStart(3, '0')}
                          </span>
                          <span className="text-sm text-foreground/90 truncate">{ticket.title}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground/50">{ticket.status}</span>
                          {ticket.storyPoints != null && (
                            <span className="text-xs text-muted-foreground/50">{ticket.storyPoints} SP</span>
                          )}
                        </div>
                      </div>

                      {/* Action selector */}
                      <div className="flex items-center gap-1 shrink-0">
                        {ACTION_CONFIG.map(({ value, label, icon: Icon, colorClass }) => {
                          if (value === 'next_sprint' && !hasNextSprint) return null;
                          const isActive = currentAction === value;
                          return (
                            <button
                              key={value}
                              onClick={() => setTicketAction(ticket.id, value)}
                              title={label}
                              className={cn(
                                'p-1.5 rounded-[var(--radius-sm)] transition-colors cursor-pointer',
                                isActive
                                  ? 'bg-primary/10 ring-1 ring-primary/30'
                                  : 'hover:bg-muted'
                              )}
                            >
                              <Icon className={cn('h-3.5 w-3.5', isActive ? colorClass : 'text-muted-foreground/40')} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary & actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-muted-foreground/70">
                  {deleteCount > 0 && (
                    <span className="text-red-400">{deleteCount}件のチケットが削除されます</span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium border border-border text-muted-foreground hover:text-foreground rounded-[var(--radius-md)] transition-colors cursor-pointer"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-[var(--radius-md)] hover:bg-red-500 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? '処理中...' : `${t('sprint')}終了`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
