import { useState, useEffect } from 'react';
import { useMyProfile, useUpdateMyProfile } from '../hooks/useUsers';
import { SYSTEM_ROLE_LABELS } from '../types';

export default function ProfilePage() {
  const { data: me, isLoading } = useMyProfile();
  const updateProfile = useUpdateMyProfile();

  const [form, setForm] = useState({ name: '', avatarUrl: '' });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (me) setForm({ name: me.name, avatarUrl: me.avatarUrl ?? '' });
  }, [me]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('名前を入力してください');
      return;
    }
    updateProfile.mutate(
      { name: form.name, avatarUrl: form.avatarUrl || null },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
        onError: () => setError('更新に失敗しました'),
      }
    );
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

  if (!me) {
    return (
      <div className="p-6">
        <p className="text-red-400 text-sm">プロフィールの取得に失敗しました。</p>
      </div>
    );
  }

  const initial = me.name.charAt(0).toUpperCase();

  return (
    <div className="p-6 max-w-lg mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">プロフィール</h1>
        <p className="mt-1 text-sm text-muted-foreground">自分のアカウント情報を管理します。</p>
      </div>

      {/* アバター */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-foreground text-2xl font-bold flex-shrink-0">
          {initial}
        </div>
        <div>
          <p className="font-semibold text-foreground">{me.name}</p>
          <p className="text-sm text-muted-foreground">{me.email}</p>
          <span className="mt-1 inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
            {SYSTEM_ROLE_LABELS[me.role]}
          </span>
        </div>
      </div>

      {/* 編集フォーム */}
      <form onSubmit={handleSave} className="space-y-4">
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-muted-foreground/70 mb-1">名前</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="block w-full rounded-[var(--radius-sm)] border border-border bg-muted/40 px-3 py-2 text-sm text-foreground/90 focus:outline-none focus:border-primary/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground/70 mb-1">メールアドレス</label>
          <input
            type="email"
            value={me.email}
            disabled
            className="block w-full rounded-[var(--radius-sm)] border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground/60 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-muted-foreground/60">メールアドレスは管理者のみ変更できます。</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground/70 mb-1">アバター URL（任意）</label>
          <input
            type="url"
            value={form.avatarUrl}
            onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
            className="block w-full rounded-[var(--radius-sm)] border border-border bg-muted/40 px-3 py-2 text-sm text-foreground/90 placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30"
            placeholder="https://example.com/avatar.png"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="inline-flex items-center rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
          >
            {updateProfile.isPending ? '保存中...' : '保存'}
          </button>
          {saved && <span className="text-sm text-emerald-400">保存しました</span>}
        </div>
      </form>
    </div>
  );
}
