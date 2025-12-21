#!/bin/bash

# Bash script to merge frontend submodule into root repository

echo "🔧 Merging frontend submodule into root repository..."
echo ""

# Check if we're in the root directory
if [ ! -d "frontend" ]; then
    echo "❌ Error: frontend directory not found. Make sure you're in the project root."
    exit 1
fi

# Step 1: Remove submodule configuration
echo "Step 1: Removing submodule configuration..."
git submodule deinit -f frontend
git rm --cached frontend

# Step 2: Remove .git directory from frontend
echo "Step 2: Removing .git from frontend..."
if [ -d "frontend/.git" ]; then
    rm -rf frontend/.git
fi

# Step 3: Remove submodule from .git/modules
echo "Step 3: Cleaning up .git/modules..."
if [ -d ".git/modules/frontend" ]; then
    rm -rf .git/modules/frontend
fi

# Step 4: Remove .gitmodules if it exists and only has frontend
echo "Step 4: Checking .gitmodules..."
if [ -f ".gitmodules" ]; then
    # Check if .gitmodules only contains frontend submodule
    if grep -q "\[submodule \"frontend\"\]" .gitmodules && [ $(grep -c "\[submodule" .gitmodules) -eq 1 ]; then
        rm .gitmodules
        echo "✅ Removed .gitmodules file"
    fi
fi

# Step 5: Add frontend files to root repository
echo "Step 5: Adding frontend files to root repository..."
git add frontend/

# Step 6: Show status
echo ""
echo "Step 6: Current git status:"
git status

echo ""
echo "✅ Next steps:"
echo "1. Review the changes: git status"
echo "2. Commit the changes: git commit -m 'Merge frontend submodule into root repository'"
echo "3. Push to remote: git push"
echo ""
echo "✅ Done! Frontend is now part of the root repository."

