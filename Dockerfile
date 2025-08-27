# Etapa 1: build da aplicação
FROM node:18-alpine AS builder
WORKDIR /app

# Copia arquivos de configuração e schema do Prisma primeiro (para otimizar cache)
COPY package*.json ./
COPY package-lock.json ./
COPY prisma ./prisma

# Instala todas as dependências (necessário para build do Next.js)
RUN npm ci && npm cache clean --force

# Gera o cliente Prisma explicitamente
RUN npx prisma generate

# Copia somente os arquivos necessários para o build
COPY next.config.ts ./
COPY tsconfig.json ./
COPY postcss.config.mjs ./
COPY tailwind.config.js ./
COPY public ./public
COPY src ./src

# Aceita variáveis de ambiente para o build (importante para NEXT_PUBLIC_*)
ARG NEXT_PUBLIC_INVITE_BASE_URL
ARG INVITE_BASE_URL
ARG WEBHOOK_URL
ARG WEBHOOK_PRESELECTION_PROMOTED_URL
ARG NOME_EVENTO
ARG DATABASE_URL

# Define as variáveis de ambiente para o build
ENV NEXT_PUBLIC_INVITE_BASE_URL=$NEXT_PUBLIC_INVITE_BASE_URL
ENV INVITE_BASE_URL=$INVITE_BASE_URL
ENV WEBHOOK_URL=$WEBHOOK_URL
ENV WEBHOOK_PRESELECTION_PROMOTED_URL=$WEBHOOK_PRESELECTION_PROMOTED_URL
ENV NOME_EVENTO=$NOME_EVENTO
# Define DATABASE_URL temporária para o build (será sobrescrita em produção)
ENV DATABASE_URL=${DATABASE_URL:-"postgresql://user:password@localhost:5432/db?schema=public"}

# Build da aplicação
RUN npm run build

# Etapa 2: imagem final de produção
FROM node:18-alpine

# Instalar netcat para teste de conexão
RUN apk add --no-cache netcat-openbsd

WORKDIR /app

# Copia arquivos necessários
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# Instala apenas dependências de produção e limpa cache
COPY --from=builder /app/package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar script de entrada
COPY scripts/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
# Converter finais de linha CRLF para LF (evita erro "no such file or directory" em Alpine)
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh

ENV PORT=3001
EXPOSE 3001

CMD ["/usr/local/bin/docker-entrypoint.sh"]