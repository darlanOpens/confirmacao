# 🔐 Configuração de Acesso ao Banco de Dados em Produção

## 📋 Configurações Disponíveis

O docker-compose foi atualizado para permitir configuração flexível do banco de dados através de variáveis de ambiente:

### Variáveis de Ambiente do Banco

| Variável | Descrição | Valor Padrão | Exemplo Produção |
|----------|-----------|--------------|------------------|
| `DB_USER` | Usuário do PostgreSQL | `elga_user` | `elga_prod_user` |
| `DB_PASSWORD` | Senha do PostgreSQL | `elga_pass` | `SenhaForte123!` |
| `DB_NAME` | Nome do banco de dados | `elga_db` | `elga_prod_db` |
| `DB_PORT` | Porta externa do banco | `5434` | `5434` |
| `DB_EXTERNAL_ACCESS` | IP de binding | `127.0.0.1` | `0.0.0.0` |

## 🚀 Como Configurar Acesso Externo

### 1. Configure as Variáveis de Ambiente

Crie um arquivo `.env.production` (ou edite o `.env` existente):

```env
# Credenciais personalizadas
DB_USER=elga_prod_user
DB_PASSWORD=SuaSenhaForte123!
DB_NAME=elga_prod_db

# Porta externa (certifique-se que está livre)
DB_PORT=5434

# IMPORTANTE: Permite acesso externo
DB_EXTERNAL_ACCESS=0.0.0.0

# URL de conexão para a aplicação
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
```

### 2. Reinicie os Containers

```bash
docker compose down
docker compose up -d
```

### 3. Configure o Firewall

**IMPORTANTE**: Configure o firewall do servidor para permitir apenas IPs autorizados:

```bash
# No servidor (exemplo com ufw)
sudo ufw allow from SEU_IP_LOCAL to any port 5434
```

### 4. Teste a Conexão Externa

Do seu computador local:

```bash
psql -h 191.101.18.181 -p 5434 -U elga_prod_user -d elga_prod_db
```

## 🔧 Aplicar Migrações do Sistema de Edições

### Opção 1: Conectar Externamente

```bash
# Do seu computador, após configurar acesso externo
psql -h 191.101.18.181 -p 5434 -U elga_prod_user -d elga_prod_db

# Cole e execute o SQL de migração
```

### Opção 2: Executar Dentro do Container

```bash
# No servidor
docker exec -it confirmacao-db-1 psql -U elga_prod_user -d elga_prod_db

# Ou executar arquivo SQL diretamente
docker cp ./prisma/migrations/manual_add_event_editions.sql confirmacao-db-1:/tmp/
docker exec -it confirmacao-db-1 psql -U elga_prod_user -d elga_prod_db -f /tmp/manual_add_event_editions.sql
```

## 📝 SQL de Migração para Sistema de Edições

```sql
-- 1. Criar tabela de edições
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

-- 2. Criar edição inicial
INSERT INTO "event_edition" ("nome", "descricao", "ativo", "arquivado")
SELECT 'Janeiro 2025', 'Evento de Janeiro 2025', true, false
WHERE NOT EXISTS (SELECT 1 FROM "event_edition");

-- 3. Adicionar coluna edition_id nas tabelas
ALTER TABLE "guest" ADD COLUMN IF NOT EXISTS "edition_id" INTEGER;
ALTER TABLE "preselection" ADD COLUMN IF NOT EXISTS "edition_id" INTEGER;

-- 4. Associar dados existentes à primeira edição
UPDATE "guest"
SET "edition_id" = (SELECT "id" FROM "event_edition" WHERE "ativo" = true LIMIT 1)
WHERE "edition_id" IS NULL;

UPDATE "preselection"
SET "edition_id" = (SELECT "id" FROM "event_edition" WHERE "ativo" = true LIMIT 1)
WHERE "edition_id" IS NULL;

-- 5. Adicionar constraints de foreign key
ALTER TABLE "guest"
ADD CONSTRAINT "guest_edition_fk"
FOREIGN KEY ("edition_id") REFERENCES "event_edition"("id") ON DELETE SET NULL;

ALTER TABLE "preselection"
ADD CONSTRAINT "preselection_edition_fk"
FOREIGN KEY ("edition_id") REFERENCES "event_edition"("id") ON DELETE SET NULL;

-- 6. Remover constraint única antiga de email (se existir)
ALTER TABLE "guest" DROP CONSTRAINT IF EXISTS "guest_email_key";
ALTER TABLE "preselection" DROP CONSTRAINT IF EXISTS "preselection_email_key";

-- 7. Criar índices únicos compostos (email + edition_id)
CREATE UNIQUE INDEX IF NOT EXISTS "guest_email_edition_unique"
ON "guest"("email", "edition_id");

CREATE UNIQUE INDEX IF NOT EXISTS "preselection_email_edition_unique"
ON "preselection"("email", "edition_id");
```

## ⚠️ Segurança

### Recomendações Importantes:

1. **Senhas Fortes**: Use senhas complexas para produção
2. **Firewall**: Configure para permitir apenas IPs específicos
3. **SSL/TLS**: Para produção real, configure conexão SSL
4. **Backups**: Faça backups regulares antes de migrações
5. **Logs**: Monitore logs de acesso ao banco

### Backup Antes de Migrar:

```bash
# Fazer backup completo
docker exec confirmacao-db-1 pg_dump -U elga_prod_user elga_prod_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurar Backup se Necessário:

```bash
# Restaurar backup
docker exec -i confirmacao-db-1 psql -U elga_prod_user elga_prod_db < backup.sql
```

## 🔄 Processo Completo de Deploy

1. **Configure variáveis** no Easypanel/servidor
2. **Deploy** da nova versão com docker-compose atualizado
3. **Teste** conexão com o banco
4. **Aplique** migrações SQL
5. **Verifique** que aplicação está funcionando
6. **Desative** acesso externo se não for mais necessário (DB_EXTERNAL_ACCESS=127.0.0.1)