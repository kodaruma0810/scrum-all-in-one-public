import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  Target,
  Zap,
  ClipboardList,
  Users,
  Search,
  FileText,
  MessageSquare,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Settings,
  UserCircle,
  KeyRound,
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth';
import { useTeamStore } from '@/lib/teamStore';
import { useMyProfile } from '@/features/users/hooks/useUsers';
import GlobalSearchBar from '@/features/search/components/GlobalSearchBar';
import TeamSwitcher from '@/features/teams/components/TeamSwitcher';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTerms } from '@/hooks/useTerms';
import { cn } from '@/lib/utils';

export default function AppLayout() {
  const t = useTerms();

  // スクラムの流れ順: 計画 → 実行 → 振り返り → 管理
  const mainNavItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'ダッシュボード' },
    { to: '/backlog', icon: ListTodo, label: t('backlog') },
    { to: '/pi', icon: Target, label: t('increment') },
    { to: '/planning', icon: ClipboardList, label: t('planning') },
    { to: '/sprint', icon: Zap, label: t('sprint') },
  ];
  const reviewNavItems = [
    { to: '/retrospectives', icon: MessageSquare, label: t('retrospective') },
    { to: '/working-agreements', icon: FileText, label: t('workingAgreement') },
  ];
  const adminNavItems = [
    { to: '/team-management', icon: Settings, label: 'チーム管理' },
  ];
  const globalNavDefs = [
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/api-keys', icon: KeyRound, label: 'API Keys' },
    { to: '/users', icon: Users, label: 'Users', adminOnly: true },
  ];
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user: authUser, logout } = useAuthStore();
  const { data: profile } = useMyProfile();
  const user = profile ?? authUser;
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentTeamId = useTeamStore((s) => s.currentTeamId);
  const location = useLocation();
  const isAdmin = authUser?.role === 'ADMIN';
  const isOnPlanningPage = /^\/pi\/[^/]+\/planning\//.test(location.pathname);

  // グローバルナビ（常に表示、adminOnly はADMINのみ）
  const globalNavItems = globalNavDefs
    .filter((item) => !('adminOnly' in item && item.adminOnly) || isAdmin);

  function renderNavSection(items: { to: string; icon: typeof LayoutDashboard; label: string }[], mobile?: boolean) {
    return items.map(({ to, icon: Icon, label }) => {
      const isActiveOverride = isOnPlanningPage ? to === '/planning' : undefined;
      const isInactiveOverride = isOnPlanningPage && to === '/pi';
      return (
        <NavLink
          key={to}
          to={to}
          onClick={() => mobile && setSidebarOpen(false)}
          className={({ isActive }) => {
            const active = isInactiveOverride ? false : (isActiveOverride ?? isActive);
            return cn(
              'flex items-center gap-3 px-3 py-2 text-sm rounded-[var(--radius-sm)] transition-colors mb-0.5',
              active
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            );
          }}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </NavLink>
      );
    });
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <nav
      className={cn(
        'flex flex-col h-full bg-card border-r border-border',
        mobile ? 'w-60' : 'w-60 hidden lg:flex'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-14 border-b border-border shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-[var(--radius-sm)] bg-primary flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground tracking-tight">Scrum AiO</span>
        </div>
        {mobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Team Switcher */}
      <TeamSwitcher />

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3 px-2">
        {currentTeamId && (
          <>
            {/* メイン: 計画→実行 */}
            {renderNavSection(mainNavItems, mobile)}

            {/* 振り返り */}
            <div className="mt-3 mb-1 px-3">
              <p className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-widest">振り返り</p>
            </div>
            {renderNavSection(reviewNavItems, mobile)}

            {/* 管理 */}
            <div className="mt-3 mb-1 px-3">
              <p className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-widest">管理</p>
            </div>
            {renderNavSection(adminNavItems, mobile)}
          </>
        )}

        {currentTeamId && globalNavItems.length > 0 && (
          <div className="my-3 border-t border-border" />
        )}

        {globalNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => mobile && setSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 text-sm rounded-[var(--radius-sm)] transition-colors mb-0.5',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}

        {!currentTeamId && (
          <div className="px-3 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              チームを選択または作成してください
            </p>
          </div>
        )}
      </div>

      {/* User footer */}
      <div className="px-3 pb-3 pt-2 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full text-sm text-muted-foreground hover:text-foreground rounded-[var(--radius-sm)] hover:bg-muted/60 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Logout
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background/80"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-5 h-14 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <GlobalSearchBar />
            {/* モバイル用検索ボタン（GlobalSearchBarのトリガーがsm:以上のみ表示のため） */}
            <button
              onClick={() => {
                // Cmd+K / Ctrl+K のイベントをディスパッチして検索モーダルを開く
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
              }}
              className="sm:hidden text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-8 px-2 hover:bg-muted text-foreground/80 hover:text-foreground cursor-pointer">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-foreground text-xs font-semibold">
                  {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {user?.name ?? 'User'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-muted" />
              <DropdownMenuItem onClick={() => navigate('/profile')} className="text-foreground/80 hover:text-foreground focus:text-foreground cursor-pointer">
                <UserCircle className="mr-2 h-4 w-4" />
                プロフィール
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-muted" />
              <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:text-red-300 focus:text-red-300 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet key={currentTeamId ?? '__no_team__'} />
        </main>
      </div>
    </div>
  );
}
