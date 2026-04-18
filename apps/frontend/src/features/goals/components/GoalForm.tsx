import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { LongTermGoal, SprintGoal, GoalPriority, GoalStatus, CommitmentType, SprintGoalStatus } from '../types';
import { useTerms } from '@/hooks/useTerms';

// ---- LongTermGoal Form ----

interface GoalFormProps {
  open: boolean;
  onClose: () => void;
  goal?: LongTermGoal;
  onSubmit: (data: Partial<LongTermGoal>) => void;
  isLoading?: boolean;
}

export function GoalForm({ open, onClose, goal, onSubmit, isLoading }: GoalFormProps) {
  const t = useTerms();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<GoalPriority>('MUST_HAVE');
  const [commitment, setCommitment] = useState<CommitmentType>('COMMITTED');
  const [status, setStatus] = useState<GoalStatus>('NOT_STARTED');

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description ?? '');
      setPriority(goal.priority);
      setCommitment(goal.commitment);
      setStatus(goal.status);
    } else {
      setTitle('');
      setDescription('');
      setPriority('MUST_HAVE');
      setCommitment('COMMITTED');
      setStatus('NOT_STARTED');
    }
  }, [goal, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Partial<LongTermGoal> = { title, description, priority, commitment };
    if (goal) data.status = status;
    onSubmit(data);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-popover rounded-[var(--radius-lg)] p-6 w-full max-w-md z-50 border border-border">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              {goal ? `${t('longTermGoal')}編集` : `${t('longTermGoal')}作成`}
            </Dialog.Title>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground/70 mb-1">
                タイトル <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-muted/40 border border-border rounded-[var(--radius-sm)] px-3 py-2 text-sm text-foreground/90 placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground/70 mb-1">説明</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-muted/40 border border-border rounded-[var(--radius-sm)] px-3 py-2 text-sm text-foreground/90 placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground/70 mb-1">優先度</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as GoalPriority)}
                className="w-full bg-muted/40 border border-border rounded-[var(--radius-sm)] px-3 py-2 text-sm text-foreground/90 focus:outline-none focus:border-primary/30"
              >
                <option value="MUST_HAVE">Must Have</option>
                <option value="SHOULD_HAVE">Should Have</option>
                <option value="NICE_TO_HAVE">Nice to Have</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground/70 mb-1">コミットメント</label>
              <select
                value={commitment}
                onChange={(e) => setCommitment(e.target.value as CommitmentType)}
                className="w-full bg-muted/40 border border-border rounded-[var(--radius-sm)] px-3 py-2 text-sm text-foreground/90 focus:outline-none focus:border-primary/30"
              >
                <option value="COMMITTED">コミット</option>
                <option value="UNCOMMITTED">非コミット</option>
              </select>
            </div>

            {goal && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground/70 mb-1">ステータス</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as GoalStatus)}
                  className="w-full bg-muted/40 border border-border rounded-[var(--radius-sm)] px-3 py-2 text-sm text-foreground/90 focus:outline-none focus:border-primary/30"
                >
                  <option value="NOT_STARTED">未着手</option>
                  <option value="IN_PROGRESS">進行中</option>
                  <option value="ACHIEVED">達成</option>
                  <option value="NOT_ACHIEVED">未達成</option>
                  <option value="PARTIALLY_ACHIEVED">部分達成</option>
                </select>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm border border-border text-muted-foreground hover:text-foreground rounded-[var(--radius-md)] cursor-pointer"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isLoading}
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

// ---- SprintGoal Form ----

interface SprintGoalFormProps {
  open: boolean;
  onClose: () => void;
  goal?: SprintGoal;
  onSubmit: (data: Partial<SprintGoal>) => void;
  isLoading?: boolean;
  longTermGoals?: Array<{ id: string; title: string }>;
}

export function SprintGoalForm({ open, onClose, goal, onSubmit, isLoading, longTermGoals = [] }: SprintGoalFormProps) {
  const t = useTerms();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<SprintGoalStatus>('NOT_STARTED');
  const [longTermGoalId, setLongTermGoalId] = useState('');

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description ?? '');
      setStatus(goal.status);
      setLongTermGoalId(goal.longTermGoalId ?? '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('NOT_STARTED');
      setLongTermGoalId('');
    }
  }, [goal, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Partial<SprintGoal> = {
      title,
      description,
      longTermGoalId: longTermGoalId || undefined,
    };
    if (goal) data.status = status;
    onSubmit(data);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-popover rounded-[var(--radius-lg)] p-6 w-full max-w-md z-50 border border-border">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              {goal ? `${t('sprintGoal')}編集` : `${t('sprintGoal')}作成`}
            </Dialog.Title>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground/70 mb-1">
                タイトル <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-muted/40 border border-border rounded-[var(--radius-sm)] px-3 py-2 text-sm text-foreground/90 placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground/70 mb-1">説明</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-muted/40 border border-border rounded-[var(--radius-sm)] px-3 py-2 text-sm text-foreground/90 placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30 resize-none"
              />
            </div>

            {goal && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground/70 mb-1">ステータス</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as SprintGoalStatus)}
                  className="w-full bg-muted/40 border border-border rounded-[var(--radius-sm)] px-3 py-2 text-sm text-foreground/90 focus:outline-none focus:border-primary/30"
                >
                  <option value="NOT_STARTED">未着手</option>
                  <option value="IN_PROGRESS">進行中</option>
                  <option value="ACHIEVED">達成</option>
                  <option value="NOT_ACHIEVED">未達成</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-muted-foreground/70 mb-1">{t('longTermGoal')}</label>
              <select
                value={longTermGoalId}
                onChange={(e) => setLongTermGoalId(e.target.value)}
                className="w-full bg-muted/40 border border-border rounded-[var(--radius-sm)] px-3 py-2 text-sm text-foreground/90 focus:outline-none focus:border-primary/30"
              >
                <option value="">紐づけなし</option>
                {longTermGoals.map((g) => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm border border-border text-muted-foreground hover:text-foreground rounded-[var(--radius-md)] cursor-pointer"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isLoading}
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
