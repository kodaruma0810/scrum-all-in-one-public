import { useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { ChevronRight, Send } from 'lucide-react';
import { useTerms } from '@/hooks/useTerms';
import { useTeamSettings } from '@/features/users/hooks/useUsers';
import {
  useTicket,
  useUpdateTicket,
  useChangeTicketStatus,
  useTicketComments,
  useAddComment,
} from '../hooks/useTickets';
import { TicketStatus, TicketPriority, TicketType, Ticket } from '../types';
import DodChecklist from '../components/DodChecklist';

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: 'BACKLOG',     label: 'Backlog' },
  { value: 'TODO',        label: 'To Do' },
  { value: 'IN_PROGRESS', label: '進行中' },
  { value: 'IN_REVIEW',   label: 'レビュー中' },
  { value: 'DONE',        label: '完了' },
];

const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: 'HIGHEST', label: 'Highest' },
  { value: 'HIGH',    label: 'High' },
  { value: 'MEDIUM',  label: 'Medium' },
  { value: 'LOW',     label: 'Low' },
  { value: 'LOWEST',  label: 'Lowest' },
];

const TYPE_OPTIONS: { value: TicketType; label: string }[] = [
  { value: 'USER_STORY', label: 'User Story' },
  { value: 'TASK',       label: 'Task' },
  { value: 'BUG',        label: 'Bug' },
  { value: 'SUBTASK',    label: 'Subtask' },
];

const STORY_POINTS = [1, 2, 3, 5, 8, 13, 21];

function formatTicketId(num: number, prefix: string) {
  return `${prefix}-${String(num).padStart(3, '0')}`;
}

const selectClass =
  'w-full bg-muted/40 border border-border rounded-[var(--radius-sm)] px-3 py-1.5 text-sm text-foreground/80 focus:outline-none focus:border-primary/30';

const inputClass =
  'w-full bg-muted/40 border border-border rounded-[var(--radius-sm)] px-3 py-1.5 text-sm text-foreground/80 placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30';

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const t = useTerms();
  const from: { label: string; path: string } =
    (location.state as { from?: { label: string; path: string } })?.from
    ?? { label: t('sprint'), path: '/sprint' };
  const { data: teamSettings } = useTeamSettings();
  const ticketPrefix = teamSettings?.ticketPrefix || 'SCR';
  const { data: ticket, isLoading } = useTicket(id ?? '');
  const { data: comments = [] } = useTicketComments(id ?? '');
  const updateTicket = useUpdateTicket();
  const changeStatus = useChangeTicketStatus();
  const addComment = useAddComment();

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [commentText, setCommentText] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground/70 text-sm">読み込み中...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground text-sm">チケットが見つかりません</p>
        <button
          onClick={() => navigate('/tickets')}
          className="text-sm text-muted-foreground hover:text-foreground underline transition-colors cursor-pointer"
        >
          チケット一覧に戻る
        </button>
      </div>
    );
  }

  const handleTitleEdit = () => {
    setTitleValue(ticket.title);
    setEditingTitle(true);
  };

  const handleTitleSave = () => {
    if (titleValue.trim()) {
      updateTicket.mutate({ id: ticket.id, data: { title: titleValue.trim() } });
    }
    setEditingTitle(false);
  };

  const handleFieldUpdate = (data: Partial<Ticket>) => {
    updateTicket.mutate({ id: ticket.id, data });
  };

  const handleStatusChange = (status: TicketStatus) => {
    changeStatus.mutate({ id: ticket.id, status });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment.mutate({ ticketId: ticket.id, content: commentText.trim() });
    setCommentText('');
  };

  return (
    <div className="px-4 py-6 md:p-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground/70 mb-6">
        <Link to={from.path} className="hover:text-muted-foreground transition-colors">
          {from.label}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-muted-foreground font-mono">{formatTicketId(ticket.ticketNumber, ticketPrefix)}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Title */}
          <div>
            {editingTitle ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSave();
                    if (e.key === 'Escape') setEditingTitle(false);
                  }}
                  className="flex-1 text-xl font-semibold border-b border-primary/30 outline-none bg-transparent text-foreground"
                  autoFocus
                />
                <button
                  onClick={handleTitleSave}
                  className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-[var(--radius-sm)] hover:bg-primary/90 cursor-pointer"
                >
                  保存
                </button>
                <button
                  onClick={() => setEditingTitle(false)}
                  className="px-3 py-1 border border-border text-muted-foreground hover:text-foreground text-sm rounded-[var(--radius-sm)] cursor-pointer"
                >
                  キャンセル
                </button>
              </div>
            ) : (
              <h1
                className="text-2xl font-semibold text-foreground cursor-pointer hover:text-foreground/90 transition-colors"
                onClick={handleTitleEdit}
                title="クリックして編集"
              >
                {ticket.title}
              </h1>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-2">説明</h3>
            <textarea
              defaultValue={ticket.description ?? ''}
              onBlur={(e) => {
                if (e.target.value !== (ticket.description ?? '')) {
                  handleFieldUpdate({ description: e.target.value || undefined });
                }
              }}
              className="w-full bg-muted/30 border border-border rounded-[var(--radius-md)] px-4 py-3 text-sm text-foreground/80 placeholder:text-muted-foreground/50 focus:outline-none focus:border-border/80 min-h-[100px] resize-none"
              placeholder="チケットの説明を入力..."
            />
          </div>

          {/* DoD Checklist */}
          {ticket.dodCheckResults && ticket.dodCheckResults.length > 0 && (
            <div className="border border-border rounded-[var(--radius-lg)] p-4">
              <DodChecklist ticketId={ticket.id} checkResults={ticket.dodCheckResults} />
            </div>
          )}

          {/* Comments */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-4">
              コメント <span className="text-muted-foreground/50 normal-case">({comments.length})</span>
            </h3>
            <div className="space-y-3 mb-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-card rounded-[var(--radius-md)] p-3 border border-border/60">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-accent text-muted-foreground flex items-center justify-center text-xs font-semibold">
                      {comment.author?.name?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                    <span className="text-sm font-medium text-foreground/80">
                      {comment.author?.name ?? 'Unknown'}
                    </span>
                    <span className="text-xs text-muted-foreground/60">
                      {new Date(comment.createdAt).toLocaleString('ja-JP')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-7">{comment.content}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="コメントを入力..."
                className={`flex-1 ${inputClass}`}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || addComment.isPending}
                className="px-3 py-2 bg-primary text-primary-foreground rounded-[var(--radius-sm)] hover:bg-primary/90 disabled:bg-accent disabled:text-muted-foreground/70 transition-colors cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right column */}
        <div className="w-full lg:w-60 lg:shrink-0">
          <div className="border border-border rounded-[var(--radius-lg)] p-4 space-y-4 bg-card">
            {/* Status */}
            <div>
              <label className="block text-xs text-muted-foreground/70 mb-1.5">ステータス</label>
              <select value={ticket.status} onChange={(e) => handleStatusChange(e.target.value as TicketStatus)} className={selectClass}>
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs text-muted-foreground/70 mb-1.5">優先度</label>
              <select value={ticket.priority} onChange={(e) => handleFieldUpdate({ priority: e.target.value as TicketPriority })} className={selectClass}>
                {PRIORITY_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs text-muted-foreground/70 mb-1.5">種別</label>
              <select value={ticket.type} onChange={(e) => handleFieldUpdate({ type: e.target.value as TicketType })} className={selectClass}>
                {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            {/* Story Points */}
            <div>
              <label className="block text-xs text-muted-foreground/70 mb-1.5">ストーリーポイント</label>
              <select
                value={ticket.storyPoints ?? ''}
                onChange={(e) => handleFieldUpdate({ storyPoints: e.target.value ? Number(e.target.value) : undefined })}
                className={selectClass}
              >
                <option value="">未設定</option>
                {STORY_POINTS.map((sp) => <option key={sp} value={sp}>{sp}</option>)}
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-xs text-muted-foreground/70 mb-1.5">担当者</label>
              {ticket.assignee ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-accent text-muted-foreground flex items-center justify-center text-xs font-semibold">
                    {ticket.assignee.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-muted-foreground">{ticket.assignee.name}</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground/60">未割り当て</span>
              )}
            </div>

            {ticket.sprintGoalId && (
              <div>
                <label className="block text-xs text-muted-foreground/70 mb-1.5">{t('sprintGoal')}</label>
                <span className="text-sm text-muted-foreground">{ticket.sprintGoalId}</span>
              </div>
            )}

            {ticket.reporter && (
              <div>
                <label className="block text-xs text-muted-foreground/70 mb-1.5">報告者</label>
                <span className="text-sm text-muted-foreground">{ticket.reporter.name}</span>
              </div>
            )}

            {/* Dates */}
            <div className="pt-3 border-t border-border space-y-1">
              <div>
                <span className="text-xs text-muted-foreground/50">作成日: </span>
                <span className="text-xs text-muted-foreground/60">
                  {new Date(ticket.createdAt).toLocaleDateString('ja-JP')}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground/50">更新日: </span>
                <span className="text-xs text-muted-foreground/60">
                  {new Date(ticket.updatedAt).toLocaleDateString('ja-JP')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
