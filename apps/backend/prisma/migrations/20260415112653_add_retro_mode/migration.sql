-- CreateEnum
CREATE TYPE "RetroMode" AS ENUM ('CARD', 'BOARD');

-- AlterTable
ALTER TABLE "retrospectives" ADD COLUMN     "mode" "RetroMode" NOT NULL DEFAULT 'CARD';
