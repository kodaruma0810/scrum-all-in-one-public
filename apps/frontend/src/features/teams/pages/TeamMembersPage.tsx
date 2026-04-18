import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, Trash2, Crown, Shield, AlertTriangle } from 'lucide-react';
import { useTeamMembers, useAddTeamMember, useRemoveTeamMember, useChangeTeamRole, useToggleTeamOwner, useDeleteTeam } from '../hooks/useTeams';
import { useUsers } from '@/features/users/hooks/useUsers';
import { useAuthStore } from '@/lib/auth';
import { useTeamStore } from '@/lib/teamStore';

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

export default function TeamMembersPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { data: members = [], isLoading } = useTeamMembers(teamId ?? null);
  const { data: allUsers = [] } = useUsers();
  const addMember = useAddTeamMember();
  const removeMember = useRemoveTeamMember();
  const changeRole = useChangeTeamRole();
  const toggleOwner = useToggleTeamOwner();
  const deleteTeam = useDeleteTeam();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const currentUser = useAuthStore((s) => s.user);
  const { currentTeamId, clearCurrentTeam } = useTeamStore();

  const memberUserIds = new Set(members.map((m) => m.userId));
  const nonMembers = allUsers.filter((u) => !memberUserIds.has(u.id));

  // 現在のユーザーがチーム管理可能か
  const currentMember = members.find((m) => m.userId === currentUser?.id);
  const canManage = currentUser?.role === 'ADMIN' || currentMember?.isOwner === true;

  // オーナーが1人だけかどうか
  const ownerCount = members.filter((m) => m.isOwner).length;
  const isLastOwner = (userId: string) => {
    const member = members.find((m) => m.userId === userId);
    return member?.isOwner && ownerCount <= 1;
  };

  function handleAdd() {
    if (!teamId || !selectedUserId) return;
    addMember.mutate(
      { teamId, userId: selectedUserId },
      { onSuccess: () => setSelectedUserId('') }
    );
  }

  function handleRemove(userId: string) {
    if (!teamId) return;
    removeMember.mutate({ teamId, userId });
  }

  function handleRoleChange(userId: string, role: string) {
    if (!teamId) return;
    changeRole.mutate({ teamId, userId, role });
  }

  function handleToggleOwner(userId: string, newIsOwner: boolean) {
    if (!teamId) return;
    toggleOwner.mutate({ teamId, userId, isOwner: newIsOwner });
  }

  function handleDeleteTeam() {
    if (!teamId) return;
    deleteTeam.mutate(teamId, {
      onSuccess: () => {
        if (currentTeamId === teamId) {
          clearCurrentTeam();
        }
        navigate('/dashboard');
      },
    });
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-48 bg-muted rounded-[var(--radius-md)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">メンバー管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          チームメンバーの追加・削除・ロール変更を行います。
        </p>
      </div>

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
                  className="flex items-center justify-between px-4 py-3 rounded-[var(--radius-md)] bg-muted/20 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-foreground text-xs font-semibold">
                      {member.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-foreground">{member.userName}</p>
                        {member.isOwner && (
                          <span title="チーム管理者"><Shield className="h-3.5 w-3.5 text-emerald-400" /></span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{member.userEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
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
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-red-500/30 text-red-400 rounded-[var(--radius-md)] hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              チームを削除
            </button>
          ) : (
            <div className="rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/20 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-400">
                  チームを削除すると、メンバー情報が全て削除されます。この操作は取り消せません。
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteTeam}
                  disabled={deleteTeam.isPending}
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-[var(--radius-md)] hover:bg-red-600 disabled:opacity-50 cursor-pointer"
                >
                  {deleteTeam.isPending ? '削除中...' : '削除を確定'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
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
