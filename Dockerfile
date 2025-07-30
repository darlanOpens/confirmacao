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

ENV PORT=3001
EXPOSE 3001

CMD ["/usr/local/bin/docker-entrypoint.sh"] 