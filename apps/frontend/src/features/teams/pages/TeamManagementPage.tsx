import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Trash2, Crown, Shield, AlertTriangle } from 'lucide-react';
import { useTeamSettings, useUpdateTeamSettings } from '@/features/users/hooks/useUsers';
import { useTeamMembers, useAddTeamMember, useRemoveTeamMember, useChangeTeamRole, useToggleTeamOwner, useDeleteTeam } from '../hooks/useTeams';
import { useUsers } from '@/features/users/hooks/useUsers';
import { useAuthStore } from '@/lib/auth';
import { useTeamStore } from '@/lib/teamStore';
import TerminologySettings from '@/features/users/components/TerminologySettings';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'settings', label: '基本設定' },
  { key: 'members', label: 'メンバー' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const ROLE_OPTIONS = [
  { value: 'SCRUM_MASTER', label: 'スクラムマスター' },
  { value: 'PRODUCT_OWNER', label: 'プロダクトオーナー' },
  { value: 'DEVELOPER', label: '開発者' },
] as const;

function roleBadgeColor(role: string) {
  switch (role) {
    case 'SCRUM_MASTER': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'PRODUCT_OWNER': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}

function roleLabel(role: string) {
  return ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role;
}

export default function TeamManagementPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('settings');

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">チーム管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">チームの設定やメンバーを管理します。</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-px',
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'settings' && <SettingsTab />}
      {activeTab === 'members' && <MembersTab />}
    </div>
  );
}

// ─── Settings Tab ────────────────────────────────────────────────────

function SettingsTab() {
  const { data: team, isLoading } = useTeamSettings();
  const updateTeam = useUpdateTeamSettings();

  const [form, setForm] = useState({ name: '', ticketPrefix: '', velocityMode: 'STORY_POINTS' as 'STORY_POINTS' | 'TICKET_COUNT', spDaysRatio: 1 });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (team) setForm({ name: team.name, ticketPrefix: team.ticketPrefix, velocityMode: team.velocityMode, spDaysRatio: team.spDaysRatio ?? 1 });
  }, [team]);

  function handleSaveTeam(e: React.FormEvent) {
    e.preventDefault();
    updateTeam.mutate(form, {
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      },
    });
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-48 bg-muted rounded-[var(--radius-md)]" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* チーム基本情報 */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground/90 border-b border-border pb-2">基本情報</h2>
        <form onSubmit={handleSaveTeam} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground/70 mb-1">チーム名</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="block w-full rounded-[var(--radius-sm)] border border-border bg-muted/40 px-3 py-2 text-sm text-foreground/90 focus:outline-none focus:border-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground/70 mb-1">チケットプレフィックス</label>
            <input
              type="text"
              value={form.ticketPrefix}
              onChange={(e) => setForm((f) => ({ ...f, ticketPrefix: e.target.value.toUpperCase() }))}
              maxLength={6}
              className="block w-32 rounded-[var(--radius-sm)] border border-border bg-muted/40 px-3 py-2 text-sm text-foreground/90 placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30"
              placeholder="SCR"
            />
            <p className="mt-1 text-xs text-muted-foreground/60">例: SCR-001 のプレフィックス部分</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground/70 mb-1">ベロシティ計測方法</label>
            <div className="flex gap-4">
              {(['STORY_POINTS', 'TICKET_COUNT'] as const).map((mode) => (
                <label key={mode} className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="velocityMode"
                    value={mode}
                    checked={form.velocityMode === mode}
                    onChange={() => setForm((f) => ({ ...f, velocityMode: mode }))}
                    className="cursor-pointer"
                  />
                  <span className="text-sm text-foreground/90">
                    {mode === 'STORY_POINTS' ? 'ストーリーポイント' : 'チケット数'}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground/70 mb-1">1SPあたりの日数</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0.1}
                max={99}
                step={0.1}
                value={form.spDaysRatio}
                onChange={(e) => setForm((f) => ({ ...f, spDaysRatio: parseFloat(e.target.value) || 1 }))}
                className="block w-24 rounded-[var(--radius-sm)] border border-border bg-muted/40 px-3 py-2 text-sm text-foreground/90 focus:outline-none focus:border-primary/30 tabular-nums"
              />
              <span className="text-sm text-muted-foreground/60">日</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground/60">キャパシティ計算に使用されます（例: 1SP = 0.5日）</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={updateTeam.isPending}
              className="inline-flex items-center rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
            >
              {updateTeam.isPending ? '保存中...' : '保存'}
            </button>
            {saved && <span className="text-sm text-emerald-400">保存しました</span>}
          </div>
        </form>
      </section>

      {/* 用語カスタマイズ */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground/90 border-b border-border pb-2">用語カスタマイズ</h2>
        <TerminologySettings />
      </section>
    </div>
  );
}

// ─── Members Tab ─────────────────────────────────────────────────────

function MembersTab() {
  const { currentTeamId, clearCurrentTeam } = useTeamStore();
  const navigate = useNavigate();
  const { data: members = [], isLoading } = useTeamMembers(currentTeamId);
  const { data: allUsers = [] } = useUsers();
  const { data: teamData } = useTeamSettings();
  const addMember = useAddTeamMember();
  const removeMember = useRemoveTeamMember();
  const changeRole = useChangeTeamRole();
  const toggleOwner = useToggleTeamOwner();
  const deleteTeam = useDeleteTeam();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [deleteStep, setDeleteStep] = useState(0); // 0: hidden, 1: warning, 2: name input, 3: final
  const [deleteNameInput, setDeleteNameInput] = useState('');
  const currentUser = useAuthStore((s) => s.user);

  const memberUserIds = new Set(members.map((m) => m.userId));
  const nonMembers = allUsers.filter((u) => !memberUserIds.has(u.id));

  const currentMember = members.find((m) => m.userId === currentUser?.id);
  const canManage = currentUser?.role === 'ADMIN' || currentMember?.isOwner === true;

  const ownerCount = members.filter((m) => m.isOwner).length;
  const isLastOwner = (userId: string) => {
    const member = members.find((m) => m.userId === userId);
    return member?.isOwner && ownerCount <= 1;
  };

  function handleAdd() {
    if (!currentTeamId || !selectedUserId) return;
    addMember.mutate(
      { teamId: currentTeamId, userId: selectedUserId },
      { onSuccess: () => setSelectedUserId('') }
    );
  }

  function handleRemove(userId: string) {
    if (!currentTeamId) return;
    removeMember.mutate({ teamId: currentTeamId, userId });
  }

  function handleRoleChange(userId: string, role: string) {
    if (!currentTeamId) return;
    changeRole.mutate({ teamId: currentTeamId, userId, role });
  }

  function handleToggleOwner(userId: string, newIsOwner: boolean) {
    if (!currentTeamId) return;
    toggleOwner.mutate({ teamId: currentTeamId, userId, isOwner: newIsOwner });
  }

  function handleDeleteTeam() {
    if (!currentTeamId) return;
    deleteTeam.mutate(currentTeamId, {
      onSuccess: () => {
        clearCurrentTeam();
        navigate('/dashboard');
      },
    });
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-48 bg-muted rounded-[var(--radius-md)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* メンバー追加 */}
      {canManage && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground/90 border-b border-border pb-2">
            メンバーを追加
          </h2>
          <div className="flex gap-2">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="flex-1 bg-muted/40 border border-border text-foreground/90 rounded-[var(--radius-md)] px-3 py-2 text-sm focus:outline-none focus:border-primary/30"
            >
              <option value="">ユーザーを選択</option>
              {nonMembers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <button
              onClick={handleAdd}
              disabled={!selectedUserId || addMember.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-[var(--radius-md)] hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              追加
            </button>
          </div>
          {nonMembers.length === 0 && (
            <p className="text-xs text-muted-foreground/50">
              追加可能なユーザーがいません。
            </p>
          )}
        </section>
      )}

      {/* メンバー一覧 */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground/90 border-b border-border pb-2">
          現在のメンバー ({members.length}人)
        </h2>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">メンバーがいません</p>
        ) : (
          <div className="space-y-1">
            {members.map((member) => {
              const lastOwner = isLastOwner(member.userId);
              return (
                <div
                  key={member.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 px-4 py-3 rounded-[var(--radius-md)] bg-muted/20 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-foreground text-xs font-semibold shrink-0">
                      {member.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-foreground truncate">{member.userName}</p>
                        {member.isOwner && (
                          <span title="チーム管理者"><Shield className="h-3.5 w-3.5 text-emerald-400 shrink-0" /></span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{member.userEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:ml-0 ml-11">
                    {canManage ? (
                      <>
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.userId, e.target.value)}
                          disabled={changeRole.isPending}
                          className="bg-muted/40 border border-border text-foreground/90 rounded-[var(--radius-sm)] px-2 py-1 text-xs focus:outline-none focus:border-primary/30"
                        >
                          {ROLE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleToggleOwner(member.userId, !member.isOwner)}
                          disabled={toggleOwner.isPending || lastOwner}
                          className={`p-1 rounded-[var(--radius-sm)] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                            member.isOwner
                              ? 'text-emerald-400 hover:text-emerald-300'
                              : 'text-muted-foreground hover:text-emerald-400'
                          }`}
                          title={
                            lastOwner
                              ? '最後の管理者のため外せません'
                              : member.isOwner ? '管理権限を剥奪' : '管理権限を付与'
                          }
                        >
                          <Crown className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRemove(member.userId)}
                          disabled={removeMember.isPending || lastOwner}
                          className="text-muted-foreground hover:text-red-400 transition-colors cursor-pointer p-1 disabled:cursor-not-allowed disabled:opacity-40"
                          title={lastOwner ? '最後の管理者は削除できません' : 'メンバーを削除'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${roleBadgeColor(member.role)}`}>
                        {roleLabel(member.role)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* チーム削除 */}
      {canManage && (
        <section className="space-y-3 pt-4 border-t border-border">
          <h2 className="text-base font-semibold text-red-400/90">危険な操作</h2>

          {/* Step 0: 初期状態 */}
          {deleteStep === 0 && (
            <button
              onClick={() => setDeleteStep(1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-red-500/30 text-red-400 rounded-[var(--radius-md)] hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              チームを削除
            </button>
          )}

          {/* Step 1: 警告表示 */}
          {deleteStep === 1 && (
            <div className="rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/20 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-400">本当にチームを削除しますか？</p>
                  <p className="text-xs text-red-400/70 mt-1">
                    チームに関連する全てのデータ（メンバー、スプリント、チケット、レトロスペクティブ、ワーキングアグリーメント等）が完全に削除されます。この操作は取り消せません。
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteStep(2)}
                  className="px-4 py-2 text-sm bg-red-500/20 text-red-400 border border-red-500/30 rounded-[var(--radius-md)] hover:bg-red-500/30 cursor-pointer"
                >
                  削除を続行
                </button>
                <button
                  onClick={() => setDeleteStep(0)}
                  className="px-4 py-2 text-sm border border-border text-muted-foreground rounded-[var(--radius-md)] hover:text-foreground cursor-pointer"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}

          {/* Step 2: チーム名入力による確認 */}
          {deleteStep === 2 && (
            <div className="rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/20 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-400">確認のためチーム名を入力してください</p>
                  <p className="text-xs text-red-400/70 mt-1">
                    削除を実行するには、下の入力欄に <span className="font-bold text-red-400">{teamData?.name}</span> と正確に入力してください。
                  </p>
                </div>
              </div>
              <input
                type="text"
                value={deleteNameInput}
                onChange={(e) => setDeleteNameInput(e.target.value)}
                placeholder="チーム名を入力..."
                className="block w-full rounded-[var(--radius-sm)] border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-foreground/90 focus:outline-none focus:border-red-500/50"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteStep(3)}
                  disabled={deleteNameInput !== teamData?.name}
                  className="px-4 py-2 text-sm bg-red-500/20 text-red-400 border border-red-500/30 rounded-[var(--radius-md)] hover:bg-red-500/30 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  次へ
                </button>
                <button
                  onClick={() => { setDeleteStep(0); setDeleteNameInput(''); }}
                  className="px-4 py-2 text-sm border border-border text-muted-foreground rounded-[var(--radius-md)] hover:text-foreground cursor-pointer"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}

          {/* Step 3: 最終確認 */}
          {deleteStep === 3 && (
            <div className="rounded-[var(--radius-md)] bg-red-500/15 border border-red-500/30 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-red-500">最終確認</p>
                  <p className="text-xs text-red-400/80 mt-1">
                    チーム「<span className="font-bold">{teamData?.name}</span>」と関連する全データを完全に削除します。この操作は元に戻せません。
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteTeam}
                  disabled={deleteTeam.isPending}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-[var(--radius-md)] hover:bg-red-700 disabled:opacity-50 cursor-pointer font-medium"
                >
                  {deleteTeam.isPending ? '削除中...' : '完全に削除する'}
                </button>
                <button
                  onClick={() => { setDeleteStep(0); setDeleteNameInput(''); }}
                  className="px-4 py-2 text-sm border border-border text-muted-foreground rounded-[var(--radius-md)] hover:text-foreground cursor-pointer"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
