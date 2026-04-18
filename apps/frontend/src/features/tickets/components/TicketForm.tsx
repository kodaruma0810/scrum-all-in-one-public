import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Ticket, TicketType, TicketPriority } from '../types';
import { cn } from '@/lib/utils';
import { useUsers } from '@/features/users/hooks/useUsers';
import { useSprints } from '@/features/sprints/hooks/useSprints';
import { useSprintGoals } from '@/features/goals/hooks/useGoals';
import { useTerms } from '@/hooks/useTerms';

interface TicketFormProps {
  ticket?: Ticket;
  onSubmit: (data: Partial<Ticket>) => void;
  onClose: () => void;
  open: boolean;
  defaultSprintId?: string;
  defaultSprintGoalId?: string;
}

const TICKET_TYPES: { value: TicketType; label: string }[] = [
  { value: 'USER_STORY', label: 'User Story' },
  { value: 'TASK', label: 'Task' },
  { value: 'BUG', label: 'Bug' },
  { value: 'SUBTASK', label: 'Subtask' },
];

const PRIORITIES: { value: TicketPriority; label: string }[] = [
  { value: 'HIGHEST', label: 'Highest' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
  { value: 'LOWEST', label: 'Lowest' },
];

const STORY_POINTS = [1, 2, 3, 5, 8, 13, 21];

export default function TicketForm({ ticket, onSubmit, onClose, open, defaultSprintId, defaultSprintGoalId }: TicketFormProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TicketType>('TASK');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [storyPoints, setStoryPoints] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [sprintId, setSprintId] = useState('');
  const [sprintGoalId, setSprintGoalId] = useState('');

  const t = useTerms();
  const { data: users = [] } = useUsers();
  const { data: sprints = [] } = useSprints();
  const { data: sprintGoals = [] } = useSprintGoals(sprintId || '');

  useEffect(() => {
    if (ticket) {
      setTitle(ticket.title ?? '');
      setType(ticket.type ?? 'TASK');
      setPriority(ticket.priority ?? 'MEDIUM');
      setStoryPoints(ticket.storyPoints);
      setDescription(ticket.description ?? '');
      setAssigneeId(ticket.assigneeId ?? '');
      setSprintId(ticket.sprintId ?? '');
      setSprintGoalId(ticket.sprintGoalId ?? '');
    } else {
      setTitle('');
      setType('TASK');
      setPriority('MEDIUM');
      setStoryPoints(undefined);
      setDescription('');
      setAssigneeId('');
      setSprintId(defaultSprintId ?? '');
      setSprintGoalId(defaultSprintGoalId ?? '');
    }
  }, [ticket, open, defaultSprintId, defaultSprintGoalId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const data: Partial<Ticket> = {
      title: title.trim(),
      type,
      priority,
      description: description || undefined,
      storyPoints: storyPoints,
      assigneeId: assigneeId || undefined,
      sprintId: sprintId || undefined,
      sprintGoalId: sprintGoalId || undefined,
    };
    onSubmit(data);
  };

  const inputClass = 'w-full bg-muted/40 border border-border rounded-[var(--radius-sm)] px-3 py-2 text-sm text-foreground/90 placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30';
  const labelClass = 'block text-sm font-medium text-muted-foreground/70 mb-1';

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-popover rounded-[var(--radius-lg)] w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto border border-border">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              {ticket ? 'チケット編集' : 'チケット作成'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground/90 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>タイトル <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                placeholder="チケットタイトル"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>種別</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as TicketType)}
                  className={cn(inputClass, 'cursor-pointer')}
                >
                  {TICKET_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>優先度</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className={cn(inputClass, 'cursor-pointer')}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>ストーリーポイント</label>
              <select
                value={storyPoints ?? ''}
                onChange={(e) => setStoryPoints(e.target.value ? Number(e.target.value) : undefined)}
                className={cn(inputClass, 'cursor-pointer')}
              >
                <option value="">未設定</option>
                {STORY_POINTS.map((sp) => (
                  <option key={sp} value={sp}>{sp}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>説明</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={cn(inputClass, 'resize-none')}
                rows={3}
                placeholder="チケットの説明"
              />
            </div>

            <div>
              <label className={labelClass}>担当者</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className={cn(inputClass, 'cursor-pointer')}
              >
                <option value="">未割り当て</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>{t('sprint')}</label>
              <select
                value={sprintId}
                onChange={(e) => { setSprintId(e.target.value); setSprintGoalId(''); }}
                className={cn(inputClass, 'cursor-pointer')}
              >
                <option value="">未割り当て</option>
                {sprints.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {sprintId && (
              <div>
                <label className={labelClass}>{t('sprintGoal')}</label>
                <select
                  value={sprintGoalId}
                  onChange={(e) => setSprintGoalId(e.target.value)}
                  className={cn(inputClass, 'cursor-pointer')}
                >
                  <option value="">未割り当て</option>
                  {sprintGoals.map((sg) => (
                    <option key={sg.id} value={sg.id}>{sg.title}</option>
                  ))}
                </select>
              </div>
            )}

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
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-[var(--radius-md)] hover:bg-primary/90 transition-colors cursor-pointer"
              >
                {ticket ? '更新' : '作成'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
