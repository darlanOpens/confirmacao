# Elga Guests - Sistema de Gerenciamento de Convidados

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Desenvolvimento Local

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

### Deploy com Docker

Para fazer deploy usando Docker Compose:

1. Configure as variáveis de ambiente (copie `.env.example` para `.env`)
2. Se necessário, defina portas diferentes para evitar conflitos:
   ```bash
   export APP_PORT=3002  # porta da aplicação (padrão: 3001)
   export DB_PORT=5433   # porta do banco (padrão: 5432)
   ```
3. Execute o deploy:
   ```bash
   docker compose up --build -d
   ```

**Nota**: Se você receber erro de porta já alocada, defina as variáveis `APP_PORT` e/ou `DB_PORT` com portas diferentes antes do deploy.

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
