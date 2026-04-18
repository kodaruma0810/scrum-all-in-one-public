import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap } from 'lucide-react';
import { useAuthStore } from '@/lib/auth';
import { BACKEND_URL } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/auth/login`, { email, password });
      const { accessToken, refreshToken, user } = response.data;

      setTokens(accessToken, refreshToken);
      setUser(user);
      navigate('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('ログインに失敗しました。再度お試しください。');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left: branding */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 px-12 py-14 border-r border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-primary flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground tracking-tight">Scrum AiO</span>
        </div>

        <div>
          <p className="text-3xl font-semibold text-foreground leading-snug mb-4">
            ゴール・スプリント・<br />
            チケットを一元管理。
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            PIゴール → ITゴール → チケット の3層を可視化し、DSUからスプリント計画まで完結するAll-in-Oneツール。
          </p>
        </div>

        <p className="text-xs text-muted-foreground/50">
          © 2026 Scrum All-in-One
        </p>
      </div>

      {/* Right: form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">Scrum AiO</span>
          </div>

          <div className="mb-8">
            <h1 className="text-xl font-semibold text-foreground mb-1">ログイン</h1>
            <p className="text-sm text-muted-foreground">アカウントにアクセスしてください</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm text-muted-foreground">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary/40 focus-visible:border-primary/40 rounded-[var(--radius-md)]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm text-muted-foreground">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary/40 focus-visible:border-primary/40 rounded-[var(--radius-md)]"
              />
            </div>

            {error && (
              <div className="rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-primary text-primary-foreground text-sm font-medium rounded-[var(--radius-md)] hover:bg-primary/90 disabled:bg-primary/30 disabled:text-muted-foreground transition-colors cursor-pointer mt-2"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>

            <p className="text-center text-sm text-muted-foreground">
              アカウントをお持ちでないですか？{' '}
              <Link to="/signup" className="text-primary hover:underline">
                新規登録
              </Link>
            </p>

            {import.meta.env.DEV && (
              <div className="pt-3 border-t border-border">
                <p className="mb-2.5 text-center text-xs text-muted-foreground/50">開発用</p>
                <button
                  type="button"
                  className="w-full h-10 border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 text-sm rounded-[var(--radius-md)] transition-colors cursor-pointer"
                  onClick={() => {
                    setTokens('dev-token', 'dev-refresh-token');
                    setUser({
                      id: 'dev-user-id',
                      email: 'dev@example.com',
                      name: '開発ユーザー',
                      role: 'ADMIN',
                    });
                    navigate('/dashboard');
                  }}
                >
                  Dev Login（DB不要）
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
