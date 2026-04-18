-- CreateEnum
CREATE TYPE "SystemRole" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('SCRUM_MASTER', 'PRODUCT_OWNER', 'DEVELOPER');

-- Convert users.role from UserRole to SystemRole
-- ADMIN stays ADMIN, everything else becomes MEMBER
ALTER TABLE "users" ADD COLUMN "role_new" "SystemRole" NOT NULL DEFAULT 'MEMBER';
UPDATE "users" SET "role_new" = 'ADMIN' WHERE "role" = 'ADMIN';
UPDATE "users" SET "role_new" = 'MEMBER' WHERE "role" != 'ADMIN';
ALTER TABLE "users" DROP COLUMN "role";
ALTER TABLE "users" RENAME COLUMN "role_new" TO "role";

-- Convert team_members.role from UserRole to TeamRole
ALTER TABLE "team_members" ADD COLUMN "role_new" "TeamRole" NOT NULL DEFAULT 'DEVELOPER';
UPDATE "team_members" SET "role_new" = 'SCRUM_MASTER' WHERE "role" = 'SCRUM_MASTER';
UPDATE "team_members" SET "role_new" = 'PRODUCT_OWNER' WHERE "role" = 'PRODUCT_OWNER';
UPDATE "team_members" SET "role_new" = 'DEVELOPER' WHERE "role" NOT IN ('SCRUM_MASTER', 'PRODUCT_OWNER');
ALTER TABLE "team_members" DROP COLUMN "role";
ALTER TABLE "team_members" RENAME COLUMN "role_new" TO "role";

-- Drop old enum
DROP TYPE "UserRole";
