-- Add missing columns to users table
-- This fixes the error: "The column `users.major` does not exist in the current database."

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "major" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "settings" JSONB;

