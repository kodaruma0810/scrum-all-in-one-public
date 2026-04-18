import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap } from 'lucide-react';
import { useAuthStore } from '@/lib/auth';
import { BACKEND_URL } from '@/lib/api';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError('パスワードが一致しません。');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/auth/signup`, { email, password, name });
      const { accessToken, refreshToken, user } = response.data;

      setTokens(accessToken, refreshToken);
      setUser(user);
      navigate('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('アカウント作成に失敗しました。再度お試しください。');
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
            <h1 className="text-xl font-semibold text-foreground mb-1">アカウント作成</h1>
            <p className="text-sm text-muted-foreground">必要な情報を入力してください</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm text-muted-foreground">アカウント名</Label>
              <Input
                id="name"
                type="text"
                placeholder="山田 太郎"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary/40 focus-visible:border-primary/40 rounded-[var(--radius-md)]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm text-muted-foreground">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@example.com"
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
                placeholder="8文字以上"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={loading}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary/40 focus-visible:border-primary/40 rounded-[var(--radius-md)]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="passwordConfirm" className="text-sm text-muted-foreground">パスワード（確認）</Label>
              <Input
                id="passwordConfirm"
                type="password"
                placeholder="もう一度入力"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                minLength={8}
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
              {loading ? '作成中...' : 'アカウントを作成'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            既にアカウントをお持ちですか？{' '}
            <Link to="/login" className="text-primary hover:underline">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
