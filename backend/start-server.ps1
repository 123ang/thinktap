# Start ThinkTap Backend Server
# This script checks if port 3001 is in use and starts the server

Write-Host "Checking port 3001..." -ForegroundColor Yellow

$connection = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue

if ($connection) {
    $pid = $connection.OwningProcess
    Write-Host "⚠ Port 3001 is already in use by process PID: $pid" -ForegroundColor Red
    Write-Host "Run 'npm run stop' or './stop-server.ps1' to stop it first." -ForegroundColor Yellow
    exit 1
}

Write-Host "Starting backend server..." -ForegroundColor Green
npm run start:dev




