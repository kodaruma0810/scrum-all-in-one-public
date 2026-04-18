import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { useAuthStore } from './lib/auth';
import { useTeamStore } from './lib/teamStore';
import { Users } from 'lucide-react';


function RedirectGoalDetail() {
  const { id } = useParams();
  return <Navigate to={`/pi/${id}`} replace />;
}

function TeamRequired({ children }: { children: React.ReactNode }) {
  const currentTeamId = useTeamStore((s) => s.currentTeamId);
  if (!currentTeamId) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <Users className="h-12 w-12 text-muted-foreground/30" />
        <p className="text-muted-foreground text-sm">
          サイドバーからチームを選択してください
        </p>
      </div>
    );
  }
  return <>{children}</>;
}

const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage'));
const BacklogPage = lazy(() => import('./features/tickets/pages/BacklogPage'));
const PIListPage = lazy(() => import('./features/pi/pages/PIListPage'));
const PIDetailPage = lazy(() => import('./features/pi/pages/PIDetailPage'));
const SprintPlanningPage = lazy(() => import('./features/sprints/pages/SprintPlanningPage'));
const PlanningRedirectPage = lazy(() => import('./features/sprints/pages/PlanningRedirectPage'));
const ActiveSprintPage = lazy(() => import('./features/sprint/pages/ActiveSprintPage'));
const TicketDetailPage = lazy(() => import('./features/tickets/pages/TicketDetailPage'));
const SearchPage = lazy(() => import('./features/search/pages/SearchPage'));
const UsersPage = lazy(() => import('./features/users/pages/UsersPage'));
const TeamSettingsPage = lazy(() => import('./features/users/pages/TeamSettingsPage'));
const ProfilePage = lazy(() => import('./features/users/pages/ProfilePage'));
const TeamMembersPage = lazy(() => import('./features/teams/pages/TeamMembersPage'));
const TeamManagementPage = lazy(() => import('./features/teams/pages/TeamManagementPage'));
const WorkingAgreementsPage = lazy(() => import('./features/working-agreements/pages/WorkingAgreementsPage'));
const WAShareViewPage = lazy(() => import('./features/working-agreements/pages/WAShareViewPage'));
const RetroListPage = lazy(() => import('./features/retrospectives/pages/RetroListPage'));
const RetroDetailPage = lazy(() => import('./features/retrospectives/pages/RetroDetailPage'));
const ApiKeysPage = lazy(() => import('./features/api-keys/pages/ApiKeysPage'));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const role = useAuthStore((s) => s.user?.role);
  return role === 'ADMIN' ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="text-lg text-muted-foreground">Loading...</div>
          </div>
        }
      >
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<TeamRequired><DashboardPage /></TeamRequired>} />
            <Route path="backlog" element={<TeamRequired><BacklogPage /></TeamRequired>} />
            <Route path="pi" element={<TeamRequired><PIListPage /></TeamRequired>} />
            <Route path="pi/:id" element={<TeamRequired><PIDetailPage /></TeamRequired>} />
            <Route path="pi/:id/planning/:sprintId" element={<TeamRequired><SprintPlanningPage /></TeamRequired>} />
            <Route path="planning" element={<TeamRequired><PlanningRedirectPage /></TeamRequired>} />
            <Route path="sprint" element={<TeamRequired><ActiveSprintPage /></TeamRequired>} />
            <Route path="tickets/:id" element={<TicketDetailPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="users" element={<AdminRoute><UsersPage /></AdminRoute>} />
            <Route path="team-management" element={<TeamRequired><TeamManagementPage /></TeamRequired>} />
            <Route path="working-agreements" element={<TeamRequired><WorkingAgreementsPage /></TeamRequired>} />
            <Route path="working-agreements/share" element={<TeamRequired><WAShareViewPage /></TeamRequired>} />
            <Route path="retrospectives" element={<TeamRequired><RetroListPage /></TeamRequired>} />
            <Route path="retrospectives/:id" element={<TeamRequired><RetroDetailPage /></TeamRequired>} />
            <Route path="team-settings" element={<Navigate to="/team-management" replace />} />
            <Route path="teams/:teamId/members" element={<TeamMembersPage />} />
            <Route path="api-keys" element={<ApiKeysPage />} />
            <Route path="profile" element={<ProfilePage />} />
            {/* Redirects from old routes */}
            <Route path="goals" element={<Navigate to="/pi" replace />} />
            <Route path="goals/:id" element={<RedirectGoalDetail />} />
            <Route path="sprints" element={<Navigate to="/pi" replace />} />
            <Route path="tickets" element={<Navigate to="/sprint" replace />} />
            <Route path="dsu" element={<Navigate to="/sprint" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
