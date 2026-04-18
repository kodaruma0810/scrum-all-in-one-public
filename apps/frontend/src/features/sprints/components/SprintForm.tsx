import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Sprint } from '../types';
import { useIncrements } from '@/features/goals/hooks/useGoals';
import { useTeamStore } from '@/lib/teamStore';
import { useTerms } from '@/hooks/useTerms';

interface SprintFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Sprint>) => void;
  initialValues?: Partial<Sprint>;
  isLoading?: boolean;
}

export default function SprintForm({
  open,
  onOpenChange,
  onSubmit,
  initialValues,
  isLoading,
}: SprintFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [startDate, setStartDate] = useState(
    initialValues?.startDate ? initialValues.startDate.slice(0, 10) : ''
  );
  const [endDate, setEndDate] = useState(
    initialValues?.endDate ? initialValues.endDate.slice(0, 10) : ''
  );
  const [goal, setGoal] = useState(initialValues?.goal ?? '');
  const [incrementId, setIncrementId] = useState(initialValues?.incrementId ?? '');

  const t = useTerms();
  const { data: increments = [] } = useIncrements();
  const { currentTeamId, currentTeamName } = useTeamStore();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ name, startDate, endDate, goal: goal || undefined, incrementId, teamId: currentTeamId ?? '' });
  }

  const selectClass =
    'w-full bg-muted/40 border border-border text-foreground/90 rounded-[var(--radius-md)] px-3 py-2 text-sm focus:outline-none focus:border-primary/30 appearance-none';
  const inputClass =
    'w-full bg-muted/40 border border-border text-foreground/90 rounded-[var(--radius-md)] px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30';

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-popover border border-border rounded-[var(--radius-lg)] z-50 w-full max-w-md p-6">
          <Dialog.Title className="text-lg font-semibold text-foreground mb-4">
            {initialValues?.id ? `${t('sprint')}編集` : `${t('sprint')}作成`}
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-1">
                {t('sprint')}名 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputClass}
                placeholder="Sprint 1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-1">開始日</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-1">終了日</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-1">目標サマリー</label>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={3}
                className={`${inputClass} resize-none`}
                placeholder={`この${t('sprint')}で達成したいこと...`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-1">
                PI <span className="text-red-400">*</span>
              </label>
              <select
                value={incrementId}
                onChange={(e) => setIncrementId(e.target.value)}
                required
                className={selectClass}
              >
                <option value="">選択してください</option>
                {increments.map((inc) => (
                  <option key={inc.id} value={inc.id}>
                    {inc.name}
                  </option>
                ))}
              </select>
              {increments.length === 0 && (
                <p className="text-xs text-muted-foreground/50 mt-1">
                  PIが未作成です。先にPI管理から作成してください。
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-1">
                チーム <span className="text-red-400">*</span>
              </label>
              {currentTeamId ? (
                <div className="bg-muted/40 border border-border rounded-[var(--radius-md)] px-3 py-2 text-sm text-foreground/90">
                  {currentTeamName}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/50">
                  チームが選択されていません。サイドバーからチームを選択してください。
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-4 py-2 text-sm border border-border text-muted-foreground rounded-[var(--radius-md)] hover:text-foreground cursor-pointer"
                >
                  キャンセル
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isLoading || !name || !incrementId || !currentTeamId}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-[var(--radius-md)] hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
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
