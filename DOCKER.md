# 🐳 Docker Setup - ELGA Guests

## 📋 Pré-requisitos

- Docker Desktop instalado e rodando
- PowerShell (Windows) ou Terminal (Linux/Mac)

## 🚀 Configuração Inicial

### 1. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```powershell
Copy-Item .env.example .env
```

**IMPORTANTE**: Edite o arquivo `.env` com suas configurações específicas. Este arquivo será usado tanto para desenvolvimento quanto para produção (Easypanel).

### 2. Variáveis de Ambiente Disponíveis

#### Banco de Dados
- `DATABASE_URL`: URL completa do banco PostgreSQL
- `DB_USER`: Usuário do banco (padrão: elga_user)
- `DB_PASSWORD`: Senha do banco (padrão: elga_pass)
- `DB_NAME`: Nome do banco (padrão: elga_db)

#### Aplicação
- `NEXT_PUBLIC_INVITE_BASE_URL`: URL base para convites
- `INVITE_BASE_URL`: URL base da aplicação
- `NOME_EVENTO`: Nome do evento

#### Docker
- `APP_PORT`: Porta da aplicação (padrão: 3001)
- `DB_PORT`: Porta do banco (padrão: 5432)

#### Webhooks (Opcional)
- `WEBHOOK_URL`: URL do webhook principal
- `WEBHOOK_PRESELECTION_PROMOTED_URL`: Webhook para promoção de pré-seleção
- `WEBHOOK_GUEST_CONFIRMED_URL`: Webhook para confirmação de convidados

### 3. Limpeza Inicial (Recomendado)

Execute o script de limpeza para remover containers antigos:

```powershell
# No PowerShell (Windows)
.\scripts\cleanup-docker.sh

# Ou execute manualmente:
docker-compose down
docker volume rm elga-guests_db_data
docker system prune -f
```

## 🏃‍♂️ Executando a Aplicação

### Opção 1: Docker Compose (Produção)

```powershell
docker-compose up --build
```

### Opção 2: Docker Compose Dev (Desenvolvimento)

```powershell
docker-compose -f docker-compose.dev.yml up --build
```

## 🔧 Solução de Problemas

### Erro de Conexão com Banco

Se você encontrar o erro `Can't reach database server at localhost:5432`:

1. **Verifique se o arquivo `.env` existe e está configurado**
2. **Execute a limpeza:**
   ```powershell
   .\scripts\cleanup-docker.sh
   ```
3. **Suba novamente:**
   ```powershell
   docker-compose up --build
   ```

### Erro de Migrations

Se as migrations falharem:

1. **Verifique os logs:**
   ```powershell
   docker-compose logs app
   ```
2. **Force a recriação do banco:**
   ```powershell
   docker-compose down
   docker volume rm elga-guests_db_data
   docker-compose up --build
   ```

### Porta Já em Uso

Se a porta 3001 estiver ocupada:

1. **Altere a porta no .env:**
   ```
   APP_PORT=3002
   ```
2. **Ou pare outros serviços:**
   ```powershell
   netstat -ano | findstr :3001
   taskkill /PID <PID> /F
   ```

## 📊 Verificando o Status

### Logs da Aplicação

```powershell
docker-compose logs -f app
```

### Logs do Banco

```powershell
docker-compose logs -f db
```

### Status dos Containers

```powershell
docker-compose ps
```

## 🗑️ Limpeza

### Parar Aplicação

```powershell
docker-compose down
```

### Limpeza Completa

```powershell
.\scripts\cleanup-docker.sh
```

## 🔍 Debug

### Acessar Container da Aplicação

```powershell
docker-compose exec app sh
```

### Acessar Banco de Dados

```powershell
docker-compose exec db psql -U elga_user -d elga_db
```

### Verificar Variáveis de Ambiente

```powershell
docker-compose exec app env | grep DATABASE_URL
```

## 📝 Notas Importantes

- **Banco de Dados**: PostgreSQL 15 com dados persistentes
- **Porta da Aplicação**: Configurável via APP_PORT no .env
- **Porta do Banco**: Configurável via DB_PORT no .env
- **Volumes**: Dados do banco são persistidos em `db_data`
- **Variáveis**: Todas as configurações vêm do arquivo `.env`

## 🚀 Deploy para Produção (Easypanel)

Para deploy no Easypanel:

1. **Configure as variáveis de ambiente no Easypanel** usando os mesmos nomes do `.env`
2. **Use o mesmo `docker-compose.yml`** - ele já está configurado para usar variáveis
3. **A DATABASE_URL será fornecida pelo Easypanel** automaticamente

## 🆘 Suporte

Se você encontrar problemas persistentes:

1. Execute a limpeza completa
2. Verifique se o Docker Desktop está atualizado
3. Reinicie o Docker Desktop
4. Execute novamente com `--build`
