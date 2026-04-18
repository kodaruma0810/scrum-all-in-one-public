import { useState } from 'react';
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from '../hooks/useApiKeys';
import type { ApiKeyCreatedDto } from '../hooks/useApiKeys';
import { KeyRound, Plus, Copy, Check, Trash2, AlertTriangle } from 'lucide-react';

const inputClass =
  'block w-full bg-muted/40 border border-border rounded-[var(--radius-sm)] px-3 py-1.5 text-sm text-foreground/90 placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30';

function formatDate(iso: string | null) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ApiKeysPage() {
  const { data: keys, isLoading, isError } = useApiKeys();
  const createKey = useCreateApiKey();
  const revokeKey = useRevokeApiKey();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');

  // 作成直後のキー表示用
  const [createdKey, setCreatedKey] = useState<ApiKeyCreatedDto | null>(null);
  const [copied, setCopied] = useState(false);

  // 取り消し確認用
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!name.trim()) {
      setFormError('キー名を入力してください');
      return;
    }
    createKey.mutate(
      { name: name.trim() },
      {
        onSuccess: (data) => {
          setCreatedKey(data);
          setShowForm(false);
          setName('');
        },
        onError: () => setFormError('APIキーの作成に失敗しました'),
      }
    );
  }

  function handleCopy() {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleRevoke(id: string) {
    revokeKey.mutate(id, {
      onSuccess: () => setRevokeTarget(null),
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

  if (isError) {
    return (
      <div className="px-4 py-6 md:p-8">
        <p className="text-red-400 text-sm">データの取得に失敗しました。</p>
      </div>
    );
  }

  const activeKeys = keys?.filter((k) => !k.revokedAt) ?? [];
  const revokedKeys = keys?.filter((k) => k.revokedAt) ?? [];

  return (
    <div className="px-4 py-6 md:p-8 max-w-5xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            API Keys
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            外部アプリケーションからAPIにアクセスするためのキーを管理します
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm((v) => !v);
            setCreatedKey(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-[var(--radius-md)] hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'キャンセル' : '新規作成'}
        </button>
      </div>

      {/* 作成直後のキー表示 */}
      {createdKey && (
        <div className="rounded-[var(--radius-lg)] border border-amber-500/30 bg-amber-500/5 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-semibold">APIキーが作成されました</span>
          </div>
          <p className="text-xs text-muted-foreground">
            このキーは一度だけ表示されます。安全な場所に保存してください。
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-muted/60 border border-border rounded-[var(--radius-sm)] px-3 py-2 text-sm font-mono text-foreground break-all select-all">
              {createdKey.key}
            </code>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 bg-muted/60 border border-border rounded-[var(--radius-sm)] text-sm text-foreground/70 hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            使い方: <code className="text-foreground/70">Authorization: ApiKey {createdKey.key.slice(0, 10)}...</code>
          </p>
          <button
            onClick={() => setCreatedKey(null)}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            閉じる
          </button>
        </div>
      )}

      {/* 作成フォーム */}
      {showForm && (
        <form onSubmit={handleCreate} className="rounded-[var(--radius-lg)] border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground/80">新しいAPIキーの作成</h2>
          {formError && <p className="text-xs text-red-400">{formError}</p>}
          <div>
            <label className="block text-xs text-muted-foreground/70 mb-1.5">キー名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="例: CI/CD用、外部連携用"
            />
          </div>
          <button
            type="submit"
            disabled={createKey.isPending}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-[var(--radius-md)] hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {createKey.isPending ? '作成中...' : '作成する'}
          </button>
        </form>
      )}

      {/* アクティブなキー一覧 */}
      <div className="rounded-[var(--radius-lg)] border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground/80">
            有効なキー ({activeKeys.length})
          </h2>
        </div>
        {activeKeys.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            APIキーはまだ作成されていません
          </div>
        ) : (
          <div className="divide-y divide-border">
            {activeKeys.map((key) => {
              const isExpired = key.expiresAt && new Date(key.expiresAt) < new Date();
              return (
                <div key={key.id} className="px-5 py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{key.name}</span>
                      {isExpired && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-500/10 text-amber-400 rounded">
                          期限切れ
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      <code className="font-mono">{key.keyPrefix}</code>
                      <span>作成: {formatDate(key.createdAt)}</span>
                      <span>最終使用: {formatDate(key.lastUsedAt)}</span>
                    </div>
                  </div>
                  {revokeTarget === key.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">取り消しますか？</span>
                      <button
                        onClick={() => handleRevoke(key.id)}
                        className="px-2.5 py-1 text-xs font-medium text-red-400 bg-red-500/10 rounded-[var(--radius-sm)] hover:bg-red-500/20 cursor-pointer"
                      >
                        はい
                      </button>
                      <button
                        onClick={() => setRevokeTarget(null)}
                        className="px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        いいえ
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRevokeTarget(key.id)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      取り消し
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 取り消し済みキー */}
      {revokedKeys.length > 0 && (
        <div className="rounded-[var(--radius-lg)] border border-border bg-card overflow-hidden opacity-60">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground/80">
              取り消し済み ({revokedKeys.length})
            </h2>
          </div>
          <div className="divide-y divide-border">
            {revokedKeys.map((key) => (
              <div key={key.id} className="px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground/60 line-through">{key.name}</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-500/10 text-red-400 rounded">
                    取り消し済み
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                  <code className="font-mono">{key.keyPrefix}</code>
                  <span>取り消し日: {formatDate(key.revokedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 使い方ガイド */}
      <div className="rounded-[var(--radius-lg)] border border-border bg-card p-5 space-y-3">
        <h2 className="text-sm font-semibold text-foreground/80">APIキーの使い方</h2>
        <div className="text-xs text-muted-foreground space-y-2">
          <p>HTTPリクエストの <code className="text-foreground/70">Authorization</code> ヘッダーにAPIキーを設定してください:</p>
          <pre className="bg-muted/60 border border-border rounded-[var(--radius-sm)] px-3 py-2 font-mono text-foreground/70 overflow-x-auto">
{`curl -H "Authorization: ApiKey sk_your_key_here" \\
     http://localhost:4000/api/teams/my`}
          </pre>
          <p>チームスコープのエンドポイントには <code className="text-foreground/70">X-Team-Id</code> ヘッダーも必要です:</p>
          <pre className="bg-muted/60 border border-border rounded-[var(--radius-sm)] px-3 py-2 font-mono text-foreground/70 overflow-x-auto">
{`curl -H "Authorization: ApiKey sk_your_key_here" \\
     -H "X-Team-Id: your-team-id" \\
     http://localhost:4000/api/tickets`}
          </pre>
        </div>
      </div>
    </div>
  );
}
