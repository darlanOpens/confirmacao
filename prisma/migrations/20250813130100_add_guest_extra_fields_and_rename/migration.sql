-- Add extra fields to Guest table
ALTER TABLE "Guest" ADD COLUMN "nome_preferido" TEXT;
ALTER TABLE "Guest" ADD COLUMN "linkedin_url" TEXT;
ALTER TABLE "Guest" ADD COLUMN "tamanho_empresa" TEXT;
ALTER TABLE "Guest" ADD COLUMN "setor_atuacao" TEXT;
ALTER TABLE "Guest" ADD COLUMN "produtos_servicos" TEXT;
ALTER TABLE "Guest" ADD COLUMN "faturamento_anual" TEXT;
ALTER TABLE "Guest" ADD COLUMN "modelo_negocio" TEXT;

-- Rename table to lowercase
ALTER TABLE "Guest" RENAME TO "guest";
