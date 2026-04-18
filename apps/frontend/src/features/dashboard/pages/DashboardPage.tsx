import { useState, useEffect } from 'react';
import { Settings, X } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { useTerms } from '@/hooks/useTerms';
import SprintSummaryWidget from '../components/SprintSummaryWidget';
import GoalProgressWidget from '../components/GoalProgressWidget';
import MyTicketsWidget from '../components/MyTicketsWidget';
import ActionItemsWidget from '../components/ActionItemsWidget';
import VelocityMiniChart from '../components/VelocityMiniChart';
import WAWidget from '../components/WAWidget';
import { cn } from '@/lib/utils';

// ウィジェット定義
interface WidgetDef {
  id: string;
  label: string;
  description: string;
}

const ALL_WIDGETS: WidgetDef[] = [
  { id: 'sprint',    label: 'スプリント進捗',         description: 'アクティブスプリントの進行状況' },
  { id: 'wa',        label: 'ワーキングアグリーメント', description: '有効なチームルール一覧' },
  { id: 'actions',   label: 'アクションアイテム',      description: 'レトロの未完了アクション' },
  { id: 'goals',     label: 'ゴール進捗',             description: '長期ゴールの達成状況' },
  { id: 'tickets',   label: 'マイチケット',            description: '自分に割り当てられたチケット' },
  { id: 'velocity',  label: 'ベロシティ',              description: 'スプリントごとのベロシティ推移' },
];

const DEFAULT_WIDGETS = ['sprint', 'wa', 'actions'];
const STORAGE_KEY = 'dashboard-widgets';

function loadWidgets(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_WIDGETS;
}

function saveWidgets(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export default function DashboardPage() {
  const t = useTerms();
  const { data, isLoading, isError } = useDashboard();
  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(loadWidgets);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    saveWidgets(visibleWidgets);
  }, [visibleWidgets]);

  function toggleWidget(id: string) {
    setVisibleWidgets((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  }

  function isVisible(id: string) {
    return visibleWidgets.includes(id);
  }

  if (isLoading) {
    return (
      <div className="px-4 py-6 md:p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-40" />
          <div className="h-44 bg-muted rounded-[var(--radius-lg)]" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-48 bg-muted rounded-[var(--radius-lg)]" />
            <div className="h-48 bg-muted rounded-[var(--radius-lg)]" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="px-4 py-6 md:p-8">
        <p className="text-red-400 text-sm">データの取得に失敗しました。</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:p-8 max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t('sprint')}とチームの状況を確認</p>
        </div>
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-[var(--radius-md)] cursor-pointer transition-colors',
            settingsOpen
              ? 'border-primary text-primary bg-primary/5'
              : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/40'
          )}
        >
          <Settings className="h-3.5 w-3.5" />
          ウィジェット設定
        </button>
      </div>

      {/* Settings panel */}
      {settingsOpen && (
        <div className="rounded-[var(--radius-lg)] border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-foreground">表示するウィジェットを選択</p>
            <button
              onClick={() => setSettingsOpen(false)}
              className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALL_WIDGETS.map((w) => (
              <button
                key={w.id}
                onClick={() => toggleWidget(w.id)}
                className={cn(
                  'flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-[var(--radius-md)] border-2 cursor-pointer transition-colors text-left',
                  isVisible(w.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/30 opacity-50'
                )}
              >
                <span className={cn('text-xs font-medium', isVisible(w.id) ? 'text-primary' : 'text-muted-foreground')}>
                  {w.label}
                </span>
                <span className="text-[10px] text-muted-foreground/60">{w.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Widgets */}
      {isVisible('sprint') && <SprintSummaryWidget sprint={data.activeSprint} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isVisible('wa') && <WAWidget rules={data.waRules} />}
        {isVisible('actions') && <ActionItemsWidget items={data.actionItems} />}
      </div>

      {isVisible('goals') && isVisible('tickets') ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GoalProgressWidget goals={data.longTermGoals} />
          <MyTicketsWidget tickets={data.myTickets} />
        </div>
      ) : (
        <>
          {isVisible('goals') && <GoalProgressWidget goals={data.longTermGoals} />}
          {isVisible('tickets') && <MyTicketsWidget tickets={data.myTickets} />}
        </>
      )}

      {isVisible('velocity') && <VelocityMiniChart data={data.velocityHistory} />}

      {visibleWidgets.length === 0 && (
        <div className="text-center py-16 text-muted-foreground/50">
          <p className="text-sm">ウィジェットが選択されていません。</p>
          <p className="text-xs mt-1">「ウィジェット設定」から表示する項目を選んでください。</p>
        </div>
      )}
    </div>
  );
}
