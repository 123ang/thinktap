# 🔧 Fix PM2 "Script not found" Error

## Problem

When trying to start the backend with PM2, you get:
```
[PM2][ERROR] Script not found: /root/projects/thinktap/backend/dist/main.js
```

## Solution

The `main.js` file might be in a different location. Check where it actually is:

### Step 1: Find the main.js file

```bash
cd ~/projects/thinktap/backend

# Find main.js in dist folder
find dist -name "main.js" -type f

# Or check the structure
ls -la dist/
ls -la dist/src/  # If src folder exists
```

### Step 2: Use the correct path

**Option A: If main.js is at `dist/main.js`**
```bash
pm2 start dist/main.js --name thinktap-backend
```

**Option B: If main.js is at `dist/src/main.js`**
```bash
pm2 start dist/src/main.js --name thinktap-backend
```

**Option C: Use npm start (Recommended)**
```bash
pm2 start npm --name thinktap-backend -- run start:prod
```

This uses the `start:prod` script from `package.json`, which should have the correct path.

---

## Quick Fix Commands

### Check build output structure:
```bash
cd ~/projects/thinktap/backend
find dist -name "main.js"
```

### Start with correct path:
```bash
# If found at dist/src/main.js
pm2 start dist/src/main.js --name thinktap-backend

# Or use npm (safest option)
pm2 start npm --name thinktap-backend -- run start:prod
```

---

## Verify Build

Before starting with PM2, make sure the build completed successfully:

```bash
cd ~/projects/thinktap/backend

# Rebuild if needed
npm run build

# Check if main.js exists
ls -la dist/main.js
# or
ls -la dist/src/main.js
```

---

## Alternative: Check package.json

Look at your `package.json` to see how it's supposed to start:

```bash
cat package.json | grep -A 2 "start"
```

The `start:prod` script should show the correct path.

---

## Complete PM2 Setup

After finding the correct path:

```bash
# Start backend
pm2 start dist/src/main.js --name thinktap-backend
# OR
pm2 start npm --name thinktap-backend -- run start:prod

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions (usually run a sudo command)

# Check status
pm2 status

# View logs
pm2 logs thinktap-backend
```

---

## For Your Current Situation

Based on your `ls -la dist/` output showing a `src` folder, try:

```bash
cd ~/projects/thinktap/backend

# Check if main.js is in dist/src/
ls -la dist/src/main.js

# If it exists, start with:
pm2 start dist/src/main.js --name thinktap-backend

# Or use npm (recommended):
pm2 start npm --name thinktap-backend -- run start:prod
```

