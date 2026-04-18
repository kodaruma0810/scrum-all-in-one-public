-- AlterTable
ALTER TABLE "team_members" ADD COLUMN     "isOwner" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'DEVELOPER';
