import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Target, Layers, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useIncrements, useCreateIncrement } from '@/features/goals/hooks/useGoals';
import { useTeamStore } from '@/lib/teamStore';
import { useTerms } from '@/hooks/useTerms';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

const inputClass =
  'w-full bg-muted/40 border border-border rounded-[var(--radius-sm)] px-3 py-2 text-sm text-foreground/90 placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30';

export default function PIListPage() {
  const navigate = useNavigate();
  const { data: increments = [], isLoading } = useIncrements();
  const createIncrement = useCreateIncrement();
  const { currentTeamId, currentTeamName } = useTeamStore();
  const t = useTerms();
  const [formOpen, setFormOpen] = useState(false);

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [sprintDurationWeeks, setSprintDurationWeeks] = useState<number | ''>('');

  const resetForm = () => { setName(''); setStartDate(''); setEndDate(''); setDescription(''); setSprintDurationWeeks(''); };

  const sprintCount = (() => {
    if (!startDate || !endDate || !sprintDurationWeeks) return 0;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    if (end <= start) return 0;
    const durationMs = Number(sprintDurationWeeks) * 7 * 24 * 60 * 60 * 1000;
    return Math.ceil((end - start) / durationMs);
  })();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeamId) return;
    createIncrement.mutate({
      name, startDate, endDate, description, teamId: currentTeamId,
      sprintDurationWeeks: sprintDurationWeeks ? Number(sprintDurationWeeks) : undefined,
    }, {
      onSuccess: () => { setFormOpen(false); resetForm(); },
    });
  };

  return (
    <div className="px-4 py-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{t('increment')}管理</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Program Increment と{t('longTermGoal')}の管理</p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-[var(--radius-md)] hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {t('increment')}作成
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground/70 text-sm">読み込み中...</div>
      ) : increments.length === 0 ? (
        <div className="text-center py-12">
          <Layers className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">{t('increment')}がありません</p>
          <p className="text-muted-foreground/60 text-xs mt-1">「{t('increment')}作成」ボタンから追加してください</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {increments.map((increment) => (
            <div
              key={increment.id}
              onClick={() => navigate(`/pi/${increment.id}`)}
              className="bg-card border border-border rounded-[var(--radius-lg)] p-5 hover:border-border/80 cursor-pointer transition-colors"
            >
              <h3 className="font-semibold text-foreground text-base mb-2">{increment.name}</h3>

              {increment.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{increment.description}</p>
              )}

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 mb-3">
                <Calendar className="h-3 w-3 shrink-0" />
                <span className="tabular-nums">
                  {formatDate(increment.startDate)} 〜 {formatDate(increment.endDate)}
                </span>
              </div>

              {increment.team && (
                <div className="text-xs text-muted-foreground/60 mb-3">チーム: {increment.team.name}</div>
              )}

              <div className="flex gap-4 text-xs text-muted-foreground/60 pt-3 border-t border-border/60 tabular-nums">
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  <span>{t('longTermGoal')} {increment._count?.longTermGoals ?? 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  <span>{t('sprint')} {increment._count?.sprints ?? 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog.Root open={formOpen} onOpenChange={(v) => { if (!v) { setFormOpen(false); resetForm(); } }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-background/80 z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-popover border border-border rounded-[var(--radius-lg)] p-4 sm:p-6 w-[calc(100%-2rem)] sm:w-full max-w-md z-50">
            <div className="flex items-center justify-between mb-5">
              <Dialog.Title className="text-base font-semibold text-foreground">{t('increment')}作成</Dialog.Title>
              <button onClick={() => { setFormOpen(false); resetForm(); }} className="text-muted-foreground/70 hover:text-foreground transition-colors cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">名称 <span className="text-red-400">*</span></label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">開始日 <span className="text-red-400">*</span></label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">終了日 <span className="text-red-400">*</span></label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">説明</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={`${inputClass} resize-none`} />
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">{t('sprint')}期間（週）</label>
                <div className="flex items-center gap-3">
                  <select
                    value={sprintDurationWeeks}
                    onChange={(e) => setSprintDurationWeeks(e.target.value ? Number(e.target.value) : '')}
                    className={`${inputClass} w-32`}
                  >
                    <option value="">作成しない</option>
                    <option value="1">1週間</option>
                    <option value="2">2週間</option>
                    <option value="3">3週間</option>
                    <option value="4">4週間</option>
                  </select>
                  {sprintCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {sprintCount}個の{t('sprint')}が作成されます
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">チーム <span className="text-red-400">*</span></label>
                {currentTeamId ? (
                  <div className="bg-muted/40 border border-border rounded-[var(--radius-sm)] px-3 py-2 text-sm text-foreground/90">
                    {currentTeamName}
                  </div>
                ) : (
                  <p className="text-xs text-red-400">チームが選択されていません。サイドバーからチームを選択してください。</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setFormOpen(false); resetForm(); }}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-[var(--radius-md)] transition-colors cursor-pointer"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={createIncrement.isPending || !currentTeamId}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-[var(--radius-md)] hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                >
                  {createIncrement.isPending ? '作成中...' : '作成'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
