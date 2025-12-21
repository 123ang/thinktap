# Frontend Environment File Change

## Summary

The frontend has been updated to use `.env` instead of `.env.local` for environment variables.

## What Changed

- **Before**: Frontend used `frontend/.env.local`
- **After**: Frontend now uses `frontend/.env`

## Why This Change?

- Simpler configuration (one less file type to remember)
- Consistent with backend which uses `.env`
- Easier to manage in Docker deployments
- Next.js automatically loads `.env` files

## How to Update

### If You Have an Existing `.env.local` File

1. **Copy your existing `.env.local` to `.env`:**
   ```bash
   cd frontend
   cp .env.local .env
   ```

2. **Optional: Remove `.env.local`** (Next.js will use `.env` now):
   ```bash
   rm .env.local
   ```

### For New Setups

Simply copy `env.example` to `.env`:
```bash
cd frontend
cp env.example .env
```

Then edit `.env` with your configuration values.

## Next.js Environment File Priority

Next.js loads environment files in this order (first match wins):
1. `.env.local` (if exists, takes precedence)
2. `.env.development` / `.env.production` (based on NODE_ENV)
3. `.env` (default fallback)

**Note:** Since we're standardizing on `.env`, you can remove `.env.local` if it exists. The `.env` file will be used.

## Docker Deployment

The Dockerfile has been updated to work with `.env` files. Environment variables can be:
- Loaded from `.env` file (copied into container)
- Passed as build args (from docker-compose.yml)

Both methods work, but using `.env` file is simpler for local development.

## Updated Files

- ✅ `frontend/Dockerfile` - Updated to support `.env`
- ✅ `frontend/env.example` - Updated comments
- ✅ All deployment guides - Updated to reference `.env`
- ✅ Quick start scripts - Updated to create `.env`

## Verification

After updating, verify your environment variables are loaded:

```bash
# In frontend directory
cat .env

# Should show:
# NEXT_PUBLIC_API_URL=...
# NEXT_PUBLIC_SOCKET_URL=...
```

Then check in your code that variables are accessible:
```typescript
console.log(process.env.NEXT_PUBLIC_API_URL)
```

---

**Last Updated:** December 2025

