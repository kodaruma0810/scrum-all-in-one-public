import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string }) => void;
  isPending: boolean;
  initial?: { name: string };
}

export default function WACategoryDialog({ open, onClose, onSubmit, isPending, initial }: Props) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (open) setName(initial?.name ?? '');
  }, [open, initial]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim() });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? 'カテゴリを編集' : 'カテゴリを追加'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-muted-foreground/70 mb-1">
              カテゴリ名
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: コードレビュー"
              className="block w-full rounded-[var(--radius-sm)] border border-border bg-muted/40 px-3 py-2 text-sm text-foreground/90 focus:outline-none focus:border-primary/30"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-border text-muted-foreground rounded-[var(--radius-md)] hover:text-foreground cursor-pointer"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isPending || !name.trim()}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-[var(--radius-md)] hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
