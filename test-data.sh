#!/bin/bash

echo "🧪 Adicionando dados de teste..."

# Convidado 1 - João Silva (Convidado)
curl -s -X POST http://localhost:3001/api/convidados/add \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","email":"joao.silva@email.com","telefone":"11999999999","empresa":"Tech Solutions","cargo":"Desenvolvedor","convidado_por":"Maria Santos","status":"Convidado"}' | jq .

# Convidado 2 - Ana Costa (Confirmado)
curl -s -X POST http://localhost:3001/api/convidados/add \
  -H "Content-Type: application/json" \
  -d '{"nome":"Ana Costa","email":"ana.costa@email.com","telefone":"11888888888","empresa":"Design Studio","cargo":"Designer","convidado_por":"Carlos Lima","status":"Confirmado"}' | jq .

# Convidado 3 - Roberto Santos (Convidado)
curl -s -X POST http://localhost:3001/api/convidados/add \
  -H "Content-Type: application/json" \
  -d '{"nome":"Roberto Santos","email":"roberto.santos@email.com","telefone":"11777777777","empresa":"Marketing Pro","cargo":"Marketing Manager","convidado_por":"João Silva","status":"Convidado"}' | jq .

# Convidado 4 - Carla Oliveira (Confirmado)
curl -s -X POST http://localhost:3001/api/convidados/add \
  -H "Content-Type: application/json" \
  -d '{"nome":"Carla Oliveira","email":"carla.oliveira@email.com","telefone":"11666666666","empresa":"Consultoria XYZ","cargo":"Consultora","convidado_por":"Ana Costa","status":"Confirmado"}' | jq .

# Convidado 5 - Marcos Pereira (Cancelado)
curl -s -X POST http://localhost:3001/api/convidados/add \
  -H "Content-Type: application/json" \
  -d '{"nome":"Marcos Pereira","email":"marcos.pereira@email.com","telefone":"11555555555","empresa":"Finance Corp","cargo":"Analista Financeiro","convidado_por":"Roberto Santos","status":"Cancelado"}' | jq .

echo "✅ Concluiu adição de convidados!"

# Pré-seleção 1
curl -s -X POST http://localhost:3001/api/preselecao/add \
  -H "Content-Type: application/json" \
  -d '{"nome":"Lucas Mendes","email":"lucas.mendes@email.com","telefone":"11444444444","empresa":"Startup Tech","cargo":"CTO","convidado_por":"Maria Santos","status":"Pré-seleção"}' | jq .

# Pré-seleção 2
curl -s -X POST http://localhost:3001/api/preselecao/add \
  -H "Content-Type: application/json" \
  -d '{"nome":"Patricia Lima","email":"patricia.lima@email.com","telefone":"11333333333","empresa":"Innovation Labs","cargo":"Product Manager","convidado_por":"João Silva","status":"Pré-seleção"}' | jq .

# Pré-seleção 3
curl -s -X POST http://localhost:3001/api/preselecao/add \
  -H "Content-Type: application/json" \
  -d '{"nome":"Fernando Costa","email":"fernando.costa@email.com","telefone":"11222222222","empresa":"Digital Agency","cargo":"Diretor Criativo","convidado_por":"Ana Costa","status":"Pré-seleção"}' | jq .

echo "✅ Concluiu adição de pré-seleções!"

echo "🎉 Todos os dados de teste foram adicionados!"
