# Script PowerShell para deploy com porta configurável
# Uso: .\deploy.ps1 [porta]

param(
    [int]$DB_PORT = 5434
)

Write-Host "🚀 Iniciando deploy com porta do banco: $DB_PORT" -ForegroundColor Green

# Define a variável de ambiente
$env:DB_PORT = $DB_PORT

# Executa o docker compose
docker compose up --build -d

Write-Host "✅ Deploy concluído!" -ForegroundColor Green
Write-Host "📊 Aplicação disponível em: http://localhost:3001" -ForegroundColor Cyan
Write-Host "🗄️  Banco de dados na porta: $DB_PORT" -ForegroundColor Cyan
