import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { teamMemberGuard } from '../middleware/teamGuard.js';
import authRoutes from '../auth/routes.js';
import ticketsRouter from '../features/tickets/routes.js';
import goalsRouter from '../features/goals/routes.js';
import sprintsRouter from '../features/sprints/routes.js';
import dsuRouter from '../features/dsu/routes.js';
import dashboardRouter from '../features/dashboard/routes.js';
import searchRouter from '../features/search/routes.js';
import usersRouter, { teamRouter, settingsRouter } from '../features/users/routes.js';
import teamsRouter from '../features/teams/routes.js';
import apiKeysRouter from '../features/api-keys/routes.js';
import workingAgreementsRouter from '../features/working-agreements/routes.js';
import retrospectivesRouter from '../features/retrospectives/routes.js';

export async function setupRoutes(app: Hono): Promise<void> {
  // Auth routes (no auth middleware)
  app.route('/auth', authRoutes);

  // API routes (protected with auth middleware)
  const api = new Hono();
  api.use('*', authMiddleware);

  // DATABASE_URL 未設定の開発環境ではモックルーターを優先マウント
  if (!process.env.DATABASE_URL && process.env.NODE_ENV !== 'production') {
    const { default: mockRouter } = await import('../dev/mockRouter.js');
    api.route('/', mockRouter);
    console.log('[dev] Mock router mounted (DATABASE_URL not set)');
  }

  // チームスコープ外のルート（X-Team-Id 不要）
  api.route('/search', searchRouter);
  api.route('/teams', teamsRouter);
  api.route('/api-keys', apiKeysRouter);
  api.route('/users', usersRouter);
  api.route('/team', teamRouter);
  api.route('/settings', settingsRouter);

  // チームスコープのルート（X-Team-Id ヘッダー + メンバーシップ検証が必要）
  api.use('/tickets/*', teamMemberGuard);
  api.use('/goals/*', teamMemberGuard);
  api.use('/sprints/*', teamMemberGuard);
  api.use('/dsu/*', teamMemberGuard);
  api.use('/dashboard/*', teamMemberGuard);
  api.use('/working-agreements/*', teamMemberGuard);
  api.use('/retrospectives', teamMemberGuard);
  api.use('/retrospectives/*', teamMemberGuard);
  api.route('/tickets', ticketsRouter);
  api.route('/goals', goalsRouter);
  api.route('/sprints', sprintsRouter);
  api.route('/dsu', dsuRouter);
  api.route('/dashboard', dashboardRouter);
  api.route('/working-agreements', workingAgreementsRouter);
  api.route('/retrospectives', retrospectivesRouter);

  app.route('/api', api);
}
