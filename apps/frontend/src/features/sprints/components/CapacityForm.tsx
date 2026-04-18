import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Trash2 } from 'lucide-react';
import { MemberCapacity } from '../types';
import { cn } from '@/lib/utils';

interface CapacityFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (members: Array<{ userId: string; availableDays: number }>) => void;
  isLoading?: boolean;
  capacities: MemberCapacity[];
  users: Array<{ id: string; name: string }>;
  teamMemberIds?: string[];
}

export default function CapacityForm({ open, onClose, onSubmit, isLoading, capacities, users, teamMemberIds = [] }: CapacityFormProps) {
  const [rows, setRows] = useState<Array<{ userId: string; availableDays: number }>>([]);

  useEffect(() => {
    if (!open) return;
    if (capacities.length > 0) {
      setRows(capacities.map((c) => ({ userId: c.userId, availableDays: c.availableDays })));
    } else if (teamMemberIds.length > 0) {
      // Pre-populate with team members when no capacity data exists
      setRows(teamMemberIds.map((uid) => ({ userId: uid, availableDays: 10 })));
    } else {
      setRows([]);
    }
  }, [open, capacities, teamMemberIds]);

  // Users already added
  const usedUserIds = new Set(rows.map((r) => r.userId));
  const availableUsers = users.filter((u) => !usedUserIds.has(u.id));

  function removeRow(index: number) {
    setRows(rows.filter((_, i) => i !== index));
  }

  function updateDays(index: number, value: number) {
    setRows(rows.map((r, i) => (i === index ? { ...r, availableDays: value } : r)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid = rows.filter((r) => r.userId && r.availableDays > 0);
    onSubmit(valid);
  }

  const totalDays = rows.reduce((sum, r) => sum + r.availableDays, 0);

  const inputClass = 'w-full bg-muted/40 border border-border rounded-[var(--radius-sm)] px-3 py-2 text-sm text-foreground/90 focus:outline-none focus:border-primary/30';

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-popover rounded-[var(--radius-lg)] w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto border border-border">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              キャパシティ設定
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground/90 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Member rows */}
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_100px_32px] gap-2 text-xs font-medium text-muted-foreground/70">
                <span>メンバー</span>
                <span>稼働可能日数</span>
                <span />
              </div>

              {rows.map((row, index) => {
                const userName = users.find((u) => u.id === row.userId)?.name ?? '不明';

                return (
                  <div key={index} className="grid grid-cols-[1fr_100px_32px] gap-2 items-center">
                    <span className="text-sm text-foreground/90 px-3 py-2 truncate">
                      {userName}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      step={0.5}
                      value={row.availableDays}
                      onChange={(e) => updateDays(index, parseFloat(e.target.value) || 0)}
                      className={cn(inputClass, 'text-center tabular-nums')}
                    />
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="flex items-center justify-center h-8 w-8 text-muted-foreground hover:text-red-400 transition-colors cursor-pointer rounded-[var(--radius-sm)] hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}

              {rows.length === 0 && (
                <div className="text-center text-muted-foreground/50 py-4 text-sm border border-dashed border-border rounded-[var(--radius-sm)]">
                  メンバーを追加してください
                </div>
              )}
            </div>

            {/* Add member selector */}
            {availableUsers.length > 0 && (
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    setRows([...rows, { userId: e.target.value, availableDays: 10 }]);
                  }
                }}
                className={cn(inputClass, 'cursor-pointer text-muted-foreground/70')}
              >
                <option value="">+ メンバーを追加...</option>
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            )}

            {/* Total */}
            {rows.length > 0 && (
              <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-3">
                <span>合計キャパシティ</span>
                <span className="font-semibold text-foreground tabular-nums">{totalDays} 日</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium border border-border text-muted-foreground hover:text-foreground rounded-[var(--radius-md)] transition-colors cursor-pointer"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-[var(--radius-md)] hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoading ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
