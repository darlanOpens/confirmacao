# Guia de Deploy - ELGA Guests

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
ENV DATABASE_URL="postgresql://build_user:build_pass@localhost:5432/build_db"
```

## Variáveis de Ambiente Necessárias

Copie o arquivo `.env.example` para `.env` e configure:

- `DATABASE_URL`: URL de conexão com o banco PostgreSQL
- `NEXT_PUBLIC_INVITE_BASE_URL`: URL base para convites (visível no frontend)
- `INVITE_BASE_URL`: URL base para convites (backend)
- `NOME_EVENTO`: Nome do evento
- `WEBHOOK_URL`: URL do webhook (opcional)
- `WEBHOOK_PRESELECTION_PROMOTED_URL`: URL do webhook para promoções (opcional)

## Estrutura do Build

1. **Etapa 1 - Builder:**
   - Copia arquivos de configuração e schema Prisma
   - Instala dependências
   - Gera cliente Prisma
   - Copia código fonte
   - Executa build do Next.js

2. **Etapa 2 - Produção:**
   - Copia artefatos do build
   - Configura entrypoint
   - Aguarda banco de dados
   - Executa migrações
   - Inicia aplicação

## Comandos Úteis

```bash
# Build local
npm run build

# Build para produção
npm run build:production

# Gerar cliente Prisma
npm run prisma:generate

# Executar migrações
npm run prisma:migrate
```

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