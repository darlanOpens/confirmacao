#!/bin/bash

echo "🧹 Limpando containers e volumes do Docker..."

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado!"
    echo "📝 Copie o arquivo .env.example para .env primeiro:"
    echo "Copy-Item .env.example .env"
    echo ""
fi

# Parar e remover containers
echo "🛑 Parando containers..."
docker-compose down

# Remover volumes
echo "🗑️ Removendo volumes..."
docker volume rm elga-guests_db_data 2>/dev/null || true

# Remover imagens
echo "🗑️ Removendo imagens..."
docker rmi elga-guests-app 2>/dev/null || true

# Limpar cache do Docker
echo "🧹 Limpando cache..."
docker system prune -f

echo "✅ Limpeza concluída!"
echo ""
echo "🔍 Verificando configuração..."
if [ -f ".env" ]; then
    ./scripts/check-env.sh
else
    echo "📝 Configure o arquivo .env antes de continuar"
fi
echo ""
echo "🚀 Para subir novamente, execute:"
echo "docker-compose up --build"
