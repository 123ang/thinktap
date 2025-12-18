# Stop ThinkTap Backend Server
# This script finds and kills the process running on port 3001

Write-Host "Looking for process on port 3001..." -ForegroundColor Yellow

$connection = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue

if ($connection) {
    $processId = $connection.OwningProcess
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    
    if ($process) {
        Write-Host "Found process: $($process.ProcessName) (PID: $processId)" -ForegroundColor Cyan
        Write-Host "Stopping process..." -ForegroundColor Yellow
        Stop-Process -Id $processId -Force
        Write-Host "[OK] Server stopped successfully!" -ForegroundColor Green
    } else {
        Write-Host "Process not found." -ForegroundColor Red
    }
} else {
    Write-Host "No process found on port 3001." -ForegroundColor Green
}

