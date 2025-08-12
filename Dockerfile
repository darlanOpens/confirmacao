# Etapa 1: build da aplicação
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install

# Copia somente os arquivos necessários para o build
COPY next.config.ts ./
COPY tsconfig.json ./
COPY postcss.config.mjs ./
COPY tailwind.config.js ./
COPY public ./public
COPY src ./src
COPY prisma ./prisma

# Define uma DATABASE_URL padrão para o build (será sobrescrita no runtime)
ENV DATABASE_URL="postgresql://elga_user:elga_pass@db:5432/elga_db"

# Aceita variáveis de ambiente para o build (importante para NEXT_PUBLIC_*)
ARG NEXT_PUBLIC_INVITE_BASE_URL
ARG INVITE_BASE_URL
ARG WEBHOOK_URL

# Define as variáveis de ambiente para o build
ENV NEXT_PUBLIC_INVITE_BASE_URL=$NEXT_PUBLIC_INVITE_BASE_URL
ENV INVITE_BASE_URL=$INVITE_BASE_URL
ENV WEBHOOK_URL=$WEBHOOK_URL

RUN npx prisma generate
RUN npm run build

# Etapa 2: imagem final de produção
FROM node:18-alpine

# Instalar netcat para teste de conexão
RUN apk add --no-cache netcat-openbsd

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# Copiar script de entrada
COPY scripts/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Define DATABASE_URL padrão (será sobrescrita pelo Easypanel)
ENV DATABASE_URL="postgresql://elga_user:elga_pass@db:5432/elga_db"

ENV PORT=3000
EXPOSE 3000

CMD ["/usr/local/bin/docker-entrypoint.sh"] 