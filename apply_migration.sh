#!/bin/bash
# ====================================
# Script para aplicar migração de edições
# ====================================

# Configurações padrão (podem ser sobrescritas por argumentos)
DB_HOST="${1:-191.101.18.181}"
DB_PORT="${2:-5434}"
DB_USER="${3:-elga_prod_user}"
DB_NAME="${4:-elga_prod_db}"

echo "======================================"
echo "Aplicando Migração de Sistema de Edições"
echo "======================================"
echo ""
echo "Configurações:"
echo "  Host: $DB_HOST"
echo "  Porta: $DB_PORT"
echo "  Usuário: $DB_USER"
echo "  Banco: $DB_NAME"
echo ""

# Verificar se o arquivo de migração existe
if [ ! -f "./prisma/migrations/add_event_editions.sql" ]; then
    echo "❌ Erro: Arquivo de migração não encontrado!"
    echo "    Esperado: ./prisma/migrations/add_event_editions.sql"
    exit 1
fi

# Solicitar senha
echo -n "Digite a senha do banco de dados: "
read -s DB_PASSWORD
echo ""

# Exportar senha para o psql
export PGPASSWORD="$DB_PASSWORD"

# Testar conexão
echo "📡 Testando conexão com o banco..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Erro: Não foi possível conectar ao banco de dados!"
    echo "    Verifique se:"
    echo "    1. O servidor está acessível"
    echo "    2. A porta $DB_PORT está liberada"
    echo "    3. As credenciais estão corretas"
    exit 1
fi

echo "✅ Conexão estabelecida com sucesso!"
echo ""

# Fazer backup antes da migração
echo "💾 Criando backup do banco..."
BACKUP_FILE="backup_before_editions_$(date +%Y%m%d_%H%M%S).sql"
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup criado: $BACKUP_FILE"
else
    echo "⚠️ Aviso: Não foi possível criar backup automático"
    echo -n "Deseja continuar sem backup? (s/N): "
    read CONTINUE
    if [ "$CONTINUE" != "s" ] && [ "$CONTINUE" != "S" ]; then
        echo "Migração cancelada."
        exit 0
    fi
fi

echo ""
echo "🚀 Aplicando migração..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "./prisma/migrations/add_event_editions.sql"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migração aplicada com sucesso!"
    echo ""

    # Verificar resultado
    echo "📊 Status do banco após migração:"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT 'Edições cadastradas' as item, COUNT(*) as total FROM event_edition
        UNION ALL
        SELECT 'Edições ativas', COUNT(*) FROM event_edition WHERE ativo = true
        UNION ALL
        SELECT 'Convidados com edição', COUNT(*) FROM guest WHERE edition_id IS NOT NULL
        UNION ALL
        SELECT 'Pré-seleções com edição', COUNT(*) FROM preselection WHERE edition_id IS NOT NULL;
    "
else
    echo ""
    echo "❌ Erro ao aplicar migração!"
    echo "    Verifique o log de erros acima"
    echo ""
    echo "Para restaurar o backup (se criado):"
    echo "psql -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME < $BACKUP_FILE"
    exit 1
fi

# Limpar variável de senha
unset PGPASSWORD

echo ""
echo "======================================"
echo "✅ Processo concluído!"
echo "======================================"
echo ""
echo "Próximos passos:"
echo "1. Teste a aplicação para verificar se está funcionando"
echo "2. Acesse a interface de gerenciamento de eventos"
echo "3. Verifique se os dados estão associados à edição correta"