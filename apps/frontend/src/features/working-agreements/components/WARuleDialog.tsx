import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTeamMembers } from '@/features/teams/hooks/useTeams';
import { useTeamStore } from '@/lib/teamStore';
import { useAuthStore } from '@/lib/auth';
import type { WACategory } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    agreedAt: string;
    proposedById: string;
    categoryId?: string | null;
  }) => void;
  isPending: boolean;
  categories: WACategory[];
  defaultCategoryId?: string | null;
  initial?: {
    title: string;
    description: string | null;
    agreedAt: string;
    proposedById: string;
    categoryId: string | null;
  };
}

export default function WARuleDialog({ open, onClose, onSubmit, isPending, categories, defaultCategoryId, initial }: Props) {
  const currentTeamId = useTeamStore((s) => s.currentTeamId);
  const currentUser = useAuthStore((s) => s.user);
  const { data: members = [] } = useTeamMembers(currentTeamId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [agreedAt, setAgreedAt] = useState('');
  const [proposedById, setProposedById] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');

  useEffect(() => {
    if (open) {
      if (initial) {
        setTitle(initial.title);
        setDescription(initial.description ?? '');
        setAgreedAt(initial.agreedAt.split('T')[0]);
        setProposedById(initial.proposedById);
        setCategoryId(initial.categoryId ?? '');
      } else {
        setTitle('');
        setDescription('');
        setAgreedAt(new Date().toISOString().split('T')[0]);
        setProposedById(currentUser?.id ?? '');
        setCategoryId(defaultCategoryId ?? '');
      }
    }
  }, [open, initial, currentUser, defaultCategoryId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !agreedAt || !proposedById) return;
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      agreedAt,
      proposedById,
      categoryId: categoryId || null,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? 'ルールを編集' : 'ルールを追加'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-muted-foreground/70 mb-1">
              ルールタイトル <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: コードレビューは24時間以内に行う"
              className="block w-full rounded-[var(--radius-sm)] border border-border bg-muted/40 px-3 py-2 text-sm text-foreground/90 focus:outline-none focus:border-primary/30"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground/70 mb-1">
              詳細説明
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="ルールの背景や詳細を記述..."
              className="block w-full rounded-[var(--radius-sm)] border border-border bg-muted/40 px-3 py-2 text-sm text-foreground/90 focus:outline-none focus:border-primary/30 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground/70 mb-1">
              カテゴリ
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="block w-full rounded-[var(--radius-sm)] border border-border bg-muted/40 px-3 py-2 text-sm text-foreground/90 focus:outline-none focus:border-primary/30"
            >
              <option value="">未分類</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground/70 mb-1">
                合意日 <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={agreedAt}
                onChange={(e) => setAgreedAt(e.target.value)}
                className="block w-full rounded-[var(--radius-sm)] border border-border bg-muted/40 px-3 py-2 text-sm text-foreground/90 focus:outline-none focus:border-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground/70 mb-1">
                提案者 <span className="text-red-400">*</span>
              </label>
              <select
                value={proposedById}
                onChange={(e) => setProposedById(e.target.value)}
                className="block w-full rounded-[var(--radius-sm)] border border-border bg-muted/40 px-3 py-2 text-sm text-foreground/90 focus:outline-none focus:border-primary/30"
              >
                <option value="">選択してください</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.userName}
                  </option>
                ))}
              </select>
            </div>
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
              disabled={isPending || !title.trim() || !agreedAt || !proposedById}
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
