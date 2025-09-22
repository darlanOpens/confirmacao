# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sistema de Gerenciamento de Convidados Elga - A Next.js application for managing event guests with pre-selection workflow, built with TypeScript, Prisma ORM, Material-UI, and PostgreSQL.

## Development Commands

```bash
# Development with Turbopack (faster HMR)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Database migrations
npx prisma migrate dev
npx prisma generate
npx prisma studio  # Visual database browser

# Docker deployment
docker compose up --build

# PowerShell deployment with custom ports
.\deploy.ps1 [porta_db] [porta_app]  # e.g., .\deploy.ps1 5435 3002
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15.4 with App Router, React 19, TypeScript
- **UI Components**: Material-UI (MUI) v6
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS v4
- **Data Processing**: CSV import/export with Papa Parse and json2csv

### Directory Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components (MUI-based)
  - `TabbedDashboard.tsx` - Main dashboard with Guests/Pre-selection tabs
  - `GuestPage.tsx` - Guest management interface
  - `PreselectionPage.tsx` - Pre-selection candidate interface
- `src/lib/` - Utilities (prisma.ts for database connection)
- `prisma/` - Database schema and migrations
- API Routes under `src/app/api/`:
  - `/convidados/` - Guest CRUD operations
  - `/preselecao/` - Pre-selection management
  - `/confirm/` - Guest confirmation endpoint

### Key Application Flow

1. **Two-stage Guest Management**:
   - Pre-selection table: Initial candidate pool
   - Guest table: Confirmed invitees (promoted from pre-selection)

2. **Data Flow Pattern**:
   - Server Components fetch data via API routes with fallback to direct DB
   - API routes use Prisma client from `src/lib/prisma.ts`
   - Client components use fetch for mutations

3. **Environment Configuration**:
   - Configurable ports via `DB_PORT` and `APP_PORT` environment variables
   - Default: DB on 5434, App on 3001 (to avoid conflicts)
   - Database URL pattern: `postgresql://elga_user:elga_pass@db:5432/elga_db`

### Database Schema

Two main tables with similar structure:
- `guest` - Confirmed guests with extended business data fields
- `preselection` - Candidate pool for potential promotion to guests

Key fields include personal info (nome, email, telefone), company data (empresa, cargo), and optional business details (linkedin_url, tamanho_empresa, faturamento_anual, etc.).

### Important Patterns

- **Error Handling**: API routes with try-catch and fallback to direct DB access
- **Data Fetching**: Server Components use parallel fetching with Promise.all
- **Status Management**: Both tables use "pendente"/"convidado" status fields
- **CSV Operations**: Import/export functionality for bulk data management
- **MUI Theme**: Custom theme with Emotion cache for SSR compatibility

## Deployment Configuration

- Docker Compose setup with PostgreSQL and Next.js services
- Build-time variables for `NEXT_PUBLIC_*` environment variables
- Runtime configuration for database connection and webhook URLs
- Easypanel deployment support with configurable ports