-- Atualiza registros legados no banco de dados
-- Objetivo: trocar status "pendente" (antigo) para "Pré Seleção" (novo)

UPDATE "preselection"
SET "status" = 'Pré Seleção'
WHERE LOWER("status") = 'pendente';

UPDATE "preselection"
SET "status" = 'Convidado'
WHERE LOWER("status") = 'convidado';


