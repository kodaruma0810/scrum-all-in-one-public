import { useState, useEffect } from 'react';
import { TerminologyEntry, DEFAULT_TERMINOLOGY } from '../types';
import { useTerminology, useUpdateTerminology } from '../hooks/useUsers';

interface TermDef {
  key: string;
  label: string;
  hint: string;
}

const TERM_SECTIONS: { title: string; terms: TermDef[] }[] = [
  {
    title: '計画・管理',
    terms: [
      { key: 'increment', label: 'PI（Program Increment）', hint: '例: PI, インクリメント, リリース' },
      { key: 'sprint', label: 'スプリント', hint: '例: スプリント, イテレーション, サイクル' },
      { key: 'planning', label: 'プランニング', hint: '例: プランニング, 計画会, スプリント計画' },
      { key: 'backlog', label: 'バックログ', hint: '例: バックログ, プロダクトバックログ, PBL' },
    ],
  },
  {
    title: 'ゴール・見積もり',
    terms: [
      { key: 'longTermGoal', label: 'PIゴール', hint: '例: PIゴール, 長期ゴール, OKR' },
      { key: 'sprintGoal', label: 'ITゴール', hint: '例: ITゴール, スプリントゴール' },
      { key: 'ticket', label: 'チケット', hint: '例: チケット, PBI, アイテム, タスク' },
      { key: 'storyPoints', label: 'ストーリーポイント', hint: '例: SP, ポイント, 見積もり' },
      { key: 'velocity', label: 'ベロシティ', hint: '例: ベロシティ, チーム速度' },
    ],
  },
  {
    title: '振り返り・日次',
    terms: [
      { key: 'dailyScrum', label: 'デイリースクラム', hint: '例: デイリー, 朝会, スタンドアップ' },
      { key: 'retrospective', label: 'レトロスペクティブ', hint: '例: レトロ, ふりかえり, KPT' },
      { key: 'workingAgreement', label: 'ワーキングアグリーメント', hint: '例: WA, チームルール, 約束事' },
    ],
  },
];

export default function TerminologySettings() {
  const { data, isLoading } = useTerminology();
  const update = useUpdateTerminology();
  const [entries, setEntries] = useState<TerminologyEntry[]>(DEFAULT_TERMINOLOGY);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data && data.length > 0) {
      // API から取得したデータにデフォルトのキーがない場合はデフォルト値で補完
      const map = new Map(data.map((e) => [e.key, e.value]));
      setEntries(DEFAULT_TERMINOLOGY.map((d) => ({ key: d.key, value: map.get(d.key) ?? d.value })));
    }
  }, [data]);

  function handleChange(key: string, value: string) {
    setEntries((prev) => prev.map((e) => (e.key === key ? { ...e, value } : e)));
    setSaved(false);
  }

  function handleSave() {
    update.mutate(entries, {
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      },
    });
  }

  if (isLoading) {
    return <div className="animate-pulse h-40 bg-muted rounded-[var(--radius-md)]" />;
  }

  const entryMap = new Map(entries.map((e) => [e.key, e.value]));

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        各用語の表示名をカスタマイズできます。変更はUI全体に反映されます。
      </p>

      {TERM_SECTIONS.map((section) => (
        <div key={section.title}>
          <p className="text-xs font-medium text-muted-foreground/50 uppercase tracking-widest mb-3">
            {section.title}
          </p>
          <div className="space-y-3">
            {section.terms.map(({ key, label, hint }) => (
              <div key={key} className="grid grid-cols-[1fr_1fr] gap-4 items-start">
                <div>
                  <label className="text-sm font-medium text-muted-foreground/70">{label}</label>
                  <p className="text-[11px] text-muted-foreground/40 mt-0.5">{hint}</p>
                </div>
                <input
                  type="text"
                  value={entryMap.get(key) ?? ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="block w-full rounded-[var(--radius-sm)] border border-border bg-muted/40 px-3 py-1.5 text-sm text-foreground/90 focus:outline-none focus:border-primary/30"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={update.isPending}
          className="inline-flex items-center rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
        >
          {update.isPending ? '保存中...' : '保存'}
        </button>
        {saved && <span className="text-sm text-emerald-400">保存しました</span>}
      </div>
    </div>
  );
}
