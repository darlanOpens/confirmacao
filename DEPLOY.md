# ELGA Guests - Guia de Deploy

Este guia contém instruções e soluções para deploy da aplicação ELGA Guests, com foco no **Easypanel**.

## Deploy no Easypanel

### Pré-requisitos
1. Conta no Easypanel
2. Banco de dados PostgreSQL configurado
3. Repositório Git com o código

### Passos para Deploy

1. **Criar Nova Aplicação:**
   - No painel do Easypanel, clique em "Create App"
   - Escolha "From Git Repository"
   - Conecte seu repositório GitHub/GitLab

2. **Configurar Build:**
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Node Version: 18 ou superior

3. **Configurar Variáveis de Ambiente:**
   - Vá em "Environment Variables"
   - Adicione as variáveis listadas no arquivo `.env.example`
   - **Essenciais:**
     - `DATABASE_URL`: URL do seu banco PostgreSQL
     - `NEXT_PUBLIC_INVITE_BASE_URL`: URL do seu app no Easypanel
     - `NOME_EVENTO`: Nome do seu evento

4. **Deploy:**
   - Clique em "Deploy"
   - O Easypanel executará automaticamente as migrações do Prisma

## Problemas Comuns e Soluções

### 1. Erro: "Could not find Prisma Schema"

**Problema:** O Prisma não consegue encontrar o arquivo `schema.prisma` durante o build.

**Solução:** O Dockerfile foi corrigido para copiar o diretório `prisma` antes da instalação das dependências.

```dockerfile
# Copia arquivos de configuração e schema do Prisma primeiro
COPY package*.json ./
COPY prisma ./prisma

# Instala dependências
RUN npm install

# Gera o cliente Prisma explicitamente
RUN npx prisma generate
```

### 2. Erro: "Dynamic Server Usage"

**Problema:** Next.js tenta renderizar páginas estaticamente durante o build, mas encontra código dinâmico.

**Solução:** Configurado `export const dynamic = 'force-dynamic'` na página principal.

### 3. Erro: "Can't reach database server"

**Problema:** O build tenta conectar ao banco de dados que não está disponível durante o processo de build.

**Solução:** Configurada uma DATABASE_URL fictícia para o build:

```dockerfile
# Define uma DATABASE_URL fictícia para o build (evita erros de conexão)
ENV DATABASE_URL="postgresql://build_user:build_pass@db:5432/build_db"
```

## Configuração de Variáveis no Easypanel

### Variáveis Essenciais:
```
DATABASE_URL=postgresql://username:password@host:5432/database?schema=public
NEXT_PUBLIC_INVITE_BASE_URL=https://seu-app.easypanel.host
NOME_EVENTO=Nome do Seu Evento
```

### Variáveis Opcionais:
```
WEBHOOK_URL=https://hooks.slack.com/services/...
WEBHOOK_TOKEN=seu-token-webhook
NODE_ENV=production
PORT=3000
NEXT_TELEMETRY_DISABLED=1
```

### Como Configurar:
1. No painel do Easypanel, vá para sua aplicação
2. Clique em "Environment Variables"
3. Adicione cada variável individualmente
4. Salve e faça redeploy da aplicação

## Processo de Build no Easypanel

O Easypanel executa automaticamente os seguintes passos:

1. **Instalação de Dependências:**
   ```bash
   npm install
   ```

2. **Geração do Cliente Prisma:**
   ```bash
   npx prisma generate
   ```

3. **Execução das Migrações:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Build da Aplicação:**
   ```bash
   npm run build
   ```

5. **Inicialização:**
   ```bash
   npm start
   ```

## Comandos Úteis

### Para Desenvolvimento Local:
```bash
# Instalar dependências
npm install

# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev

# Iniciar desenvolvimento
npm run dev

# Build local
npm run build
```

### Para Troubleshooting no Easypanel:
```bash
# Ver logs da aplicação
# (disponível no painel do Easypanel)

# Executar migrações manualmente (se necessário)
npx prisma migrate deploy

# Verificar status do banco
npx prisma db pull
```

## Dicas Importantes para Easypanel

### ✅ Checklist Pré-Deploy:
- [ ] Banco PostgreSQL configurado e acessível
- [ ] Variáveis de ambiente configuradas no painel
- [ ] Repositório Git atualizado com as últimas alterações
- [ ] Build command: `npm run build`
- [ ] Start command: `npm start`
- [ ] Node.js versão 18 ou superior

### 🔧 Configurações Recomendadas:
- **Auto Deploy:** Ativado (para deploy automático a cada push)
- **Health Check:** `/api/health` (se disponível)
- **Port:** 3000 (padrão do Next.js)
- **Memory:** Mínimo 512MB recomendado

### 🚨 Problemas Comuns no Easypanel:

1. **Erro de Conexão com Banco:**
   - Verifique se a `DATABASE_URL` está correta
   - Confirme se o banco está acessível externamente
   - Teste a conexão usando um cliente PostgreSQL

2. **Build Falha:**
   - Verifique os logs de build no painel
   - Confirme se todas as dependências estão no `package.json`
   - Verifique se o Node.js está na versão correta

3. **Aplicação não Inicia:**
   - Verifique se o comando start está correto: `npm start`
   - Confirme se a porta 3000 está sendo usada
   - Verifique os logs de runtime no painel

### 📝 Logs e Monitoramento:
- Acesse os logs através do painel do Easypanel
- Monitore o uso de memória e CPU
- Configure alertas se disponível
- Use `console.log` para debug (visível nos logs)

## Troubleshooting

### Se o build falhar:

1. Verifique se o arquivo `prisma/schema.prisma` existe
2. Confirme que todas as variáveis de ambiente estão configuradas
3. Verifique se não há erros de TypeScript no código
4. Confirme que o `.dockerignore` não está excluindo arquivos necessários

### Se a aplicação não iniciar:

1. Verifique se o banco de dados está acessível
2. Confirme que as migrações foram executadas
3. Verifique os logs do container para erros específicos
4. Confirme que a `DATABASE_URL` está correta no ambiente de produção