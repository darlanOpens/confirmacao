-- ====================================
-- MIGRAÇÃO PARA SISTEMA DE EDIÇÕES
-- ====================================
-- Execute este script no banco de produção após configurar o acesso externo

-- 1. Criar tabela de edições de eventos
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

-- 2. Criar primeira edição (Janeiro 2025) se não existir
INSERT INTO "event_edition" ("nome", "descricao", "ativo", "arquivado")
SELECT 'Janeiro 2025', 'Evento de Janeiro 2025', true, false
WHERE NOT EXISTS (
    SELECT 1 FROM "event_edition" WHERE "ativo" = true
);

-- 3. Adicionar coluna edition_id na tabela guest
ALTER TABLE "guest"
ADD COLUMN IF NOT EXISTS "edition_id" INTEGER;

-- 4. Adicionar coluna edition_id na tabela preselection
ALTER TABLE "preselection"
ADD COLUMN IF NOT EXISTS "edition_id" INTEGER;

-- 5. Associar todos os dados existentes à primeira edição ativa
UPDATE "guest"
SET "edition_id" = (SELECT "id" FROM "event_edition" WHERE "ativo" = true LIMIT 1)
WHERE "edition_id" IS NULL;

UPDATE "preselection"
SET "edition_id" = (SELECT "id" FROM "event_edition" WHERE "ativo" = true LIMIT 1)
WHERE "edition_id" IS NULL;

-- 6. Adicionar chaves estrangeiras
ALTER TABLE "guest"
DROP CONSTRAINT IF EXISTS "guest_edition_fk";

ALTER TABLE "guest"
ADD CONSTRAINT "guest_edition_fk"
FOREIGN KEY ("edition_id") REFERENCES "event_edition"("id") ON DELETE SET NULL;

ALTER TABLE "preselection"
DROP CONSTRAINT IF EXISTS "preselection_edition_fk";

ALTER TABLE "preselection"
ADD CONSTRAINT "preselection_edition_fk"
FOREIGN KEY ("edition_id") REFERENCES "event_edition"("id") ON DELETE SET NULL;

-- 7. Remover constraint única antiga de email (se existir)
ALTER TABLE "guest"
DROP CONSTRAINT IF EXISTS "guest_email_key";

ALTER TABLE "preselection"
DROP CONSTRAINT IF EXISTS "preselection_email_key";

-- 8. Criar índices únicos compostos (email + edition_id)
CREATE UNIQUE INDEX IF NOT EXISTS "guest_email_edition_unique"
ON "guest"("email", "edition_id");

CREATE UNIQUE INDEX IF NOT EXISTS "preselection_email_edition_unique"
ON "preselection"("email", "edition_id");

-- 9. Verificar se a migração foi aplicada com sucesso
DO $$
BEGIN
    -- Verificar se a tabela event_edition existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_edition') THEN
        RAISE NOTICE 'Tabela event_edition criada com sucesso';
    END IF;

    -- Verificar se as colunas edition_id foram adicionadas
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guest' AND column_name = 'edition_id') THEN
        RAISE NOTICE 'Coluna edition_id adicionada à tabela guest';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'preselection' AND column_name = 'edition_id') THEN
        RAISE NOTICE 'Coluna edition_id adicionada à tabela preselection';
    END IF;

    -- Mostrar contagem de registros
    RAISE NOTICE 'Total de edições: %', (SELECT COUNT(*) FROM "event_edition");
    RAISE NOTICE 'Total de convidados: %', (SELECT COUNT(*) FROM "guest");
    RAISE NOTICE 'Total de pré-seleções: %', (SELECT COUNT(*) FROM "preselection");
END $$;

-- 10. Exibir status final
SELECT
    'Edições Ativas' as status,
    COUNT(*) as total
FROM "event_edition"
WHERE "ativo" = true
UNION ALL
SELECT
    'Convidados com Edição',
    COUNT(*)
FROM "guest"
WHERE "edition_id" IS NOT NULL
UNION ALL
SELECT
    'Pré-seleções com Edição',
    COUNT(*)
FROM "preselection"
WHERE "edition_id" IS NOT NULL;