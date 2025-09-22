# 📋 Checklist de Deploy para Produção

## ⚠️ Status Atual:
- ✅ Banco de dados migrado (tabela event_edition existe com dados)
- ❌ Código em produção está desatualizado

## 📦 Arquivos que DEVEM estar no deploy:

### 1. Schema do Prisma Atualizado
- [x] `/prisma/schema.prisma` - Com modelo EventEdition

### 2. APIs de Eventos (ESSENCIAIS!)
- [ ] `/src/app/api/events/list/route.ts` - Listar eventos
- [ ] `/src/app/api/events/active/route.ts` - Obter/criar evento ativo
- [ ] `/src/app/api/events/create/route.ts` - Criar novo evento
- [ ] `/src/app/api/events/archive/[id]/route.ts` - Arquivar evento
- [ ] `/src/app/api/events/switch/[id]/route.ts` - Trocar evento ativo

### 3. APIs Atualizadas (com edition_id)
- [ ] `/src/app/api/guests/route.ts` - Deve filtrar por edition_id
- [ ] `/src/app/api/guests/[id]/route.ts` - Deve considerar edition_id
- [ ] `/src/app/api/guests/batch/route.ts` - Deve adicionar edition_id
- [ ] `/src/app/api/guests/check/route.ts` - Deve filtrar por edition_id
- [ ] `/src/app/api/preselection/route.ts` - Deve filtrar por edition_id

### 4. Componentes de Interface
- [ ] `/src/components/EventManager.tsx` - Gerenciador de eventos
- [ ] `/src/app/TabbedDashboard.tsx` - Com integração do EventManager

### 5. Biblioteca Helper
- [ ] `/src/lib/edition.ts` - Funções helper para edições

## 🚀 Passos para Deploy:

### 1. Preparar Build
```bash
# Gerar cliente Prisma
npx prisma generate

# Build da aplicação
npm run build
```

### 2. Fazer Deploy no Easypanel
- Fazer push do código atualizado
- OU fazer upload dos arquivos manualmente
- Garantir que as variáveis de ambiente estão configuradas

### 3. No Easypanel, após deploy:
```bash
# Dentro do container da aplicação
npx prisma generate
```

### 4. Reiniciar a Aplicação
```bash
# No Easypanel ou via Docker
docker-compose restart app
```

## 🔍 Verificação Pós-Deploy:

1. **Testar API de listagem**:
   ```
   GET https://seu-dominio.com/api/events/list
   ```
   Deve retornar o evento Agosto 2025

2. **Verificar interface**:
   - Acessar Gerenciamento de Eventos
   - Deve mostrar "Agosto 2025" como evento ativo
   - Botão de edição deve abrir lista de eventos

3. **Testar criação**:
   - Tentar criar novo evento
   - Deve funcionar sem erros

## ⚡ Deploy Rápido (se usando Git):

```bash
# Commit das mudanças
git add .
git commit -m "Add event editions system"
git push origin main

# No servidor/Easypanel
git pull
npx prisma generate
npm run build
# Reiniciar aplicação
```

## 🆘 Se ainda houver problemas:

1. Verificar logs do container:
```bash
docker logs confirmacao-app-1
```

2. Verificar se Prisma está gerando corretamente:
```bash
docker exec confirmacao-app-1 npx prisma generate
```

3. Verificar conexão com banco:
```bash
docker exec confirmacao-app-1 npx prisma db pull
```