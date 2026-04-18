-- ============================================================
-- シードデータ: ローカル開発用の初期データ
-- ============================================================

-- 組織作成
INSERT INTO organizations (id, name, slug)
VALUES ('org-default', 'Default Organization', 'default-org')
ON CONFLICT (slug) DO NOTHING;

-- 管理者ユーザー作成
-- パスワード: admin123 (bcrypt ハッシュ)
INSERT INTO users (id, email, "passwordHash", name, role, "organizationId")
VALUES (
  'user-admin',
  'admin@example.com',
  '$2a$10$rQEY0tJHzCvHNqz3JfKLOe6tCvPqE8TgQn1G9kS5F6nOJLqBFxKHe',
  'Admin User',
  'ADMIN',
  'org-default'
)
ON CONFLICT (email) DO NOTHING;

-- デフォルトチーム作成
INSERT INTO teams (id, name, "organizationId", "ticketPrefix", "velocityMode")
VALUES ('default-team-id', 'Development Team', 'org-default', 'SCR', 'STORY_POINTS')
ON CONFLICT (id) DO NOTHING;

-- 管理者をチームに追加
INSERT INTO team_members (id, "teamId", "userId")
VALUES ('tm-admin', 'default-team-id', 'user-admin')
ON CONFLICT ("teamId", "userId") DO NOTHING;
