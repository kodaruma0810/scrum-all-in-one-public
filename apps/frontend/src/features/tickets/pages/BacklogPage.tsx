import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useTerms } from '@/hooks/useTerms';
import { useBacklogTickets, useCreateTicket, useTickets } from '../hooks/useTickets';
import { Ticket, TicketType, TicketPriority } from '../types';
import TicketCard from '../components/TicketCard';
import TicketForm from '../components/TicketForm';
import { useSprints } from '@/features/sprints/hooks/useSprints';
import { Sprint } from '@/features/sprints/types';

const selectClass =
  'bg-muted/40 border border-border rounded-[var(--radius-sm)] px-2 py-1 text-sm text-foreground/80 focus:outline-none focus:border-primary/30';

const statusLabel: Record<string, string> = {
  PLANNED: '計画中',
  ACTIVE: '実行中',
  COMPLETED: '完了',
  ARCHIVED: 'アーカイブ',
};

const statusColor: Record<string, string> = {
  PLANNED: 'bg-muted text-muted-foreground',
  ACTIVE: 'bg-emerald-500/15 text-emerald-400',
  COMPLETED: 'bg-blue-500/15 text-blue-400',
  ARCHIVED: 'bg-muted text-muted-foreground/50',
};

// ─── Sprint accordion ──────────────────────────────────────────────

function SprintBacklogSection({
  sprint,
  tickets,
  typeFilter,
  priorityFilter,
  onTicketClick,
}: {
  sprint: Sprint;
  tickets: Ticket[];
  typeFilter: TicketType | '';
  priorityFilter: TicketPriority | '';
  onTicketClick: (id: string) => void;
}) {
  const t = useTerms();
  const [expanded, setExpanded] = useState(sprint.status === 'ACTIVE' || sprint.status === 'PLANNED');

  const filtered = tickets.filter((t) => {
    if (typeFilter && t.type !== typeFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    return true;
  });

  const totalSP = tickets.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);

  return (
    <div className="border border-border rounded-[var(--radius-md)] bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-secondary/50 transition-colors cursor-pointer"
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
        )}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground truncate">{sprint.name}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-[var(--radius-sm)] font-medium ${statusColor[sprint.status] ?? ''}`}>
            {statusLabel[sprint.status] ?? sprint.status}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground/60 tabular-nums">
            {tickets.length} 件
          </span>
          <span className="text-xs text-muted-foreground/60 tabular-nums">
            {totalSP} SP
          </span>
          <Link
            to={`/pi/${sprint.incrementId}/planning/${sprint.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            プランニング
          </Link>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-3 pt-1">
          {filtered.length === 0 ? (
            <div className="text-center text-muted-foreground/50 py-4 text-sm border border-dashed border-border rounded-[var(--radius-md)]">
              {tickets.length === 0
                ? `この${t('sprint')}にチケットはありません`
                : 'フィルター条件に一致するチケットがありません'}
            </div>
          ) : (
            <div className="space-y-2 max-w-2xl">
              {filtered.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onClick={() => onTicketClick(ticket.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PI group ───────────────────────────────────────────────────────

interface PIGroup {
  id: string;
  name: string;
  sprints: Sprint[];
}

function PIBacklogSection({
  group,
  ticketsBySprint,
  typeFilter,
  priorityFilter,
  onTicketClick,
}: {
  group: PIGroup;
  ticketsBySprint: Map<string, Ticket[]>;
  typeFilter: TicketType | '';
  priorityFilter: TicketPriority | '';
  onTicketClick: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const totalTickets = group.sprints.reduce(
    (sum, s) => sum + (ticketsBySprint.get(s.id)?.length ?? 0),
    0,
  );
  const totalSP = group.sprints.reduce(
    (sum, s) =>
      sum +
      (ticketsBySprint.get(s.id) ?? []).reduce((sp, t) => sp + (t.storyPoints ?? 0), 0),
    0,
  );

  return (
    <div className="border border-border rounded-[var(--radius-lg)] overflow-hidden">
      {/* PI header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full px-4 py-3 text-left bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer border-b border-border"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground/60 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />
        )}
        <span className="text-sm font-semibold text-foreground truncate flex-1">
          {group.name}
        </span>
        <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground/60 tabular-nums">
          <span>{group.sprints.length} IT</span>
          <span>{totalTickets} 件</span>
          <span>{totalSP} SP</span>
        </div>
      </button>

      {/* Sprint list */}
      {expanded && (
        <div className="p-3 space-y-2 bg-card/50">
          {group.sprints.map((sprint) => (
            <SprintBacklogSection
              key={sprint.id}
              sprint={sprint}
              tickets={ticketsBySprint.get(sprint.id) ?? []}
              typeFilter={typeFilter}
              priorityFilter={priorityFilter}
              onTicketClick={onTicketClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────

export default function BacklogPage() {
  const navigate = useNavigate();
  const t = useTerms();
  const { data: backlogTickets = [], isLoading: isLoadingBacklog } = useBacklogTickets();
  const { data: allTickets = [], isLoading: isLoadingAll } = useTickets();
  const { data: sprints = [], isLoading: isLoadingSprints } = useSprints();
  const createTicket = useCreateTicket();

  const [formOpen, setFormOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TicketType | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | ''>('');
  const [showSprintBacklog, setShowSprintBacklog] = useState(true);

  const handleCreate = (data: Partial<Ticket>) => {
    createTicket.mutate(data as Ticket, {
      onSuccess: () => setFormOpen(false),
    });
  };

  const filteredBacklog = backlogTickets.filter((t) => {
    if (typeFilter && t.type !== typeFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    return true;
  });

  // Group tickets by sprintId
  const ticketsBySprint = new Map<string, Ticket[]>();
  for (const ticket of allTickets) {
    if (ticket.sprintId) {
      const arr = ticketsBySprint.get(ticket.sprintId) ?? [];
      arr.push(ticket);
      ticketsBySprint.set(ticket.sprintId, arr);
    }
  }

  // Sort sprints: ACTIVE first, then PLANNED, then others
  const statusOrder: Record<string, number> = { ACTIVE: 0, PLANNED: 1, COMPLETED: 2, ARCHIVED: 3 };
  const sortedSprints = [...sprints].sort(
    (a, b) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9),
  );

  // Group sprints by PI (increment)
  const piGroupMap = new Map<string, PIGroup>();
  for (const sprint of sortedSprints) {
    const piId = sprint.incrementId;
    const piName = sprint.increment?.name ?? 'PI';
    if (!piGroupMap.has(piId)) {
      piGroupMap.set(piId, { id: piId, name: piName, sprints: [] });
    }
    piGroupMap.get(piId)!.sprints.push(sprint);
  }
  const piGroups = Array.from(piGroupMap.values());

  const isLoading = isLoadingBacklog || isLoadingAll || isLoadingSprints;

  return (
    <div className="px-4 py-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">バックログ</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{`プロダクトバックログと${t('sprint')}バックログ`}</p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-[var(--radius-md)] hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          チケット作成
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-card rounded-[var(--radius-lg)] border border-border">
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground/70 whitespace-nowrap">種別</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TicketType | '')} className={selectClass}>
            <option value="">すべて</option>
            <option value="USER_STORY">User Story</option>
            <option value="TASK">Task</option>
            <option value="BUG">Bug</option>
            <option value="SUBTASK">Subtask</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground/70 whitespace-nowrap">優先度</label>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | '')} className={selectClass}>
            <option value="">すべて</option>
            <option value="HIGHEST">Highest</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
            <option value="LOWEST">Lowest</option>
          </select>
        </div>
        {(typeFilter || priorityFilter) && (
          <button
            onClick={() => { setTypeFilter(''); setPriorityFilter(''); }}
            className="text-xs text-muted-foreground/70 hover:text-foreground transition-colors cursor-pointer"
          >
            クリア
          </button>
        )}

        {/* Sprint backlog toggle */}
        <div className="ml-auto">
          <button
            onClick={() => setShowSprintBacklog(!showSprintBacklog)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-foreground transition-colors cursor-pointer"
          >
            {showSprintBacklog ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
            {t('sprint')}バックログ
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground/70 text-sm">読み込み中...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Product Backlog */}
          <div>
            <h2 className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-3">
              プロダクトバックログ ({backlogTickets.length} 件)
            </h2>
            {filteredBacklog.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 gap-3 border border-dashed border-border rounded-[var(--radius-lg)]">
                <p className="text-muted-foreground/50 text-sm">
                  {backlogTickets.length === 0 ? '未割当のチケットはありません' : 'フィルター条件に一致するチケットがありません'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-w-2xl">
                <p className="text-xs text-muted-foreground/60 mb-3 tabular-nums">{filteredBacklog.length} チケット</p>
                {filteredBacklog.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onClick={() => navigate(`/tickets/${ticket.id}`, { state: { from: { label: 'バックログ', path: '/backlog' } } })}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sprint Backlogs grouped by PI */}
          {showSprintBacklog && piGroups.length > 0 && (
            <div>
              <h2 className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-3">
                {t('sprint')}バックログ
              </h2>
              <div className="space-y-4">
                {piGroups.map((group) => (
                  <PIBacklogSection
                    key={group.id}
                    group={group}
                    ticketsBySprint={ticketsBySprint}
                    typeFilter={typeFilter}
                    priorityFilter={priorityFilter}
                    onTicketClick={(id) => navigate(`/tickets/${id}`, { state: { from: { label: 'バックログ', path: '/backlog' } } })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <TicketForm
        onSubmit={handleCreate}
        onClose={() => setFormOpen(false)}
        open={formOpen}
      />
    </div>
  );
}
