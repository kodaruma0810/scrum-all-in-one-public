import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import axios from 'axios';
import { useCreateTeam } from '../hooks/useTeams';
import { useTeamStore } from '@/lib/teamStore';

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateTeamDialog({ open, onOpenChange }: CreateTeamDialogProps) {
  const [name, setName] = useState('');
  const [ticketPrefix, setTicketPrefix] = useState('');
  const [error, setError] = useState('');
  const createTeam = useCreateTeam();
  const setCurrentTeam = useTeamStore((s) => s.setCurrentTeam);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    createTeam.mutate(
      { name, ticketPrefix: ticketPrefix || undefined },
      {
        onSuccess: (team) => {
          setCurrentTeam(team.id, team.name);
          setName('');
          setTicketPrefix('');
          setError('');
          onOpenChange(false);
        },
        onError: (err) => {
          if (axios.isAxiosError(err) && err.response?.data?.error) {
            setError(err.response.data.error);
          } else {
            setError('チーム作成に失敗しました。');
          }
        },
      }
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-popover border border-border rounded-[var(--radius-lg)] z-50 w-full max-w-sm p-6">
          <Dialog.Title className="text-lg font-semibold text-foreground mb-4">
            チーム作成
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-1">
                チーム名 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-muted/40 border border-border text-foreground/90 rounded-[var(--radius-md)] px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30"
                placeholder="Development Team"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-1">
                チケットプレフィックス
              </label>
              <input
                type="text"
                value={ticketPrefix}
                onChange={(e) => setTicketPrefix(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-32 bg-muted/40 border border-border text-foreground/90 rounded-[var(--radius-md)] px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30"
                placeholder="SCR"
              />
              <p className="mt-1 text-xs text-muted-foreground/50">例: SCR-001 のプレフィックス部分</p>
            </div>

            {error && (
              <div className="rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

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
                disabled={createTeam.isPending || !name}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-[var(--radius-md)] hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
              >
                {createTeam.isPending ? '作成中...' : '作成'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
