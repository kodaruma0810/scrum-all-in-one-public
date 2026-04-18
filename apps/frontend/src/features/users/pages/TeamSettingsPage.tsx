import { useState, useEffect } from 'react';
import { useTeamSettings, useUpdateTeamSettings } from '../hooks/useUsers';
import TerminologySettings from '../components/TerminologySettings';

export default function TeamSettingsPage() {
  const { data: team, isLoading } = useTeamSettings();
  const updateTeam = useUpdateTeamSettings();

  const [form, setForm] = useState({ name: '', ticketPrefix: '', velocityMode: 'STORY_POINTS' as 'STORY_POINTS' | 'TICKET_COUNT', spDaysRatio: 1 });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (team) setForm({ name: team.name, ticketPrefix: team.ticketPrefix, velocityMode: team.velocityMode, spDaysRatio: team.spDaysRatio ?? 1 });
  }, [team]);

  function handleSaveTeam(e: React.FormEvent) {
    e.preventDefault();
    updateTeam.mutate(form, {
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      },
    });
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-48 bg-muted rounded-[var(--radius-md)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground">チーム設定</h1>
        <p className="mt-1 text-sm text-muted-foreground">チームの基本情報と用語をカスタマイズします。</p>
      </div>

      {/* チーム基本情報 */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground/90 border-b border-border pb-2">基本情報</h2>
        <form onSubmit={handleSaveTeam} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground/70 mb-1">チーム名</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="block w-full rounded-[var(--radius-sm)] border border-border bg-muted/40 px-3 py-2 text-sm text-foreground/90 focus:outline-none focus:border-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground/70 mb-1">チケットプレフィックス</label>
            <input
              type="text"
              value={form.ticketPrefix}
              onChange={(e) => setForm((f) => ({ ...f, ticketPrefix: e.target.value.toUpperCase() }))}
              maxLength={6}
              className="block w-32 rounded-[var(--radius-sm)] border border-border bg-muted/40 px-3 py-2 text-sm text-foreground/90 placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30"
              placeholder="SCR"
            />
            <p className="mt-1 text-xs text-muted-foreground/60">例: SCR-001 のプレフィックス部分</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground/70 mb-1">ベロシティ計測方法</label>
            <div className="flex gap-4">
              {(['STORY_POINTS', 'TICKET_COUNT'] as const).map((mode) => (
                <label key={mode} className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="velocityMode"
                    value={mode}
                    checked={form.velocityMode === mode}
                    onChange={() => setForm((f) => ({ ...f, velocityMode: mode }))}
                    className="cursor-pointer"
                  />
                  <span className="text-sm text-foreground/90">
                    {mode === 'STORY_POINTS' ? 'ストーリーポイント' : 'チケット数'}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground/70 mb-1">1SPあたりの日数</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0.1}
                max={99}
                step={0.1}
                value={form.spDaysRatio}
                onChange={(e) => setForm((f) => ({ ...f, spDaysRatio: parseFloat(e.target.value) || 1 }))}
                className="block w-24 rounded-[var(--radius-sm)] border border-border bg-muted/40 px-3 py-2 text-sm text-foreground/90 focus:outline-none focus:border-primary/30 tabular-nums"
              />
              <span className="text-sm text-muted-foreground/60">日</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground/60">キャパシティ計算に使用されます（例: 1SP = 0.5日）</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={updateTeam.isPending}
              className="inline-flex items-center rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
            >
              {updateTeam.isPending ? '保存中...' : '保存'}
            </button>
            {saved && <span className="text-sm text-emerald-400">保存しました</span>}
          </div>
        </form>
      </section>

      {/* 用語カスタマイズ */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground/90 border-b border-border pb-2">用語カスタマイズ</h2>
        <TerminologySettings />
      </section>
    </div>
  );
}
