# PowerShell script to merge frontend submodule into root repository

Write-Host "Merging frontend submodule into root repository..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in the root directory
if (-not (Test-Path "frontend")) {
    Write-Host "Error: frontend directory not found. Make sure you're in the project root." -ForegroundColor Red
    exit 1
}

# Step 1: Remove submodule configuration
Write-Host "Step 1: Removing submodule configuration..." -ForegroundColor Yellow
git submodule deinit -f frontend
git rm --cached frontend

# Step 2: Remove .git directory from frontend
Write-Host "Step 2: Removing .git from frontend..." -ForegroundColor Yellow
if (Test-Path "frontend\.git") {
    Remove-Item -Recurse -Force "frontend\.git"
}

# Step 3: Remove submodule from .git/modules
Write-Host "Step 3: Cleaning up .git/modules..." -ForegroundColor Yellow
if (Test-Path ".git\modules\frontend") {
    Remove-Item -Recurse -Force ".git\modules\frontend"
}

# Step 4: Remove .gitmodules if it exists and is empty/only has frontend
Write-Host "Step 4: Checking .gitmodules..." -ForegroundColor Yellow
if (Test-Path ".gitmodules") {
    $content = Get-Content ".gitmodules" -Raw
    if ($content -match "^\s*\[submodule\s+`"frontend`"\]" -and $content -notmatch "\[submodule\s+`"[^`"]+`"\]") {
        Remove-Item ".gitmodules"
        Write-Host "Removed .gitmodules file" -ForegroundColor Green
    }
}

# Step 5: Add frontend files to root repository
Write-Host "Step 5: Adding frontend files to root repository..." -ForegroundColor Yellow
git add frontend/

# Step 6: Show status
Write-Host ""
Write-Host "Step 6: Current git status:" -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review the changes: git status" -ForegroundColor White
Write-Host "2. Commit the changes: git commit -m 'Merge frontend submodule into root repository'" -ForegroundColor White
Write-Host "3. Push to remote: git push" -ForegroundColor White
Write-Host ""
Write-Host "Done! Frontend is now part of the root repository." -ForegroundColor Green

