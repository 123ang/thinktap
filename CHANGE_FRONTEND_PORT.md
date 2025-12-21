# 🔧 Change Frontend Port to 3004

## Problem

Frontend was trying to use port 3000, but it's already in use:
```
Error: listen EADDRINUSE: address already in use :::3000
```

## Solution

Changed frontend to use port **3004** instead.

## Files Updated

### 1. `frontend/package.json`
- Updated `start` script: `"start": "next start -p 3004"`
- Dev script already used 3004: `"dev": "next dev -p 3004"`

### 2. `frontend/Dockerfile`
- Changed `EXPOSE 3000` to `EXPOSE 3004`

### 3. `nginx/nginx.conf`
- Updated frontend upstream: `server frontend:3004;`

### 4. `VPS_MANUAL_DEPLOYMENT_GUIDE.md`
- Updated Nginx proxy_pass: `proxy_pass http://localhost:3004;`
- Updated test command: `curl http://localhost:3004`
- Updated troubleshooting to mention port 3004

## On Your VPS

### Step 1: Update Nginx Config

```bash
sudo nano /etc/nginx/sites-available/thinktap
```

Change:
```nginx
proxy_pass http://localhost:3000;
```

To:
```nginx
proxy_pass http://localhost:3004;
```

### Step 2: Restart Frontend with PM2

```bash
# Stop current frontend
pm2 stop thinktap-frontend
pm2 delete thinktap-frontend

# Start with new port (it will use the updated package.json)
cd ~/projects/thinktap/frontend
pm2 start npm --name thinktap-frontend -- start

# Or if you want to specify port explicitly:
pm2 start npm --name thinktap-frontend -- start -- -p 3004
```

### Step 3: Test Nginx and Reload

```bash
# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 4: Verify

```bash
# Check frontend is running on 3004
curl http://localhost:3004

# Check PM2 status
pm2 status

# Check logs
pm2 logs thinktap-frontend
```

## Verify Port is Free

Before starting, make sure port 3004 is available:

```bash
# Check if port 3004 is in use
lsof -i :3004
# or
netstat -tulpn | grep 3004

# If something is using it, kill it:
# sudo kill -9 <PID>
```

## Summary

- **Frontend dev port**: 3004 (already was)
- **Frontend production port**: 3004 (changed from 3000)
- **Nginx proxy**: Updated to 3004
- **PM2**: Will use port 3004 automatically from package.json

All done! Your frontend will now run on port 3004. ✅

