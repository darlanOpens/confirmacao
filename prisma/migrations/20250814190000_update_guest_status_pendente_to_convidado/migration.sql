-- Atualiza registros legados no banco de dados
-- Objetivo: trocar status "pendente" (antigo) para "Pré Seleção" (novo)

UPDATE "guest"
SET "status" = 'Convidado'
WHERE LOWER("status") = 'pendente';



