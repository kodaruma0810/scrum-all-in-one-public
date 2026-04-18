-- CreateEnum
CREATE TYPE "RetroItemType" AS ENUM ('KEEP', 'PROBLEM', 'TRY');

-- CreateEnum
CREATE TYPE "RetroActionStatus" AS ENUM ('OPEN', 'DONE');

-- CreateTable
CREATE TABLE "retrospectives" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "sprintId" TEXT,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retrospectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retro_items" (
    "id" TEXT NOT NULL,
    "retrospectiveId" TEXT NOT NULL,
    "type" "RetroItemType" NOT NULL,
    "body" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retro_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retro_votes" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "retro_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retro_action_items" (
    "id" TEXT NOT NULL,
    "retrospectiveId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "assigneeId" TEXT,
    "status" "RetroActionStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retro_action_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "retro_votes_itemId_userId_key" ON "retro_votes"("itemId", "userId");

-- AddForeignKey
ALTER TABLE "retrospectives" ADD CONSTRAINT "retrospectives_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retrospectives" ADD CONSTRAINT "retrospectives_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "sprints"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retro_items" ADD CONSTRAINT "retro_items_retrospectiveId_fkey" FOREIGN KEY ("retrospectiveId") REFERENCES "retrospectives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retro_items" ADD CONSTRAINT "retro_items_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retro_votes" ADD CONSTRAINT "retro_votes_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "retro_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retro_votes" ADD CONSTRAINT "retro_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retro_action_items" ADD CONSTRAINT "retro_action_items_retrospectiveId_fkey" FOREIGN KEY ("retrospectiveId") REFERENCES "retrospectives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retro_action_items" ADD CONSTRAINT "retro_action_items_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
