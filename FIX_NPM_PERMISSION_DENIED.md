# 🔧 Fix "Permission denied" for Next.js Build

## Problem

When running `npm run build`, you get:
```
sh: 1: next: Permission denied
```

## Root Cause

The `next` binary in `node_modules/.bin/` doesn't have execute permissions, or node_modules is corrupted.

## Quick Fix

### Solution 1: Fix Permissions (Most Common)

```bash
cd ~/projects/thinktap/frontend

# Fix permissions on node_modules/.bin
chmod +x node_modules/.bin/*

# Or specifically for next
chmod +x node_modules/.bin/next

# Try build again
npm run build
```

### Solution 2: Reinstall node_modules

If permissions fix doesn't work, reinstall:

```bash
cd ~/projects/thinktap/frontend

# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Try build again
npm run build
```

### Solution 3: Use npx (Alternative)

```bash
# Use npx to run next directly
npx next build
```

---

## Complete Fix Steps

Run these commands:

```bash
cd ~/projects/thinktap/frontend

# Step 1: Fix permissions
chmod +x node_modules/.bin/*

# Step 2: If that doesn't work, reinstall
rm -rf node_modules package-lock.json
npm install

# Step 3: Try build
npm run build
```

---

## Why This Happens

This usually happens when:
1. Files were copied from Windows to Linux (permissions not preserved)
2. Files were extracted from archive without preserving permissions
3. node_modules was created with wrong user/permissions

---

## Prevention

When copying files to Linux:
```bash
# Use rsync with preserve permissions
rsync -avz source/ destination/

# Or fix permissions after copying
find . -type f -name "*.js" -exec chmod +x {} \;
chmod +x node_modules/.bin/*
```

---

## Verify Fix

After fixing, verify:

```bash
# Check next has execute permission
ls -la node_modules/.bin/next
# Should show: -rwxr-xr-x (x = executable)

# Try build
npm run build
```

---

## Alternative: Use npm ci

If you continue having issues:

```bash
# Clean install
rm -rf node_modules package-lock.json
npm ci  # Uses package-lock.json for exact versions
npm run build
```

