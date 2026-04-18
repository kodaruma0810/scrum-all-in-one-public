-- Convert enum column to text safely
ALTER TABLE "retro_items" ALTER COLUMN "type" TYPE TEXT USING "type"::TEXT;

-- Update fontColor default
ALTER TABLE "retro_items" ALTER COLUMN "fontColor" SET DEFAULT '#e2e8f0';

-- Add format column
ALTER TABLE "retrospectives" ADD COLUMN "format" TEXT NOT NULL DEFAULT 'KPT';

-- Drop the enum type
DROP TYPE IF EXISTS "RetroItemType";
