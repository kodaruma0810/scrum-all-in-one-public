import { useState } from 'react';
import { User, SystemRole, SYSTEM_ROLE_LABELS } from '../types';
import { useUpdateRole, useDeleteUser } from '../hooks/useUsers';
import RoleSelector from './RoleSelector';

interface Props {
  users: User[];
  currentUserId: string;
}

export default function UserTable({ users, currentUserId }: Props) {
  const updateRole = useUpdateRole();
  const deleteUser = useDeleteUser();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  function handleRoleChange(id: string, role: SystemRole) {
    updateRole.mutate({ id, role });
  }

  function handleDelete(id: string) {
    if (pendingDelete === id) {
      deleteUser.mutate(id, { onSuccess: () => setPendingDelete(null) });
    } else {
      setPendingDelete(id);
    }
  }

  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border">
      <table className="min-w-full divide-y divide-border/60 text-sm">
        <thead className="bg-card">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground/70 uppercase tracking-wide">名前</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground/70 uppercase tracking-wide">メールアドレス</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground/70 uppercase tracking-wide">ロール</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground/70 uppercase tracking-wide">参加日</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 bg-card">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-muted/20 transition-colors">
              <td className="px-4 py-3 font-medium text-foreground/90">{user.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
              <td className="px-4 py-3 w-48">
                {user.id === currentUserId ? (
                  <span className="inline-flex items-center rounded-[var(--radius-sm)] bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                    {SYSTEM_ROLE_LABELS[user.role]}（自分）
                  </span>
                ) : (
                  <RoleSelector
                    value={user.role}
                    onChange={(role) => handleRoleChange(user.id, role)}
                    disabled={updateRole.isPending}
                  />
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground/70 tabular-nums">
                {new Date(user.createdAt).toLocaleDateString('ja-JP')}
              </td>
              <td className="px-4 py-3 text-right">
                {user.id !== currentUserId && (
                  <button
                    onClick={() => handleDelete(user.id)}
                    disabled={deleteUser.isPending}
                    className={`text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                      pendingDelete === user.id
                        ? 'text-red-400 hover:text-red-300'
                        : 'text-muted-foreground/60 hover:text-red-400'
                    }`}
                  >
                    {pendingDelete === user.id ? '確認: 削除する' : '削除'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
