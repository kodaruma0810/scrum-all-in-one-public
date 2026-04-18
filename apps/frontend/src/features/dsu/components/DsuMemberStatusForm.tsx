import { useState } from 'react';
import { DsuMemberStatusData, MemberDsuStatus } from '../types';
import { useUpsertMemberStatus } from '../hooks/useDsu';

interface DsuMemberStatusFormProps {
  dsuLogId: string;
  member: { id: string; name: string; avatarUrl?: string | null };
  existingStatus?: DsuMemberStatusData;
}

const STATUS_OPTIONS: { value: MemberDsuStatus; label: string; colorClass: string }[] = [
  { value: 'PRESENT', label: '出席',   colorClass: 'text-emerald-400' },
  { value: 'REMOTE',  label: 'リモート', colorClass: 'text-blue-400' },
  { value: 'ABSENT',  label: '欠席',   colorClass: 'text-red-400' },
];

const textareaClass =
  'w-full text-sm resize-none rounded-[var(--radius-sm)] border border-border bg-muted/30 px-2.5 py-1.5 text-foreground/80 placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30';

export default function DsuMemberStatusForm({
  dsuLogId,
  member,
  existingStatus,
}: DsuMemberStatusFormProps) {
  const [yesterday, setYesterday] = useState(existingStatus?.yesterday ?? '');
  const [today, setToday] = useState(existingStatus?.today ?? '');
  const [blockers, setBlockers] = useState(existingStatus?.blockers ?? '');
  const [status, setStatus] = useState<MemberDsuStatus>(existingStatus?.status ?? 'PRESENT');

  const { mutate, isPending } = useUpsertMemberStatus();

  const save = (overrides?: Partial<{ yesterday: string; today: string; blockers: string; status: MemberDsuStatus }>) => {
    mutate({
      dsuLogId,
      data: {
        userId: member.id,
        yesterday: overrides?.yesterday ?? yesterday,
        today: overrides?.today ?? today,
        blockers: overrides?.blockers ?? blockers,
        status: overrides?.status ?? status,
      },
    });
  };

  return (
    <div className={`rounded-[var(--radius-lg)] border p-3 transition-opacity ${isPending ? 'opacity-60' : ''} ${status === 'ABSENT' ? 'border-red-500/20 bg-red-500/[0.04]' : 'border-border bg-card'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {member.avatarUrl ? (
            <img src={member.avatarUrl} alt={member.name} className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs font-medium text-muted-foreground">
              {member.name.charAt(0)}
            </div>
          )}
          <span className="text-sm font-medium text-foreground/90">{member.name}</span>
        </div>
        <select
          value={status}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const next = e.target.value as MemberDsuStatus;
            setStatus(next);
            save({ status: next });
          }}
          className={`h-7 rounded-[var(--radius-sm)] border border-border text-xs px-1.5 bg-secondary cursor-pointer ${STATUS_OPTIONS.find(o => o.value === status)?.colorClass ?? 'text-muted-foreground'}`}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {status !== 'ABSENT' && (
        <div className="space-y-2">
          <div>
            <label className="text-xs text-muted-foreground/70 mb-1 block">昨日やったこと</label>
            <textarea
              value={yesterday}
              onChange={(e) => setYesterday(e.target.value)}
              onBlur={() => save()}
              placeholder="昨日の作業内容..."
              rows={2}
              className={textareaClass}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground/70 mb-1 block">今日やること</label>
            <textarea
              value={today}
              onChange={(e) => setToday(e.target.value)}
              onBlur={() => save()}
              placeholder="今日の作業予定..."
              rows={2}
              className={textareaClass}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground/70 mb-1 block">ブロッカー</label>
            <textarea
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              onBlur={() => save()}
              placeholder="障害・課題があれば..."
              rows={1}
              className={`${textareaClass} ${blockers ? 'border-amber-500/30 bg-amber-500/[0.04]' : ''}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
