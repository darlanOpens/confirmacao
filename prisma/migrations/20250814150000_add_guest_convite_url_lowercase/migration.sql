-- AlterTable
-- Garante a existência da coluna convite_url na tabela em minúsculas "guest"
ALTER TABLE "guest" ADD COLUMN IF NOT EXISTS "convite_url" TEXT NOT NULL DEFAULT '';


