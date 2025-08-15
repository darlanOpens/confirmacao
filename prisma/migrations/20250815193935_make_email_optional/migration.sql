-- AlterTable
ALTER TABLE "public"."guest" RENAME CONSTRAINT "Guest_pkey" TO "guest_pkey";
ALTER TABLE "public"."guest" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "public"."guest" ALTER COLUMN "status" SET DEFAULT 'Convidado';

-- AlterTable
ALTER TABLE "public"."preselection" ALTER COLUMN "status" SET DEFAULT 'Pré Seleção';

-- RenameIndex
ALTER INDEX "public"."Guest_email_key" RENAME TO "guest_email_key";
