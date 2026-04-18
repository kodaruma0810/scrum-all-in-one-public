-- DropForeignKey
ALTER TABLE "working_agreement_rules" DROP CONSTRAINT "working_agreement_rules_categoryId_fkey";

-- AlterTable: add teamId as nullable first
ALTER TABLE "working_agreement_rules" ADD COLUMN "teamId" TEXT;

-- Backfill teamId from category
UPDATE "working_agreement_rules" r
SET "teamId" = c."teamId"
FROM "working_agreement_categories" c
WHERE r."categoryId" = c."id";

-- Make teamId NOT NULL after backfill
ALTER TABLE "working_agreement_rules" ALTER COLUMN "teamId" SET NOT NULL;

-- Make categoryId nullable
ALTER TABLE "working_agreement_rules" ALTER COLUMN "categoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "working_agreement_rules" ADD CONSTRAINT "working_agreement_rules_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey (SET NULL on delete instead of CASCADE)
ALTER TABLE "working_agreement_rules" ADD CONSTRAINT "working_agreement_rules_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "working_agreement_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
