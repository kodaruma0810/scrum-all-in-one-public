import { useSearchParams, Link } from 'react-router-dom';
import { Ticket, Target, Flag, SearchX } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { SearchResultItem } from '../types';
import { useTerms } from '@/hooks/useTerms';
import { useTeamSettings } from '@/features/users/hooks/useUsers';

function typeLabel(type: SearchResultItem['type'], t: ReturnType<typeof useTerms>) {
  if (type === 'ticket') return 'チケット';
  if (type === 'longTermGoal') return t('longTermGoal');
  return t('sprintGoal');
}

function typeIcon(type: SearchResultItem['type']) {
  if (type === 'ticket') return <Ticket className="h-4 w-4 text-blue-500" />;
  if (type === 'longTermGoal') return <Target className="h-4 w-4 text-purple-500" />;
  return <Flag className="h-4 w-4 text-green-500" />;
}

function itemUrl(item: SearchResultItem): string {
  if (item.type === 'ticket') return `/tickets/${item.id}`;
  if (item.type === 'longTermGoal') {
    const incrementId = item.meta?.incrementId as string | undefined;
    return incrementId ? `/pi/${incrementId}` : '/pi';
  }
  return '/sprint';
}

function ResultSection({
  label,
  items,
  ticketPrefix,
}: {
  label: string;
  items: SearchResultItem[];
  ticketPrefix: string;
}) {
  if (items.length === 0) return null;
  return (
    <section className="mb-6">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        {label} ({items.length})
      </h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              to={itemUrl(item)}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
            >
              <span className="mt-0.5 shrink-0">{typeIcon(item.type)}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{item.title}</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {item.description}
                  </p>
                )}
                {item.type === 'ticket' && item.meta?.status != null && (
                  <span className="mt-1 inline-block text-xs bg-muted rounded px-1.5 py-0.5">
                    {String(item.meta.status)}
                  </span>
                )}
              </div>
              {item.type === 'ticket' && item.meta?.ticketNumber != null && (
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                  {ticketPrefix}-{String(item.meta.ticketNumber).padStart(3, '0')}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function SearchResultPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const t = useTerms();
  const { data: teamSettings } = useTeamSettings();
  const ticketPrefix = teamSettings?.ticketPrefix || 'SCR';
  const { data, isLoading } = useSearch(q);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-1">検索結果</h1>
      {q && (
        <p className="text-sm text-muted-foreground mb-6">
          「<span className="font-medium text-foreground">{q}</span>」
          {data && ` — ${data.total} 件`}
        </p>
      )}

      {!q && (
        <p className="text-muted-foreground text-sm">キーワードを入力してください（Ctrl+K）</p>
      )}

      {isLoading && (
        <p className="text-muted-foreground text-sm">検索中...</p>
      )}

      {data && data.total === 0 && q && (
        <div className="flex flex-col items-center gap-2 mt-16 text-muted-foreground">
          <SearchX className="h-10 w-10" />
          <p className="text-sm">「{q}」に一致する結果がありません</p>
        </div>
      )}

      {data && (
        <>
          <ResultSection label={typeLabel('ticket', t)} items={data.tickets} ticketPrefix={ticketPrefix} />
          <ResultSection label={typeLabel('longTermGoal', t)} items={data.longTermGoals} ticketPrefix={ticketPrefix} />
          <ResultSection label={typeLabel('sprintGoal', t)} items={data.sprintGoals} ticketPrefix={ticketPrefix} />
        </>
      )}
    </div>
  );
}
