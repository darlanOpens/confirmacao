# Sistema de Edições de Evento - Instruções de Configuração

## 🎯 O que foi implementado

Criei um sistema completo de gerenciamento de edições de evento que permite:

- ✅ **Eventos Mensais Independentes**: Cada evento é uma edição separada com seus próprios convidados
- ✅ **Histórico Preservado**: Dados de eventos anteriores são mantidos para consulta
- ✅ **Interface Limpa**: Sempre mostra apenas o evento ativo
- ✅ **Arquivamento Automático**: Exporta CSVs e cria nova edição automaticamente
- ✅ **Gerenciamento Visual**: Nova aba "Gerenciar Eventos" no dashboard

## 📋 Como Ativar o Sistema

### 1. Aplicar as Migrações do Banco de Dados

Com o Docker rodando:

```bash
# Iniciar o Docker
docker compose up -d

# Aplicar a migração manual
docker exec -it confirmação-db-1 psql -U elga_user -d elga_db -f /prisma/migrations/manual_add_event_editions.sql

# OU se preferir usar o Prisma (quando o banco estiver acessível)
npx prisma migrate deploy
```

### 2. Verificar a Aplicação

Acesse `http://localhost:3001` e você verá:

- **Banner do Evento Atual**: No topo mostrando qual edição está ativa
- **Nova Aba "Gerenciar Eventos"**: Para criar novos eventos e arquivar o atual
- **Dados Filtrados**: Apenas convidados/pré-seleções do evento ativo aparecem

## 🔄 Fluxo de Trabalho

### Começar Novo Evento Mensal

1. Vá para a aba **"Gerenciar Eventos"**
2. Clique em **"Finalizar e Arquivar"** no evento atual
   - Sistema exporta automaticamente os CSVs
   - Cria nova edição para o próximo mês
3. Interface fica limpa e pronta para o novo evento

### Consultar Eventos Anteriores

1. Na aba **"Gerenciar Eventos"**
2. Veja o histórico com quantidade de convidados
3. Eventos arquivados ficam marcados como tal

### Trocar Entre Edições (se necessário)

1. Na lista de eventos, clique em **"Ativar"** em um evento não-ativo
2. Sistema troca para aquela edição
3. Todos os dados são filtrados automaticamente

## 🚀 Benefícios

- **Sem Perda de Dados**: Tudo fica preservado no banco
- **Exportação Automática**: CSVs gerados ao arquivar
- **Interface Sempre Limpa**: Cada evento começa do zero
- **Histórico Completo**: Consulte eventos passados quando necessário
- **Performance Otimizada**: Apenas dados do evento ativo são carregados

## ⚙️ Detalhes Técnicos

### Arquivos Modificados
- `prisma/schema.prisma`: Nova tabela EventEdition
- `src/components/EventManager.tsx`: Interface de gerenciamento
- `src/components/TabbedDashboard.tsx`: Integração do seletor
- APIs em `src/app/api/events/`: Endpoints de gerenciamento
- APIs existentes: Atualizadas para filtrar por edição

### Como Funciona
- Cada convidado/pré-seleção tem um `edition_id`
- Apenas uma edição pode estar ativa por vez
- APIs filtram automaticamente pela edição ativa
- Email pode se repetir em edições diferentes

## 🔧 Troubleshooting

### Se o banco não conectar
```bash
# Verificar se o Docker está rodando
docker ps

# Recriar containers se necessário
docker compose down
docker compose up --build
```

### Para aplicar migração manualmente
```bash
# Copiar arquivo SQL para o container
docker cp ./prisma/migrations/manual_add_event_editions.sql confirmação-db-1:/tmp/

# Executar dentro do container
docker exec -it confirmação-db-1 psql -U elga_user -d elga_db -f /tmp/manual_add_event_editions.sql
```

## 📝 Notas Importantes

- O sistema cria automaticamente uma edição se não existir nenhuma
- Nome padrão: "Mês Ano" (ex: "Janeiro 2025")
- Ao arquivar, próxima edição é criada automaticamente
- Dados existentes serão migrados para a primeira edição criada