# Deploy no Easypanel - Configurações

## Configurações Necessárias

### 1. Variáveis de Ambiente
Configure as seguintes variáveis de ambiente no Easypanel:

```
# Configurações básicas
DATABASE_URL=postgresql://usuario:senha@host:5432/database
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# Configurações do pgAdmin (para acesso ao banco)
PGADMIN_EMAIL=admin@seudominio.com
PGADMIN_PASSWORD=senha_segura_aqui
DOMAIN=seudominio.com

# URLs da aplicação
NEXT_PUBLIC_INVITE_BASE_URL=https://seudominio.com
INVITE_BASE_URL=https://seudominio.com
NOME_EVENTO="Seu Evento"
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

### 7. Acesso ao Banco de Dados

#### pgAdmin - Interface Web
O projeto inclui pgAdmin para acesso visual ao banco de dados:

1. **Configuração no EasyPanel**:
   - Configure as variáveis `PGADMIN_EMAIL`, `PGADMIN_PASSWORD` e `DOMAIN`
   - O pgAdmin ficará disponível em: `https://db.seudominio.com`

2. **Primeiro Acesso**:
   - Acesse `https://db.seudominio.com`
   - Faça login com o email/senha configurados
   - Adicione um novo servidor com:
     - **Nome**: Elga Database
     - **Host**: `db` (nome do container)
     - **Porta**: `5432`
     - **Usuário**: `elga_user`
     - **Senha**: `elga_pass`
     - **Database**: `elga_db`

3. **Segurança**:
   - Use senhas fortes para o pgAdmin
   - Considere restringir acesso por IP se necessário
   - O pgAdmin só é acessível via HTTPS através do Traefik

### 8. Comandos Úteis
```bash
# Para testar localmente
docker build -t elga-guests .
docker run -p 3000:3000 -e DATABASE_URL="sua_url_aqui" elga-guests

# Para verificar logs
docker logs container_id

# Para acessar o banco localmente
docker-compose exec db psql -U elga_user -d elga_db
```