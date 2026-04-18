import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Ticket, Target, Flag } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { SearchResultItem } from '../types';
import { useTeamSettings } from '@/features/users/hooks/useUsers';

function typeIcon(type: SearchResultItem['type']) {
  if (type === 'ticket') return <Ticket className="h-3.5 w-3.5 text-blue-400" />;
  if (type === 'longTermGoal') return <Target className="h-3.5 w-3.5 text-violet-400" />;
  return <Flag className="h-3.5 w-3.5 text-emerald-400" />;
}

function itemUrl(item: SearchResultItem): string {
  if (item.type === 'ticket') return `/tickets/${item.id}`;
  if (item.type === 'longTermGoal') {
    const incrementId = item.meta?.incrementId as string | undefined;
    return incrementId ? `/goals/${incrementId}` : '/goals';
  }
  const sprintId = item.meta?.sprintId as string | undefined;
  return sprintId ? `/sprints/${sprintId}` : '/sprints';
}

export default function GlobalSearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { data: teamSettings } = useTeamSettings();
  const ticketPrefix = teamSettings?.ticketPrefix || 'SCR';
  const { data, isFetching } = useSearch(query);

  const allResults: SearchResultItem[] = data
    ? [...data.tickets, ...data.longTermGoals, ...data.sprintGoals]
    : [];

  const openAndFocus = useCallback(() => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        open ? close() : openAndFocus();
      }
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, close, openAndFocus]);

  const handleSelect = (item: SearchResultItem) => {
    navigate(itemUrl(item));
    close();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      close();
    }
  };

  return (
    <>
      {/* Trigger */}
      <button
        onClick={openAndFocus}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground/70 bg-muted/60 rounded-[var(--radius-md)] border border-border w-56 hover:bg-muted hover:text-muted-foreground transition-colors cursor-pointer"
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 text-left text-xs">検索...</span>
        <kbd className="text-xs bg-muted border border-border rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60" onClick={close}>
          <div
            className="mx-4 sm:mx-auto mt-4 sm:mt-20 max-w-xl bg-popover rounded-[var(--radius-lg)] border border-border overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit}>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <Search className="h-4 w-4 text-muted-foreground/70 shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="チケット、ゴールを検索... (Enter で全結果)"
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/60"
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')} className="cursor-pointer">
                    <X className="h-4 w-4 text-muted-foreground/70 hover:text-foreground transition-colors" />
                  </button>
                )}
              </div>
            </form>

            {query.trim().length >= 1 && (
              <ul className="max-h-80 overflow-y-auto py-1">
                {isFetching && allResults.length === 0 && (
                  <li className="px-4 py-2.5 text-sm text-muted-foreground/70">検索中...</li>
                )}
                {!isFetching && allResults.length === 0 && (
                  <li className="px-4 py-2.5 text-sm text-muted-foreground/70">
                    「{query}」に一致する結果がありません
                  </li>
                )}
                {allResults.map((item) => (
                  <li key={`${item.type}-${item.id}`}>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors text-left cursor-pointer"
                      onClick={() => handleSelect(item)}
                    >
                      {typeIcon(item.type)}
                      <span className="flex-1 truncate text-foreground/80">{item.title}</span>
                      {item.type === 'ticket' && item.meta?.ticketNumber != null && (
                        <span className="text-xs text-muted-foreground/60 font-mono">
                          {ticketPrefix}-{String(item.meta.ticketNumber).padStart(3, '0')}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t border-border px-4 py-2 flex gap-4 text-xs text-muted-foreground/50">
              <span>↵ 全結果へ</span>
              <span>ESC 閉じる</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
