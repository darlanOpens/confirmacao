# Elga Guests - Sistema de Gerenciamento de Convidados

Este é um projeto [Next.js](https://nextjs.org) para gerenciamento de convidados do evento Elga.

## Configuração do Ambiente

### Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure as seguintes variáveis:

```bash
# Configurações do Banco de Dados
DB_PORT=5434                    # Porta externa do PostgreSQL (padrão: 5434)

# Configurações da Aplicação
NEXT_PUBLIC_INVITE_BASE_URL=    # URL base para convites
INVITE_BASE_URL=               # URL base para convites (backend)
WEBHOOK_URL=                   # URL do webhook
DATABASE_URL=                  # URL de conexão com o banco de dados
```

### Resolução de Conflitos de Porta

Se a porta 5434 já estiver em uso, você pode alterar a variável `DB_PORT` para uma porta disponível:

```bash
DB_PORT=5435  # Usar porta 5435 em vez de 5434
```

Ou usar o script PowerShell:

```powershell
.\deploy.ps1 5435  # Deploy com porta 5435
```

## Getting Started

Para desenvolvimento local:

```bash
npm run dev
```

Para produção com Docker:

```bash
docker compose up --build
```

## Estrutura do Projeto

- `src/app/` - Páginas e rotas da aplicação
- `src/components/` - Componentes React
- `src/lib/` - Utilitários e configurações
- `prisma/` - Schema e migrações do banco de dados

## Deploy

O projeto está configurado para deploy no Easypanel com suporte a variáveis de ambiente configuráveis.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
