import { Hono } from 'hono';
import * as service from './service.js';
import { DashboardSummary } from './types.js';

const router = new Hono<{ Variables: { user: { organizationId: string; id: string }; teamId: string } }>();

const MOCK_SUMMARY: DashboardSummary = {
  activeSprint: {
    id: 'mock-sprint-1',
    name: 'Sprint 2026-Q2-1',
    startDate: new Date('2026-04-07').toISOString(),
    endDate: new Date('2026-04-18').toISOString(),
    remainingDays: 5,
    progressRate: 62,
    totalTickets: 13,
    doneTickets: 8,
    totalStoryPoints: 34,
    doneStoryPoints: 21,
  },
  longTermGoals: [
    {
      id: 'mock-goal-1',
      title: '認証・権限管理の完全実装',
      status: 'IN_PROGRESS',
      priority: 'MUST_HAVE',
      progressRate: 75,
      totalSprintGoals: 4,
      achievedSprintGoals: 3,
    },
    {
      id: 'mock-goal-2',
      title: 'DSUダッシュボードの刷新',
      status: 'ACHIEVED',
      priority: 'SHOULD_HAVE',
      progressRate: 100,
      totalSprintGoals: 2,
      achievedSprintGoals: 2,
    },
    {
      id: 'mock-goal-3',
      title: 'グローバル検索機能の導入',
      status: 'NOT_STARTED',
      priority: 'NICE_TO_HAVE',
      progressRate: 0,
      totalSprintGoals: 3,
      achievedSprintGoals: 0,
    },
  ],
  myTickets: [
    {
      id: 'mock-ticket-1',
      ticketNumber: 42,
      title: 'ダッシュボードウィジェットのレイアウト実装',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      storyPoints: 5,
      sprintGoal: { id: 'sg-1', title: 'ホームダッシュボード完成' },
    },
    {
      id: 'mock-ticket-2',
      ticketNumber: 38,
      title: 'APIレスポンスのキャッシュ設計',
      status: 'IN_REVIEW',
      priority: 'MEDIUM',
      storyPoints: 3,
      sprintGoal: { id: 'sg-2', title: 'バックエンド最適化' },
    },
    {
      id: 'mock-ticket-3',
      ticketNumber: 31,
      title: 'Prismaスキーマのマイグレーション対応',
      status: 'DONE',
      priority: 'HIGH',
      storyPoints: 2,
      sprintGoal: null,
    },
  ],
  velocityHistory: [
    { sprintId: 'sp-1', sprintName: 'Sprint Q1-1', velocity: 28, endDate: new Date('2026-01-24').toISOString() },
    { sprintId: 'sp-2', sprintName: 'Sprint Q1-2', velocity: 31, endDate: new Date('2026-02-07').toISOString() },
    { sprintId: 'sp-3', sprintName: 'Sprint Q1-3', velocity: 26, endDate: new Date('2026-02-21').toISOString() },
    { sprintId: 'sp-4', sprintName: 'Sprint Q2-0', velocity: 34, endDate: new Date('2026-03-21').toISOString() },
  ],
  actionItems: [
    { id: 'ai-1', title: 'コードレビューの基準を明文化する', assigneeId: null, assigneeName: null, retroId: 'r-1', retroTitle: 'Sprint Q1-3 レトロ', createdAt: new Date('2026-03-22').toISOString() },
    { id: 'ai-2', title: 'デイリーの時間を15分に短縮する', assigneeId: null, assigneeName: 'Taro', retroId: 'r-1', retroTitle: 'Sprint Q1-3 レトロ', createdAt: new Date('2026-03-22').toISOString() },
  ],
  waRules: [
    { id: 'wa-1', title: 'コードレビューは24時間以内に行う', categoryName: 'コードレビュー' },
    { id: 'wa-2', title: 'PRは小さく保つ（300行以内）', categoryName: 'コードレビュー' },
    { id: 'wa-3', title: 'デイリーは10:00開始、15分以内', categoryName: 'ミーティングルール' },
  ],
};

// GET /summary
router.get('/summary', async (c) => {
  try {
    const user = c.get('user');
    const teamId = c.get('teamId');
    const data = await service.getDashboardSummary(user.organizationId, user.id, teamId);
    return c.json({ data });
  } catch (err) {
    // DB未接続などの場合はモックデータで返す（開発用）
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[dashboard] DB unavailable, returning mock data:', (err as Error).message);
      return c.json({ data: MOCK_SUMMARY });
    }
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default router;
