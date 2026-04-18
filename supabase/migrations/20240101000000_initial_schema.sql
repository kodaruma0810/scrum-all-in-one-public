-- ============================================================
-- Scrum All-in-One: 初期スキーマ
-- Prisma schema.prisma から変換
-- ============================================================

-- ENUMs
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SCRUM_MASTER', 'PRODUCT_OWNER', 'DEVELOPER');
CREATE TYPE "VelocityMode" AS ENUM ('STORY_POINTS', 'TICKET_COUNT');
CREATE TYPE "GoalPriority" AS ENUM ('MUST_HAVE', 'SHOULD_HAVE', 'NICE_TO_HAVE');
CREATE TYPE "GoalStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'ACHIEVED', 'NOT_ACHIEVED', 'PARTIALLY_ACHIEVED');
CREATE TYPE "CommitmentType" AS ENUM ('COMMITTED', 'UNCOMMITTED');
CREATE TYPE "SprintStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'ARCHIVED');
CREATE TYPE "SprintGoalStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'ACHIEVED', 'NOT_ACHIEVED');
CREATE TYPE "TicketType" AS ENUM ('USER_STORY', 'TASK', 'BUG', 'SUBTASK');
CREATE TYPE "TicketStatus" AS ENUM ('BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE');
CREATE TYPE "TicketPriority" AS ENUM ('HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST');
CREATE TYPE "DsuMemberStatusType" AS ENUM ('PRESENT', 'ABSENT', 'REMOTE');

-- ============================================================
-- テーブル作成
-- ============================================================

-- 組織
CREATE TABLE organizations (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ユーザー
CREATE TABLE users (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email           TEXT NOT NULL UNIQUE,
  "passwordHash"  TEXT NOT NULL,
  name            TEXT NOT NULL,
  role            "UserRole" NOT NULL,
  "avatarUrl"     TEXT,
  "organizationId" TEXT NOT NULL REFERENCES organizations(id),
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- チーム
CREATE TABLE teams (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name            TEXT NOT NULL,
  "organizationId" TEXT NOT NULL REFERENCES organizations(id),
  "ticketPrefix"  TEXT NOT NULL DEFAULT 'SCR',
  "velocityMode"  "VelocityMode" NOT NULL DEFAULT 'STORY_POINTS',
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- チームメンバー
CREATE TABLE team_members (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "teamId"  TEXT NOT NULL REFERENCES teams(id),
  "userId"  TEXT NOT NULL REFERENCES users(id),
  "joinedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE ("teamId", "userId")
);

-- インクリメント
CREATE TABLE increments (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name            TEXT NOT NULL,
  "startDate"     TIMESTAMPTZ NOT NULL,
  "endDate"       TIMESTAMPTZ NOT NULL,
  description     TEXT,
  "teamId"        TEXT NOT NULL REFERENCES teams(id),
  "organizationId" TEXT NOT NULL REFERENCES organizations(id),
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 長期ゴール
CREATE TABLE long_term_goals (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title           TEXT NOT NULL,
  description     TEXT,
  priority        "GoalPriority" NOT NULL,
  status          "GoalStatus" NOT NULL DEFAULT 'NOT_STARTED',
  commitment      "CommitmentType" NOT NULL DEFAULT 'COMMITTED',
  "assigneeId"    TEXT REFERENCES users(id),
  "incrementId"   TEXT NOT NULL REFERENCES increments(id),
  "organizationId" TEXT NOT NULL REFERENCES organizations(id),
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- スプリント
CREATE TABLE sprints (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name            TEXT NOT NULL,
  "startDate"     TIMESTAMPTZ NOT NULL,
  "endDate"       TIMESTAMPTZ NOT NULL,
  status          "SprintStatus" NOT NULL DEFAULT 'PLANNED',
  goal            TEXT,
  velocity        DOUBLE PRECISION,
  "incrementId"   TEXT NOT NULL REFERENCES increments(id),
  "teamId"        TEXT NOT NULL REFERENCES teams(id),
  "organizationId" TEXT NOT NULL REFERENCES organizations(id),
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- スプリントゴール
CREATE TABLE sprint_goals (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title           TEXT NOT NULL,
  description     TEXT,
  status          "SprintGoalStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "longTermGoalId" TEXT REFERENCES long_term_goals(id),
  "sprintId"      TEXT NOT NULL REFERENCES sprints(id),
  "organizationId" TEXT NOT NULL REFERENCES organizations(id),
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- チケット
CREATE TABLE tickets (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "ticketNumber"  SERIAL,
  title           TEXT NOT NULL,
  description     TEXT,
  type            "TicketType" NOT NULL,
  status          "TicketStatus" NOT NULL DEFAULT 'BACKLOG',
  priority        "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
  "storyPoints"   INTEGER,
  "assigneeId"    TEXT REFERENCES users(id),
  "reporterId"    TEXT NOT NULL REFERENCES users(id),
  "sprintId"      TEXT REFERENCES sprints(id),
  "sprintGoalId"  TEXT REFERENCES sprint_goals(id),
  "parentId"      TEXT REFERENCES tickets(id),
  "organizationId" TEXT NOT NULL REFERENCES organizations(id),
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- チケットステータス履歴
CREATE TABLE ticket_status_history (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "ticketId"    TEXT NOT NULL REFERENCES tickets(id),
  "fromStatus"  "TicketStatus",
  "toStatus"    "TicketStatus" NOT NULL,
  "changedById" TEXT NOT NULL REFERENCES users(id),
  "changedAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- チケットコメント
CREATE TABLE ticket_comments (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  content     TEXT NOT NULL,
  "authorId"  TEXT NOT NULL REFERENCES users(id),
  "ticketId"  TEXT NOT NULL REFERENCES tickets(id),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- チケットラベル
CREATE TABLE ticket_labels (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name        TEXT NOT NULL,
  color       TEXT NOT NULL,
  "teamId"    TEXT NOT NULL REFERENCES teams(id),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- DoD チェック項目
CREATE TABLE dod_check_items (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title        TEXT NOT NULL,
  "teamId"     TEXT NOT NULL REFERENCES teams(id),
  "orderIndex" INTEGER NOT NULL,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- DoD チェック結果
CREATE TABLE dod_check_results (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "ticketId"    TEXT NOT NULL REFERENCES tickets(id),
  "dodItemId"   TEXT NOT NULL REFERENCES dod_check_items(id),
  checked       BOOLEAN NOT NULL DEFAULT false,
  "checkedById" TEXT REFERENCES users(id),
  "checkedAt"   TIMESTAMPTZ,
  UNIQUE ("ticketId", "dodItemId")
);

-- DSU ログ
CREATE TABLE dsu_logs (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sprintId"      TEXT NOT NULL REFERENCES sprints(id),
  date            DATE NOT NULL,
  notes           TEXT,
  "organizationId" TEXT NOT NULL REFERENCES organizations(id),
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE ("sprintId", date)
);

-- DSU メンバーステータス
CREATE TABLE dsu_member_statuses (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "dsuLogId"  TEXT NOT NULL REFERENCES dsu_logs(id),
  "userId"    TEXT NOT NULL REFERENCES users(id),
  yesterday   TEXT,
  today       TEXT,
  blockers    TEXT,
  status      "DsuMemberStatusType" NOT NULL DEFAULT 'PRESENT',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE ("dsuLogId", "userId")
);

-- チームカレンダー
CREATE TABLE team_calendars (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "teamId"    TEXT NOT NULL REFERENCES teams(id),
  "userId"    TEXT NOT NULL REFERENCES users(id),
  date        DATE NOT NULL,
  reason      TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- メンバーキャパシティ
CREATE TABLE member_capacities (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sprintId"      TEXT NOT NULL REFERENCES sprints(id),
  "userId"        TEXT NOT NULL REFERENCES users(id),
  "availableDays" DOUBLE PRECISION NOT NULL,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE ("sprintId", "userId")
);

-- システム設定
CREATE TABLE system_settings (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "organizationId" TEXT NOT NULL REFERENCES organizations(id),
  key             TEXT NOT NULL,
  value           TEXT NOT NULL,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE ("organizationId", key)
);

-- ============================================================
-- updatedAt 自動更新トリガー
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルにトリガーを設定
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'organizations', 'users', 'teams', 'increments',
      'long_term_goals', 'sprints', 'sprint_goals', 'tickets',
      'ticket_comments', 'dod_check_items', 'dsu_logs',
      'dsu_member_statuses', 'member_capacities', 'system_settings'
    ])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      tbl
    );
  END LOOP;
END;
$$;
