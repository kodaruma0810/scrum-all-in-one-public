import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, FileText } from 'lucide-react';
import type { DashboardWARule } from '../types';

interface Props {
  rules: DashboardWARule[];
}

export default function WAWidget({ rules }: Props) {
  const navigate = useNavigate();

  // カテゴリ別にグループ化
  const grouped = new Map<string, DashboardWARule[]>();
  for (const r of rules) {
    const cat = r.categoryName ?? '未分類';
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(r);
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-border/60 bg-card px-6 py-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground/50 uppercase tracking-widest">
          ワーキングアグリーメント
        </p>
        <button
          onClick={() => navigate('/working-agreements')}
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
        >
          管理画面
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="flex items-center gap-3 py-4 text-muted-foreground/50">
          <FileText className="h-5 w-5" />
          <p className="text-sm">有効なルールがありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Array.from(grouped.entries()).map(([cat, items]) => (
            <div key={cat}>
              <p className="text-[11px] font-medium text-muted-foreground/40 mb-1">{cat}</p>
              <div className="space-y-1">
                {items.map((r) => (
                  <div key={r.id} className="flex items-start gap-2 py-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400/60 mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground/80">{r.title}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
