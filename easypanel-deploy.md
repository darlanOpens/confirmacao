# Deploy no Easypanel - Configurações

## Configurações Necessárias

### 1. Variáveis de Ambiente
Configure as seguintes variáveis de ambiente no Easypanel:

```
DATABASE_URL=postgresql://usuario:senha@host:5432/database
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
```

### 2. Configuração do Serviço
- **Porta**: 3000
- **Protocolo**: HTTP
- **Health Check**: `/api/health` (se disponível) ou `/`

### 3. Banco de Dados
Certifique-se de que:
- O PostgreSQL está configurado e acessível
- As credenciais estão corretas na DATABASE_URL
- O banco de dados existe

### 4. Build Settings
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Node Version**: 18

### 5. Dockerfile
O projeto já está configurado com:
- Multi-stage build para otimização
- Configurações de produção
- Migrações automáticas do Prisma
- Health checks de banco de dados

### 6. Troubleshooting
Se o serviço não estiver acessível:
1. Verifique os logs do container
2. Confirme se a DATABASE_URL está correta
3. Verifique se o banco de dados está rodando
4. Confirme se a porta 3000 está exposta corretamente

### 7. Comandos Úteis
```bash
# Para testar localmente
docker build -t elga-guests .
docker run -p 3000:3000 -e DATABASE_URL="sua_url_aqui" elga-guests

# Para verificar logs
docker logs container_id
```