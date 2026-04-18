import { useNavigate } from 'react-router-dom';
import { Circle, ArrowRight, MessageSquare } from 'lucide-react';
import type { DashboardActionItem } from '../types';

interface Props {
  items: DashboardActionItem[];
}

export default function ActionItemsWidget({ items }: Props) {
  const navigate = useNavigate();

  return (
    <div className="rounded-[var(--radius-lg)] border border-border/60 bg-card px-6 py-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground/50 uppercase tracking-widest">
          振り返りアクションアイテム
        </p>
        {items.length > 0 && (
          <button
            onClick={() => navigate('/retrospectives')}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
          >
            レトロ一覧
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex items-center gap-3 py-4 text-muted-foreground/50">
          <MessageSquare className="h-5 w-5" />
          <p className="text-sm">未完了のアクションアイテムはありません</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 py-1.5 group cursor-pointer hover:bg-muted/30 -mx-2 px-2 rounded-[var(--radius-sm)] transition-colors"
              onClick={() => navigate(`/retrospectives/${item.retroId}`)}
            >
              <Circle className="h-4 w-4 text-amber-400/60 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground/90 truncate">{item.title}</p>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground/50">
                  <span>{item.retroTitle}</span>
                  {item.assigneeName && (
                    <>
                      <span>•</span>
                      <span>{item.assigneeName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
