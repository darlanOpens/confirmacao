# Script PowerShell para deploy com porta configurável
# Uso: .\deploy.ps1 [porta_db] [porta_app]

param(
    [int]$DB_PORT = 5434,
    [int]$APP_PORT = 3001
)

Write-Host "🚀 Iniciando deploy com configurações:" -ForegroundColor Green
Write-Host "   📊 Porta da aplicação: $APP_PORT" -ForegroundColor Cyan
Write-Host "   🗄️  Porta do banco: $DB_PORT" -ForegroundColor Cyan

# Define as variáveis de ambiente
$env:DB_PORT = $DB_PORT
$env:APP_PORT = $APP_PORT

# Executa o docker compose
docker compose up --build -d

Write-Host "✅ Deploy concluído!" -ForegroundColor Green
Write-Host "📊 Aplicação disponível em: http://localhost:$APP_PORT" -ForegroundColor Cyan
Write-Host "🗄️  Banco de dados na porta: $DB_PORT" -ForegroundColor Cyan
