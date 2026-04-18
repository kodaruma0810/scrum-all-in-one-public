import { useState } from 'react';
import { useUsers, useMyProfile, useCreateUser } from '../hooks/useUsers';
import UserTable from '../components/UserTable';
import { SystemRole, SYSTEM_ROLE_LABELS } from '../types';
import { UserPlus } from 'lucide-react';

const ROLES: SystemRole[] = ['ADMIN', 'MEMBER'];

const inputClass =
  'block w-full bg-muted/40 border border-border rounded-[var(--radius-sm)] px-3 py-1.5 text-sm text-foreground/90 placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30';

export default function UserManagementPage() {
  const { data: users, isLoading, isError } = useUsers();
  const { data: me } = useMyProfile();
  const createUser = useCreateUser();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', name: '', role: 'MEMBER' as SystemRole, password: '' });
  const [formError, setFormError] = useState('');

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!form.email || !form.name || !form.password) {
      setFormError('全ての項目を入力してください');
      return;
    }
    createUser.mutate(form, {
      onSuccess: () => {
        setShowForm(false);
        setForm({ email: '', name: '', role: 'MEMBER', password: '' });
      },
      onError: () => setFormError('ユーザーの作成に失敗しました'),
    });
  }

  if (isLoading) {
    return (
      <div className="px-4 py-6 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-40" />
          <div className="h-64 bg-muted rounded-[var(--radius-lg)]" />
        </div>
      </div>
    );
  }

  if (isError || !users) {
    return (
      <div className="px-4 py-6 md:p-8">
        <p className="text-red-400 text-sm">データの取得に失敗しました。</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:p-8 max-w-5xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">ユーザー管理</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{users.length} 名のメンバー</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-[var(--radius-md)] hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          {showForm ? 'キャンセル' : 'ユーザーを招待'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-[var(--radius-lg)] border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground/80">新規ユーザーの招待</h2>
          {formError && <p className="text-xs text-red-400">{formError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground/70 mb-1.5">名前</label>
              <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} placeholder="山田 太郎" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground/70 mb-1.5">メールアドレス</label>
              <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputClass} placeholder="user@example.com" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground/70 mb-1.5">初期パスワード</label>
              <input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className={inputClass} placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground/70 mb-1.5">ロール</label>
              <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as SystemRole }))} className={`${inputClass} cursor-pointer`}>
                {ROLES.map((r) => <option key={r} value={r}>{SYSTEM_ROLE_LABELS[r]}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={createUser.isPending} className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-[var(--radius-md)] hover:bg-primary/90 disabled:opacity-50 cursor-pointer">
              {createUser.isPending ? '作成中...' : '作成'}
            </button>
          </div>
        </form>
      )}

      <UserTable users={users} currentUserId={me?.id ?? ''} />
    </div>
  );
}
