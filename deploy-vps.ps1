# ThinkTap VPS Deployment Script (PowerShell)
# This script automates the deployment process on Windows

$ErrorActionPreference = "Stop"

Write-Host "🚀 ThinkTap VPS Deployment Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-Not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file first (see VPS_DEPLOYMENT_GUIDE.md)" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Checking prerequisites..." -ForegroundColor Green

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found. Please install Docker first." -ForegroundColor Red
    exit 1
}

# Check Docker Compose
try {
    $composeVersion = docker compose version
    Write-Host "✅ Docker Compose found: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose not found. Please install Docker Compose first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Building Docker images..." -ForegroundColor Yellow
docker compose build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Starting services..." -ForegroundColor Yellow
docker compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start services!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Services started" -ForegroundColor Green
Write-Host ""

Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "🗄️  Running database migrations..." -ForegroundColor Yellow
docker compose exec -T backend npx prisma migrate deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Migration failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Migrations completed" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Service status:" -ForegroundColor Yellow
docker compose ps

Write-Host ""
Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Check logs: docker compose logs -f"
Write-Host "2. Test backend: curl http://localhost:3001/health"
Write-Host "3. Visit your domain in a browser"
Write-Host ""
Write-Host "For troubleshooting, see VPS_DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan

