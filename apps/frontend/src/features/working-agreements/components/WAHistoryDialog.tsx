import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWARuleHistory } from '../hooks/useWorkingAgreements';
import { Clock, Plus, Edit3, ToggleLeft, ToggleRight } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  ruleId: string | null;
  ruleTitle: string;
}

function changeTypeIcon(type: string) {
  switch (type) {
    case 'CREATED': return <Plus className="h-3.5 w-3.5 text-emerald-400" />;
    case 'UPDATED': return <Edit3 className="h-3.5 w-3.5 text-blue-400" />;
    case 'ACTIVATED': return <ToggleRight className="h-3.5 w-3.5 text-emerald-400" />;
    case 'DEACTIVATED': return <ToggleLeft className="h-3.5 w-3.5 text-amber-400" />;
    default: return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

function changeTypeLabel(type: string) {
  switch (type) {
    case 'CREATED': return '作成';
    case 'UPDATED': return '更新';
    case 'ACTIVATED': return '有効化';
    case 'DEACTIVATED': return '無効化';
    default: return type;
  }
}

function fieldLabel(field: string | null) {
  switch (field) {
    case 'title': return 'タイトル';
    case 'description': return '説明';
    case 'agreedAt': return '合意日';
    case 'isActive': return '有効/無効';
    default: return field;
  }
}

export default function WAHistoryDialog({ open, onClose, ruleId, ruleTitle }: Props) {
  const { data: history = [], isLoading } = useWARuleHistory(open ? ruleId : null);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[70vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base">変更履歴</DialogTitle>
          <p className="text-sm text-muted-foreground truncate">{ruleTitle}</p>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto mt-2">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse h-12 bg-muted rounded" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              変更履歴がありません
            </p>
          ) : (
            <div className="space-y-1">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] bg-muted/20 border border-border"
                >
                  <div className="mt-0.5 shrink-0">{changeTypeIcon(h.changeType)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">
                        {changeTypeLabel(h.changeType)}
                      </span>
                      {h.fieldName && (
                        <span className="text-xs text-muted-foreground">
                          ({fieldLabel(h.fieldName)})
                        </span>
                      )}
                    </div>
                    {h.changeType === 'UPDATED' && h.oldValue !== null && h.newValue !== null && (
                      <div className="mt-1 text-xs space-y-0.5">
                        <div className="text-red-400/80 line-through truncate">
                          {h.oldValue || '(空)'}
                        </div>
                        <div className="text-emerald-400/80 truncate">
                          {h.newValue || '(空)'}
                        </div>
                      </div>
                    )}
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{h.changedByName}</span>
                      <span>·</span>
                      <span>
                        {new Date(h.changedAt).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
