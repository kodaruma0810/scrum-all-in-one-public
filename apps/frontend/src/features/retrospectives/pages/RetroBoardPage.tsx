import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, ThumbsUp, Trash2, Edit3, Check, X, CheckCircle2, Circle } from 'lucide-react';
import {
  useRetro,
  useAddRetroItem,
  useUpdateRetroItem,
  useDeleteRetroItem,
  useToggleRetroVote,
  useAddRetroAction,
  useUpdateRetroAction,
  useDeleteRetroAction,
} from '../hooks/useRetrospectives';
import { useTeamMembers } from '@/features/teams/hooks/useTeams';
import { useTeamStore } from '@/lib/teamStore';
import type { RetroItem, RetroAction } from '../types';
import { cn } from '@/lib/utils';
import { getFormatDef } from '../retroFormats';

export default function RetroBoardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: retro, isLoading } = useRetro(id ?? null);
  const currentTeamId = useTeamStore((s) => s.currentTeamId);
  const { data: members = [] } = useTeamMembers(currentTeamId);

  const addItem = useAddRetroItem();
  const updateItem = useUpdateRetroItem();
  const deleteItem = useDeleteRetroItem();
  const toggleVote = useToggleRetroVote();
  const addAction = useAddRetroAction();
  const updateAction = useUpdateRetroAction();
  const deleteAction = useDeleteRetroAction();

  // Format
  const formatDef = retro ? getFormatDef(retro.format) : null;

  // Per-column new item input
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});

  // Edit state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Action input
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState('');

  function handleAddItem(type: string) {
    const body = newItemText[type].trim();
    if (!body || !id) return;
    addItem.mutate(
      { retroId: id, type, body },
      { onSuccess: () => setNewItemText((prev) => ({ ...prev, [type]: '' })) }
    );
  }

  function handleSaveEdit(itemId: string) {
    const body = editingText.trim();
    if (!body) return;
    updateItem.mutate({ id: itemId, body }, { onSuccess: () => setEditingItemId(null) });
  }

  function handleAddAction(e: React.FormEvent) {
    e.preventDefault();
    if (!newActionTitle.trim() || !id) return;
    addAction.mutate(
      { retroId: id, title: newActionTitle.trim(), assigneeId: newActionAssignee || null },
      {
        onSuccess: () => {
          setNewActionTitle('');
          setNewActionAssignee('');
        },
      }
    );
  }

  if (isLoading || !retro) {
    return (
      <div className="p-6 max-w-7xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-64" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-64 bg-muted rounded-[var(--radius-md)]" />
          <div className="h-64 bg-muted rounded-[var(--radius-md)]" />
          <div className="h-64 bg-muted rounded-[var(--radius-md)]" />
        </div>
      </div>
    );
  }

  const columns = formatDef!.zones;
  const itemsByType = (type: string) =>
    retro.items
      .filter((i) => i.type === type)
      .sort((a, b) => b.voteCount - a.voteCount || a.orderIndex - b.orderIndex);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/retrospectives')}
          className="p-1.5 text-muted-foreground hover:text-foreground rounded-[var(--radius-sm)] cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">{retro.title}</h1>
          {(retro.incrementName || retro.sprintName) && (
            <p className="text-xs text-muted-foreground">
              {[retro.incrementName, retro.sprintName].filter(Boolean).join(' / ')}
            </p>
          )}
        </div>
      </div>

      {/* Columns */}
      <div className={cn('grid grid-cols-1 gap-4', columns.length <= 3 ? 'md:grid-cols-3' : 'md:grid-cols-4')}>
        {columns.map((col) => {
          const items = itemsByType(col.type);
          return (
            <div key={col.type} className="flex flex-col">
              {/* Column header */}
              <div className={cn('flex items-center justify-between px-3 py-2 rounded-t-[var(--radius-md)] border-b-2 bg-card', `border-current`)}>
                <h2 className={cn('text-sm font-bold', col.badgeText)}>{col.emoji} {col.label}</h2>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>

              {/* Cards */}
              <div className="flex-1 space-y-2 p-2 bg-muted/20 rounded-b-[var(--radius-md)] min-h-[200px]">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'rounded-[var(--radius-sm)] border p-3 shadow-sm transition-shadow hover:shadow-md',
                      col.badgeBg
                    )}
                  >
                    {editingItemId === item.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="block w-full rounded-[var(--radius-sm)] border border-border bg-background px-2 py-1.5 text-sm text-foreground/90 focus:outline-none focus:border-primary/30 resize-none"
                          rows={2}
                          autoFocus
                        />
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="p-1 text-primary hover:text-primary/80 cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">{item.body}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground/50">{item.authorName}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleVote.mutate(item.id)}
                              disabled={toggleVote.isPending}
                              className={cn(
                                'inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded-full transition-colors cursor-pointer',
                                item.votedByMe
                                  ? 'bg-primary/15 text-primary'
                                  : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                              )}
                            >
                              <ThumbsUp className="h-3 w-3" />
                              {item.voteCount > 0 && <span>{item.voteCount}</span>}
                            </button>
                            <button
                              onClick={() => {
                                setEditingItemId(item.id);
                                setEditingText(item.body);
                              }}
                              className="p-1 text-muted-foreground/50 hover:text-foreground cursor-pointer"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => deleteItem.mutate(item.id)}
                              className="p-1 text-muted-foreground/50 hover:text-red-400 cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Add input */}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newItemText[col.type] ?? ''}
                    onChange={(e) => setNewItemText((prev) => ({ ...prev, [col.type]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                        e.preventDefault();
                        handleAddItem(col.type);
                      }
                    }}
                    placeholder="追加..."
                    className="flex-1 rounded-[var(--radius-sm)] border border-border/50 bg-background/60 px-2.5 py-1.5 text-sm text-foreground/90 placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30"
                  />
                  <button
                    onClick={() => handleAddItem(col.type)}
                    disabled={!(newItemText[col.type] ?? '').trim() || addItem.isPending}
                    className="p-1.5 text-muted-foreground hover:text-primary disabled:opacity-30 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Items */}
      <div className="rounded-[var(--radius-md)] border border-border bg-card">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h2 className="text-sm font-bold text-foreground">
            アクションアイテム
            {retro.actions.length > 0 && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                ({retro.actions.filter((a) => a.status === 'DONE').length}/{retro.actions.length} 完了)
              </span>
            )}
          </h2>
        </div>
        <div className="p-4 space-y-2">
          {retro.actions.map((action) => (
            <div key={action.id} className="flex items-center gap-3 group">
              <button
                onClick={() =>
                  updateAction.mutate({
                    id: action.id,
                    status: action.status === 'DONE' ? 'OPEN' : 'DONE',
                  })
                }
                className="cursor-pointer shrink-0"
              >
                {action.status === 'DONE' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground hover:text-emerald-400" />
                )}
              </button>
              <span
                className={cn(
                  'flex-1 text-sm',
                  action.status === 'DONE' ? 'line-through text-muted-foreground' : 'text-foreground'
                )}
              >
                {action.title}
              </span>
              {action.assigneeName && (
                <span className="text-xs text-muted-foreground/60 shrink-0">{action.assigneeName}</span>
              )}
              <button
                onClick={() => deleteAction.mutate(action.id)}
                className="p-1 text-muted-foreground/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* Add action form */}
          <form onSubmit={handleAddAction} className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
            <input
              type="text"
              value={newActionTitle}
              onChange={(e) => setNewActionTitle(e.target.value)}
              placeholder="新しいアクションアイテム..."
              className="flex-1 rounded-[var(--radius-sm)] border border-border/50 bg-muted/30 px-2.5 py-1.5 text-sm text-foreground/90 placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30"
            />
            <div className="flex items-center gap-2">
              <select
                value={newActionAssignee}
                onChange={(e) => setNewActionAssignee(e.target.value)}
                className="flex-1 sm:flex-none sm:w-32 rounded-[var(--radius-sm)] border border-border/50 bg-muted/30 px-2 py-1.5 text-xs text-foreground/90 focus:outline-none focus:border-primary/30"
              >
                <option value="">担当なし</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>{m.userName}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={!newActionTitle.trim() || addAction.isPending}
                className="p-1.5 text-muted-foreground hover:text-primary disabled:opacity-30 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
