-- Criar tabela EventEdition
CREATE TABLE IF NOT EXISTS "event_edition" (
    "id" SERIAL PRIMARY KEY,
    "nome" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "data_inicio" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_fim" TIMESTAMP,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "arquivado" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar coluna edition_id em guest
ALTER TABLE "guest"
ADD COLUMN IF NOT EXISTS "edition_id" INTEGER,
ADD CONSTRAINT "guest_edition_fk"
    FOREIGN KEY ("edition_id")
    REFERENCES "event_edition"("id")
    ON DELETE SET NULL;

-- Remover constraint único de email em guest
ALTER TABLE "guest" DROP CONSTRAINT IF EXISTS "guest_email_key";

-- Criar índice único composto para guest (email + edition_id)
CREATE UNIQUE INDEX IF NOT EXISTS "guest_email_edition_unique"
ON "guest"("email", "edition_id");

-- Adicionar coluna edition_id em preselection
ALTER TABLE "preselection"
ADD COLUMN IF NOT EXISTS "edition_id" INTEGER,
ADD CONSTRAINT "preselection_edition_fk"
    FOREIGN KEY ("edition_id")
    REFERENCES "event_edition"("id")
    ON DELETE SET NULL;

-- Remover constraint único de email em preselection
ALTER TABLE "preselection" DROP CONSTRAINT IF EXISTS "preselection_email_key";

-- Criar índice único composto para preselection (email + edition_id)
CREATE UNIQUE INDEX IF NOT EXISTS "preselection_email_edition_unique"
ON "preselection"("email", "edition_id");

-- Criar edição inicial se não existir nenhuma
INSERT INTO "event_edition" ("nome", "descricao", "ativo", "arquivado")
SELECT 'Janeiro 2025', 'Evento de Janeiro 2025', true, false
WHERE NOT EXISTS (SELECT 1 FROM "event_edition");

-- Atualizar registros existentes para pertencer à primeira edição
UPDATE "guest"
SET "edition_id" = (SELECT "id" FROM "event_edition" WHERE "ativo" = true LIMIT 1)
WHERE "edition_id" IS NULL;

UPDATE "preselection"
SET "edition_id" = (SELECT "id" FROM "event_edition" WHERE "ativo" = true LIMIT 1)
WHERE "edition_id" IS NULL;