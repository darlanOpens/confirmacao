#!/bin/bash

echo "🔍 Verificando configuração do arquivo .env..."

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "📝 Copie o arquivo .env.example para .env:"
    echo "Copy-Item .env.example .env"
    exit 1
fi

echo "✅ Arquivo .env encontrado"

# Verificar variáveis essenciais
required_vars=("DATABASE_URL" "NEXT_PUBLIC_INVITE_BASE_URL" "INVITE_BASE_URL" "NOME_EVENTO")

for var in "${required_vars[@]}"; do
    if grep -q "^${var}=" .env; then
        value=$(grep "^${var}=" .env | cut -d'=' -f2-)
        if [ -z "$value" ]; then
            echo "⚠️  Variável $var está vazia"
        else
            echo "✅ Variável $var configurada"
        fi
    else
        echo "❌ Variável $var não encontrada no .env"
    fi
done

# Verificar DATABASE_URL específica
if grep -q "DATABASE_URL=" .env; then
    db_url=$(grep "^DATABASE_URL=" .env | cut -d'=' -f2-)
    if [[ $db_url == *"localhost"* ]]; then
        echo "⚠️  DATABASE_URL contém 'localhost' - certifique-se de usar 'db' para Docker"
    elif [[ $db_url == *"db:"* ]]; then
        echo "✅ DATABASE_URL configurada corretamente para Docker"
    fi
fi

echo ""
echo "📋 Próximos passos:"
echo "1. Se todas as variáveis estão ✅, execute: docker-compose up --build"
echo "2. Se há ❌ ou ⚠️, edite o arquivo .env e tente novamente"

