# ThinkTap Quick Start Script (Windows PowerShell)
# This script sets up and starts the ThinkTap development environment

Write-Host "🎓 ThinkTap - Quick Start Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Blue

try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed. Please install Node.js 20+ first." -ForegroundColor Yellow
    exit 1
}

try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not installed. Please install Docker first." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Setup Backend
Write-Host "Setting up Backend..." -ForegroundColor Blue
Set-Location backend

if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from example..."
    Copy-Item env.example .env
    Write-Host "⚠ Please edit backend/.env with your configuration" -ForegroundColor Yellow
}

Write-Host "Installing dependencies..."
npm install

Write-Host "Generating Prisma client..."
npx prisma generate

Write-Host "✓ Backend setup complete" -ForegroundColor Green
Write-Host ""

# Setup Frontend
Write-Host "Setting up Frontend..." -ForegroundColor Blue
Set-Location ..\frontend

if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local file from example..."
    Copy-Item env.example .env.local
}

Write-Host "Installing dependencies..."
npm install

Write-Host "✓ Frontend setup complete" -ForegroundColor Green
Write-Host ""

# Setup Mobile (optional)
Write-Host "Setting up Mobile App (optional)..." -ForegroundColor Blue
$mobileSetup = Read-Host "Do you want to set up the mobile app? (y/n)"

if ($mobileSetup -eq "y" -or $mobileSetup -eq "Y") {
    Set-Location ..\mobile
    Write-Host "Installing dependencies..."
    npm install
    Write-Host "✓ Mobile setup complete" -ForegroundColor Green
} else {
    Write-Host "Skipping mobile setup"
}

Set-Location ..
Write-Host ""

# Start services
Write-Host "Starting services..." -ForegroundColor Blue
Write-Host ""
Write-Host "Choose how to start:"
Write-Host "1. Docker Compose (recommended)"
Write-Host "2. Manual (separate terminals)"
$choice = Read-Host "Enter choice (1 or 2)"

if ($choice -eq "1") {
    Write-Host "Starting with Docker Compose..."
    docker-compose up -d
    Write-Host ""
    Write-Host "✓ All services started!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Services running:"
    Write-Host "  - Backend: http://localhost:3001"
    Write-Host "  - Frontend: http://localhost:3000"
    Write-Host "  - PostgreSQL: localhost:5432"
    Write-Host "  - Redis: localhost:6379"
    Write-Host ""
    Write-Host "View logs: docker-compose logs -f"
    Write-Host "Stop services: docker-compose down"
} else {
    Write-Host ""
    Write-Host "Manual start instructions:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Terminal 1 - Backend:"
    Write-Host "  cd backend"
    Write-Host "  npx prisma migrate dev"
    Write-Host "  npm run start:dev"
    Write-Host ""
    Write-Host "Terminal 2 - Frontend:"
    Write-Host "  cd frontend"
    Write-Host "  npm run dev"
    Write-Host ""
    Write-Host "Terminal 3 - Mobile (optional):"
    Write-Host "  cd mobile"
    Write-Host "  npm start"
}

Write-Host ""
Write-Host "🎉 ThinkTap setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Open http://localhost:3000 in your browser"
Write-Host "2. Register a new account"
Write-Host "3. Create your first session"
Write-Host ""
Write-Host "Documentation:"
Write-Host "  - README.md - Quick overview"
Write-Host "  - DOCUMENTATION.md - Complete guide"
Write-Host "  - API_REFERENCE.md - API docs"
Write-Host ""
Write-Host "Happy teaching! 🎓"

