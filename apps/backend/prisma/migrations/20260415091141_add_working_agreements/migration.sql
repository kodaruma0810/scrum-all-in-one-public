-- CreateEnum
CREATE TYPE "WAChangeType" AS ENUM ('CREATED', 'UPDATED', 'ACTIVATED', 'DEACTIVATED');

-- CreateTable
CREATE TABLE "working_agreement_categories" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "working_agreement_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "working_agreement_rules" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "agreedAt" DATE NOT NULL,
    "proposedById" TEXT NOT NULL,
    "lastModifiedById" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "working_agreement_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "working_agreement_history" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "changedById" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changeType" "WAChangeType" NOT NULL,
    "fieldName" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,

    CONSTRAINT "working_agreement_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "working_agreement_categories_teamId_name_key" ON "working_agreement_categories"("teamId", "name");

-- AddForeignKey
ALTER TABLE "working_agreement_categories" ADD CONSTRAINT "working_agreement_categories_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "working_agreement_rules" ADD CONSTRAINT "working_agreement_rules_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "working_agreement_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "working_agreement_rules" ADD CONSTRAINT "working_agreement_rules_proposedById_fkey" FOREIGN KEY ("proposedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "working_agreement_rules" ADD CONSTRAINT "working_agreement_rules_lastModifiedById_fkey" FOREIGN KEY ("lastModifiedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "working_agreement_history" ADD CONSTRAINT "working_agreement_history_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "working_agreement_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "working_agreement_history" ADD CONSTRAINT "working_agreement_history_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
