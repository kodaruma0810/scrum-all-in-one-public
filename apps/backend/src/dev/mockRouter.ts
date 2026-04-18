/**
 * 開発用モックルーター
 * DATABASE_URL が未設定の環境でUIを確認するためのモックデータを返す。
 * NODE_ENV=production では使用されない。
 */
import { Hono } from 'hono';

const r = new Hono();

// ─── 共通モックデータ ───────────────────────────────────────────

const NOW = new Date('2026-04-13').toISOString();

const MOCK_USER = { id: 'dev-user-id', name: '開発ユーザー', email: 'dev@example.com', avatarUrl: null };

const MOCK_SPRINT = {
  id: 'mock-sprint-1',
  name: 'Sprint 2026-Q2-1',
  startDate: '2026-04-07T00:00:00.000Z',
  endDate: '2026-04-18T00:00:00.000Z',
  status: 'ACTIVE',
  goal: 'ホームダッシュボードとDSU機能を完成させる',
  velocity: null,
  incrementId: 'mock-inc-1',
  teamId: 'mock-team-1',
  organizationId: 'dev-org-id',
  createdAt: NOW,
  updatedAt: NOW,
};

const MOCK_SPRINT_GOALS = [
  {
    id: 'mock-sg-1',
    title: 'ホームダッシュボード完成',
    description: '全ウィジェットの実装とレイアウト調整',
    status: 'IN_PROGRESS',
    sprintId: 'mock-sprint-1',
    longTermGoalId: 'mock-ltg-1',
    organizationId: 'dev-org-id',
    createdAt: NOW,
    updatedAt: NOW,
    longTermGoal: { id: 'mock-ltg-1', title: '認証・権限管理の完全実装' },
    tickets: [
      { id: 'mock-ticket-1', status: 'IN_PROGRESS', storyPoints: 5 },
      { id: 'mock-ticket-4', status: 'TODO', storyPoints: 3 },
    ],
  },
  {
    id: 'mock-sg-2',
    title: 'バックエンド最適化',
    description: 'APIレスポンスのキャッシュとクエリ改善',
    status: 'NOT_STARTED',
    sprintId: 'mock-sprint-1',
    longTermGoalId: 'mock-ltg-1',
    organizationId: 'dev-org-id',
    createdAt: NOW,
    updatedAt: NOW,
    longTermGoal: { id: 'mock-ltg-1', title: '認証・権限管理の完全実装' },
    tickets: [
      { id: 'mock-ticket-2', status: 'IN_REVIEW', storyPoints: 3 },
      { id: 'mock-ticket-3', status: 'DONE', storyPoints: 2 },
    ],
  },
];

const MOCK_TICKETS = [
  {
    id: 'mock-ticket-1',
    ticketNumber: 42,
    title: 'ダッシュボードウィジェットのレイアウト実装',
    description: '各ウィジェットをグリッドレイアウトで配置する',
    type: 'TASK',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    storyPoints: 5,
    assigneeId: 'dev-user-id',
    reporterId: 'dev-user-id',
    sprintId: 'mock-sprint-1',
    sprintGoalId: 'mock-sg-1',
    parentId: null,
    organizationId: 'dev-org-id',
    createdAt: NOW,
    updatedAt: NOW,
    assignee: MOCK_USER,
    reporter: MOCK_USER,
    sprint: { id: 'mock-sprint-1', name: 'Sprint 2026-Q2-1' },
    sprintGoal: { id: 'mock-sg-1', title: 'ホームダッシュボード完成' },
    subtasks: [],
    dodCheckResults: [],
  },
  {
    id: 'mock-ticket-2',
    ticketNumber: 38,
    title: 'APIレスポンスのキャッシュ設計',
    description: 'RedisでAPIキャッシュを実装する',
    type: 'TASK',
    status: 'IN_REVIEW',
    priority: 'MEDIUM',
    storyPoints: 3,
    assigneeId: 'dev-user-id',
    reporterId: 'dev-user-id',
    sprintId: 'mock-sprint-1',
    sprintGoalId: 'mock-sg-2',
    parentId: null,
    organizationId: 'dev-org-id',
    createdAt: NOW,
    updatedAt: NOW,
    assignee: MOCK_USER,
    reporter: MOCK_USER,
    sprint: { id: 'mock-sprint-1', name: 'Sprint 2026-Q2-1' },
    sprintGoal: { id: 'mock-sg-2', title: 'バックエンド最適化' },
    subtasks: [],
    dodCheckResults: [],
  },
  {
    id: 'mock-ticket-3',
    ticketNumber: 31,
    title: 'Prismaスキーマのマイグレーション対応',
    description: null,
    type: 'TASK',
    status: 'DONE',
    priority: 'HIGH',
    storyPoints: 2,
    assigneeId: 'dev-user-id',
    reporterId: 'dev-user-id',
    sprintId: 'mock-sprint-1',
    sprintGoalId: 'mock-sg-2',
    parentId: null,
    organizationId: 'dev-org-id',
    createdAt: NOW,
    updatedAt: NOW,
    assignee: MOCK_USER,
    reporter: MOCK_USER,
    sprint: { id: 'mock-sprint-1', name: 'Sprint 2026-Q2-1' },
    sprintGoal: { id: 'mock-sg-2', title: 'バックエンド最適化' },
    subtasks: [],
    dodCheckResults: [],
  },
  {
    id: 'mock-ticket-4',
    ticketNumber: 44,
    title: 'ユーザー認証フローの実装',
    description: 'JWTを使ったログイン・リフレッシュトークン対応',
    type: 'USER_STORY',
    status: 'TODO',
    priority: 'HIGH',
    storyPoints: 3,
    assigneeId: 'dev-user-id',
    reporterId: 'dev-user-id',
    sprintId: 'mock-sprint-1',
    sprintGoalId: 'mock-sg-1',
    parentId: null,
    organizationId: 'dev-org-id',
    createdAt: NOW,
    updatedAt: NOW,
    assignee: MOCK_USER,
    reporter: MOCK_USER,
    sprint: { id: 'mock-sprint-1', name: 'Sprint 2026-Q2-1' },
    sprintGoal: { id: 'mock-sg-1', title: 'ホームダッシュボード完成' },
    subtasks: [],
    dodCheckResults: [],
  },
];

const MOCK_BACKLOG = [
  {
    id: 'mock-ticket-5',
    ticketNumber: 50,
    title: 'グローバル検索UIの実装',
    description: 'Cmd+Kショートカットで起動する検索バー',
    type: 'USER_STORY',
    status: 'BACKLOG',
    priority: 'MEDIUM',
    storyPoints: 8,
    assigneeId: null,
    reporterId: 'dev-user-id',
    sprintId: null,
    sprintGoalId: null,
    parentId: null,
    organizationId: 'dev-org-id',
    createdAt: NOW,
    updatedAt: NOW,
    assignee: null,
    reporter: MOCK_USER,
    sprint: null,
    sprintGoal: null,
    subtasks: [],
    dodCheckResults: [],
  },
  {
    id: 'mock-ticket-6',
    ticketNumber: 51,
    title: 'チームカレンダーの休暇登録UI',
    description: null,
    type: 'TASK',
    status: 'BACKLOG',
    priority: 'LOW',
    storyPoints: 3,
    assigneeId: null,
    reporterId: 'dev-user-id',
    sprintId: null,
    sprintGoalId: null,
    parentId: null,
    organizationId: 'dev-org-id',
    createdAt: NOW,
    updatedAt: NOW,
    assignee: null,
    reporter: MOCK_USER,
    sprint: null,
    sprintGoal: null,
    subtasks: [],
    dodCheckResults: [],
  },
];

const MOCK_INCREMENT = {
  id: 'mock-inc-1',
  name: 'PI 2026-Q2',
  startDate: '2026-04-01T00:00:00.000Z',
  endDate: '2026-06-30T00:00:00.000Z',
  description: '2026年Q2のプロダクトインクリメント',
  teamId: 'mock-team-1',
  organizationId: 'dev-org-id',
  createdAt: NOW,
  updatedAt: NOW,
};

const MOCK_LONG_TERM_GOALS = [
  {
    id: 'mock-ltg-1',
    title: '認証・権限管理の完全実装',
    description: 'JWT認証、ロール管理、パーミッション制御を完成させる',
    priority: 'MUST_HAVE',
    status: 'IN_PROGRESS',
    commitment: 'COMMITTED',
    assigneeId: 'dev-user-id',
    incrementId: 'mock-inc-1',
    organizationId: 'dev-org-id',
    createdAt: NOW,
    updatedAt: NOW,
    assignee: MOCK_USER,
    sprintGoals: MOCK_SPRINT_GOALS,
  },
  {
    id: 'mock-ltg-2',
    title: 'DSUダッシュボードの刷新',
    description: 'リアルタイム進捗表示とメンバーステータス入力を改善',
    priority: 'SHOULD_HAVE',
    status: 'ACHIEVED',
    commitment: 'COMMITTED',
    assigneeId: null,
    incrementId: 'mock-inc-1',
    organizationId: 'dev-org-id',
    createdAt: NOW,
    updatedAt: NOW,
    assignee: null,
    sprintGoals: [],
  },
  {
    id: 'mock-ltg-3',
    title: 'グローバル検索機能の導入',
    description: 'pg_bigmを使った日本語全文検索',
    priority: 'NICE_TO_HAVE',
    status: 'NOT_STARTED',
    commitment: 'UNCOMMITTED',
    assigneeId: null,
    incrementId: 'mock-inc-1',
    organizationId: 'dev-org-id',
    createdAt: NOW,
    updatedAt: NOW,
    assignee: null,
    sprintGoals: [],
  },
];

const MOCK_VELOCITY = [
  { id: 'sp-1', name: 'Sprint Q1-1', velocity: 28, endDate: '2026-01-24T00:00:00.000Z', status: 'COMPLETED' },
  { id: 'sp-2', name: 'Sprint Q1-2', velocity: 31, endDate: '2026-02-07T00:00:00.000Z', status: 'COMPLETED' },
  { id: 'sp-3', name: 'Sprint Q1-3', velocity: 26, endDate: '2026-02-21T00:00:00.000Z', status: 'COMPLETED' },
  { id: 'sp-4', name: 'Sprint Q2-0', velocity: 34, endDate: '2026-03-21T00:00:00.000Z', status: 'COMPLETED' },
];

const MOCK_BURNDOWN = Array.from({ length: 10 }, (_, i) => ({
  date: new Date(Date.parse('2026-04-07') + i * 86400000).toISOString().split('T')[0],
  remainingPoints: Math.max(0, 34 - i * 4 + (i === 0 ? 0 : Math.floor(Math.random() * 2))),
  idealPoints: 34 - i * (34 / 9),
}));

const MOCK_DSU = {
  sprint: {
    ...MOCK_SPRINT,
    sprintGoals: MOCK_SPRINT_GOALS,
    tickets: MOCK_TICKETS.map((t) => ({ id: t.id, status: t.status, storyPoints: t.storyPoints })),
    memberCapacities: [
      { id: 'mc-1', userId: 'dev-user-id', availableDays: 8, user: MOCK_USER },
    ],
  },
  dsuLog: {
    id: 'mock-dsu-log-1',
    sprintId: 'mock-sprint-1',
    date: '2026-04-13',
    notes: null,
    organizationId: 'dev-org-id',
    createdAt: NOW,
    updatedAt: NOW,
    memberStatuses: [
      {
        id: 'ms-1',
        dsuLogId: 'mock-dsu-log-1',
        userId: 'dev-user-id',
        yesterday: 'ダッシュボードのSprintSummaryWidgetを実装した',
        today: 'VelocityMiniChartの実装を進める',
        blockers: null,
        status: 'PRESENT',
        createdAt: NOW,
        updatedAt: NOW,
        user: MOCK_USER,
      },
    ],
  },
};

// ─── tickets ───────────────────────────────────────────────────

r.get('/tickets/backlog', (c) => c.json({ data: MOCK_BACKLOG }));

r.get('/tickets/sprint/:sprintId/burndown', (c) => c.json({ data: MOCK_BURNDOWN }));

r.get('/tickets', (c) => {
  const { sprintId, status } = c.req.query();
  let data = MOCK_TICKETS;
  if (sprintId) data = data.filter((t) => t.sprintId === sprintId);
  if (status) data = data.filter((t) => t.status === status);
  return c.json({ data });
});

r.get('/tickets/:id', (c) => {
  const ticket = MOCK_TICKETS.find((t) => t.id === c.req.param('id')) ?? MOCK_TICKETS[0];
  return c.json({ data: ticket });
});

r.get('/tickets/:id/comments', (c) => c.json({ data: [] }));

// ─── goals ─────────────────────────────────────────────────────

r.get('/goals/increments', (c) => c.json({ data: [MOCK_INCREMENT] }));

r.get('/goals/increments/:id', (c) => c.json({ data: MOCK_INCREMENT }));

r.get('/goals/increments/:id/goals', (c) => c.json({ data: MOCK_LONG_TERM_GOALS }));

r.get('/goals/increments/:id/hierarchy', (c) =>
  c.json({
    data: MOCK_LONG_TERM_GOALS.map((g) => ({
      ...g,
      sprintGoals: MOCK_SPRINT_GOALS.filter((sg) => sg.longTermGoalId === g.id).map((sg) => ({
        ...sg,
        tickets: MOCK_TICKETS.filter((t) => t.sprintGoalId === sg.id),
      })),
    })),
  })
);

r.get('/goals/increments/:id/progress', (c) =>
  c.json({
    data: {
      incrementId: 'mock-inc-1',
      totalGoals: 3,
      achievedGoals: 1,
      progressRate: 33,
      goals: MOCK_LONG_TERM_GOALS.map((g) => ({
        id: g.id,
        title: g.title,
        status: g.status,
        sprintGoalCount: g.sprintGoals.length,
        achievedSprintGoalCount: g.sprintGoals.filter((sg) => sg.status === 'ACHIEVED').length,
      })),
    },
  })
);

r.get('/goals/sprints/:sprintId/goals', (c) => c.json({ data: MOCK_SPRINT_GOALS }));

// ─── sprints ────────────────────────────────────────────────────

r.get('/sprints/velocity', (c) => c.json({ data: MOCK_VELOCITY }));

r.get('/sprints/team/calendar', (c) => c.json({ data: [] }));

r.get('/sprints/holidays', (c) => c.json({ data: [] }));

r.get('/sprints', (c) => c.json({ data: [MOCK_SPRINT] }));

r.get('/sprints/:id', (c) =>
  c.json({
    data: {
      ...MOCK_SPRINT,
      sprintGoals: MOCK_SPRINT_GOALS,
      tickets: MOCK_TICKETS,
      memberCapacities: [{ id: 'mc-1', userId: 'dev-user-id', availableDays: 8, user: MOCK_USER }],
    },
  })
);

r.get('/sprints/:id/capacity', (c) =>
  c.json({ data: [{ id: 'mc-1', userId: 'dev-user-id', availableDays: 8, user: MOCK_USER }] })
);

// ─── dsu ────────────────────────────────────────────────────────

r.get('/dsu/today', (c) => c.json({ data: MOCK_DSU }));

r.get('/dsu/history', (c) =>
  c.json({
    data: [
      {
        id: 'mock-dsu-log-1',
        sprintId: 'mock-sprint-1',
        date: '2026-04-13',
        notes: null,
        organizationId: 'dev-org-id',
        createdAt: NOW,
        updatedAt: NOW,
        memberStatuses: MOCK_DSU.dsuLog.memberStatuses,
      },
    ],
  })
);

r.get('/dsu/:id', (c) => c.json({ data: MOCK_DSU.dsuLog }));

// ─── dashboard ─────────────────────────────────────────────────
// (dashboard/routes.ts 側で既にモック実装済み。ここでは補完のみ)

export default r;
