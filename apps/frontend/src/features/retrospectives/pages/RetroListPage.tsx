import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, MessageSquare, CheckCircle2, LayoutGrid, StickyNote } from 'lucide-react';
import type { RetroMode } from '../types';
import { cn } from '@/lib/utils';
import { useRetroList, useCreateRetro, useDeleteRetro } from '../hooks/useRetrospectives';
import { RETRO_FORMATS, getFormatDef } from '../retroFormats';
import { useSprints } from '@/features/sprints/hooks/useSprints';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function RetroListPage() {
  const { data: retros = [], isLoading } = useRetroList();
  const { data: sprints = [] } = useSprints();
  const createRetro = useCreateRetro();
  const deleteRetro = useDeleteRetro();
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [sprintId, setSprintId] = useState('');
  const [mode, setMode] = useState<RetroMode>('CARD');
  const [format, setFormat] = useState('KPT');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    createRetro.mutate(
      { title: title.trim(), sprintId: sprintId || null, format, mode },
      {
        onSuccess: (data) => {
          setDialogOpen(false);
          setTitle('');
          setSprintId('');
          setFormat('KPT');
          setMode('CARD');
          navigate(`/retrospectives/${data.id}`);
        },
      }
    );
  }

  function handleDelete(id: string) {
    deleteRetro.mutate(id, { onSuccess: () => setDeletingId(null) });
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-64" />
        <div className="h-32 bg-muted rounded-[var(--radius-md)]" />
        <div className="h-32 bg-muted rounded-[var(--radius-md)]" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">レトロスペクティブ</h1>
          <p className="mt-1 text-sm text-muted-foreground">KPT法でスプリントを振り返ります。</p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-[var(--radius-md)] hover:bg-primary/90 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          新しいレトロ
        </button>
      </div>

      {retros.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">レトロスペクティブがまだありません。</p>
          <p className="text-xs mt-1">「新しいレトロ」から作成しましょう。</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {retros.map((r) => {
            const totalItems = r.itemCounts.KEEP + r.itemCounts.PROBLEM + r.itemCounts.TRY;
            const totalActions = r.actionCounts.OPEN + r.actionCounts.DONE;
            return (
              <div
                key={r.id}
                className="group rounded-[var(--radius-md)] border border-border bg-card p-4 hover:border-primary/30 transition-colors cursor-pointer relative"
                onClick={() => navigate(`/retrospectives/${r.id}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-semibold text-foreground truncate">{r.title}</h3>
                      {r.mode === 'BOARD' ? (
                        <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                          <StickyNote className="h-2.5 w-2.5" />ボード
                        </span>
                      ) : (
                        <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded bg-muted text-muted-foreground">
                          <LayoutGrid className="h-2.5 w-2.5" />カード
                        </span>
                      )}
                    </div>
                    {(r.incrementName || r.sprintName) && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {[r.incrementName, r.sprintName].filter(Boolean).join(' / ')}
                      </p>
                    )}
                  </div>
                  <div
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {deletingId === r.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded-[var(--radius-sm)] hover:bg-red-600 cursor-pointer"
                        >
                          削除
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-2 py-1 text-xs border border-border text-muted-foreground rounded-[var(--radius-sm)] hover:text-foreground cursor-pointer"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(r.id)}
                        className="p-1 text-muted-foreground hover:text-red-400 rounded-[var(--radius-sm)] cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex gap-2 flex-wrap">
                    {getFormatDef(r.format).zones.map((z) => (
                      <span key={z.type} className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded', z.badgeBg, z.badgeText)}>
                        {z.label[0]} {r.itemCounts[z.type] ?? 0}
                      </span>
                    ))}
                  </div>
                  {totalActions > 0 && (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {r.actionCounts.DONE}/{totalActions}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground/50">
                  {new Date(r.createdAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新しいレトロスペクティブ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-muted-foreground/70 mb-1">
                タイトル <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: Sprint 5 レトロ"
                className="block w-full rounded-[var(--radius-sm)] border border-border bg-muted/40 px-3 py-2 text-sm text-foreground/90 focus:outline-none focus:border-primary/30"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground/70 mb-1">
                スプリント（任意）
              </label>
              <select
                value={sprintId}
                onChange={(e) => setSprintId(e.target.value)}
                className="block w-full rounded-[var(--radius-sm)] border border-border bg-muted/40 px-3 py-2 text-sm text-foreground/90 focus:outline-none focus:border-primary/30"
              >
                <option value="">紐付けなし</option>
                {(() => {
                  const grouped = new Map<string, typeof sprints>();
                  for (const s of sprints) {
                    const piName = s.increment?.name ?? '未割当';
                    if (!grouped.has(piName)) grouped.set(piName, []);
                    grouped.get(piName)!.push(s);
                  }
                  return Array.from(grouped.entries()).map(([piName, sprs]) => (
                    <optgroup key={piName} label={piName}>
                      {sprs.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </optgroup>
                  ));
                })()}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground/70 mb-2">
                フォーマット
              </label>
              <div className="grid grid-cols-2 gap-2">
                {RETRO_FORMATS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id)}
                    className={cn(
                      'flex flex-col items-start gap-0.5 px-3 py-2 rounded-[var(--radius-md)] border-2 cursor-pointer transition-colors text-left',
                      format === f.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/30'
                    )}
                  >
                    <span className={cn('text-xs font-medium', format === f.id ? 'text-primary' : 'text-muted-foreground')}>
                      {f.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">{f.description}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground/70 mb-2">
                表示形式
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('CARD')}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-[var(--radius-md)] border-2 cursor-pointer transition-colors',
                    mode === 'CARD'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/30'
                  )}
                >
                  <LayoutGrid className={cn('h-5 w-5', mode === 'CARD' ? 'text-primary' : 'text-muted-foreground')} />
                  <span className={cn('text-xs font-medium', mode === 'CARD' ? 'text-primary' : 'text-muted-foreground')}>
                    カード
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">構造化されたリスト</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('BOARD')}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-[var(--radius-md)] border-2 cursor-pointer transition-colors',
                    mode === 'BOARD'
                      ? 'border-violet-500 bg-violet-500/5'
                      : 'border-border hover:border-muted-foreground/30'
                  )}
                >
                  <StickyNote className={cn('h-5 w-5', mode === 'BOARD' ? 'text-violet-500' : 'text-muted-foreground')} />
                  <span className={cn('text-xs font-medium', mode === 'BOARD' ? 'text-violet-500' : 'text-muted-foreground')}>
                    ボード
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">付箋で共同編集</span>
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2 text-sm border border-border text-muted-foreground rounded-[var(--radius-md)] hover:text-foreground cursor-pointer"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={createRetro.isPending || !title.trim()}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-[var(--radius-md)] hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
              >
                {createRetro.isPending ? '作成中...' : '作成'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
