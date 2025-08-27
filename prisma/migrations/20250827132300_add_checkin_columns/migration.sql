-- AlterTable
ALTER TABLE "guest" ADD COLUMN "data_checkin" TIMESTAMP(3);
ALTER TABLE "guest" ADD COLUMN "checkin_realizado" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "guest" ADD COLUMN "checkin_por" TEXT;

-- DropIndex (Remove unique constraint do email)
DROP INDEX IF EXISTS "guest_email_key";
DROP INDEX IF EXISTS "preselection_email_key";
