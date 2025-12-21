# 🔧 ThinkTap.link Domain Configuration Guide

**Complete configuration guide for deploying ThinkTap to thinktap.link**

---

## 📋 Domain Configuration Summary

Your domain: **thinktap.link**

**URLs:**
- Frontend: `https://thinktap.link`
- API: `https://thinktap.link/api`
- WebSocket: `https://thinktap.link`

---

## Step 1: DNS Configuration

Before deploying, ensure your DNS is configured:

### DNS Records Needed:

**A Record:**
```
Type: A
Name: @ (or thinktap.link)
Value: YOUR_VPS_IP_ADDRESS
TTL: 3600 (or default)
```

**A Record (www subdomain):**
```
Type: A
Name: www
Value: YOUR_VPS_IP_ADDRESS
TTL: 3600 (or default)
```

**Verify DNS:**
```bash
# Check if DNS is pointing correctly
nslookup thinktap.link
nslookup www.thinktap.link

# Or use dig
dig thinktap.link
```

⏳ **Wait 5-30 minutes** for DNS to propagate before proceeding.

---

## Step 2: Environment Variables Configuration

### 2.1 Backend Configuration (`backend/.env`)

Create or edit `backend/.env`:

```env
# Database (for Docker, use postgres service name)
DATABASE_URL=postgresql://thinktap:YOUR_STRONG_PASSWORD@postgres:5432/thinktap

# Generate JWT secrets (run this command):
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=YOUR_GENERATED_JWT_SECRET_HERE
JWT_REFRESH_SECRET=YOUR_GENERATED_REFRESH_SECRET_HERE
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://redis:6379

# Server
NODE_ENV=production
PORT=3001

# CORS - IMPORTANT: Use your actual domain
CORS_ORIGIN=https://thinktap.link,https://www.thinktap.link
```

### 2.2 Frontend Configuration (`frontend/.env`)

Create or edit `frontend/.env`:

```env
NEXT_PUBLIC_API_URL=https://thinktap.link/api
NEXT_PUBLIC_SOCKET_URL=https://thinktap.link
```

### 2.3 Root Docker Compose Configuration (`.env`)

Create or edit `.env` in the project root:

```env
# Database password (use a STRONG password)
DB_PASSWORD=YOUR_STRONG_DATABASE_PASSWORD_HERE

# JWT secrets (same as in backend/.env)
JWT_SECRET=YOUR_GENERATED_JWT_SECRET_HERE
JWT_REFRESH_SECRET=YOUR_GENERATED_REFRESH_SECRET_HERE

# API URLs
API_URL=https://thinktap.link/api
SOCKET_URL=https://thinktap.link
```

---

## Step 3: Generate JWT Secrets

**On your local machine or VPS:**

```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate Refresh Secret (run again to get a different value)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Copy the output** and use it for `JWT_SECRET` and `JWT_REFRESH_SECRET` in both `backend/.env` and root `.env`.

---

## Step 4: SSL Certificate Setup

### 4.1 Install Certbot

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### 4.2 Obtain SSL Certificate

**Important:** Make sure DNS is pointing to your VPS first!

```bash
sudo certbot certonly --standalone -d thinktap.link -d www.thinktap.link
```

**Follow prompts:**
- Enter your email address
- Agree to terms of service
- Choose whether to share email (optional)

### 4.3 Copy Certificates

```bash
# Create SSL directory
mkdir -p ~/thinktap/nginx/ssl

# Copy certificates
sudo cp /etc/letsencrypt/live/thinktap.link/fullchain.pem ~/thinktap/nginx/ssl/
sudo cp /etc/letsencrypt/live/thinktap.link/privkey.pem ~/thinktap/nginx/ssl/

# Set proper permissions
sudo chown -R $USER:$USER ~/thinktap/nginx/ssl
chmod 644 ~/thinktap/nginx/ssl/fullchain.pem
chmod 600 ~/thinktap/nginx/ssl/privkey.pem
```

### 4.4 Verify Nginx Config

The `nginx/nginx.conf` file has already been updated with `thinktap.link`. Verify:

```bash
grep "server_name" nginx/nginx.conf
```

Should show: `server_name thinktap.link www.thinktap.link;`

---

## Step 5: Deploy

### 5.1 Build Images

```bash
cd ~/thinktap
docker compose build
```

### 5.2 Start Services

```bash
docker compose up -d
```

### 5.3 Run Migrations

```bash
docker compose exec backend npx prisma migrate deploy
```

### 5.4 Check Status

```bash
docker compose ps
```

All services should show "Up" status.

---

## Step 6: Verify Deployment

### 6.1 Test Backend Health

```bash
curl https://thinktap.link/api/health
```

Should return: `healthy`

### 6.2 Test Frontend

Open in browser: **https://thinktap.link**

You should see the ThinkTap landing page!

### 6.3 Test API

```bash
# Test registration endpoint
curl -X POST https://thinktap.link/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'
```

---

## Step 7: Auto-Renewal Setup

SSL certificates expire every 90 days. Set up auto-renewal:

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically creates a cron job, verify:
sudo systemctl status certbot.timer
```

**Manual renewal (if needed):**
```bash
sudo certbot renew
sudo cp /etc/letsencrypt/live/thinktap.link/fullchain.pem ~/thinktap/nginx/ssl/
sudo cp /etc/letsencrypt/live/thinktap.link/privkey.pem ~/thinktap/nginx/ssl/
docker compose restart nginx
```

---

## 🔍 Quick Verification Checklist

- [ ] DNS A records configured for `thinktap.link` and `www.thinktap.link`
- [ ] DNS propagation verified (`nslookup thinktap.link`)
- [ ] Backend `.env` configured with `thinktap.link` in CORS_ORIGIN
- [ ] Frontend `.env` configured with `https://thinktap.link/api`
- [ ] Root `.env` configured with `thinktap.link` URLs
- [ ] JWT secrets generated and set
- [ ] SSL certificate obtained
- [ ] Certificates copied to `nginx/ssl/`
- [ ] Nginx config updated (already done)
- [ ] Docker containers running
- [ ] Database migrations completed
- [ ] Frontend accessible at `https://thinktap.link`
- [ ] API accessible at `https://thinktap.link/api/health`

---

## 🛠️ Troubleshooting

### Problem: "DNS not resolving"

**Solution:**
```bash
# Check DNS
nslookup thinktap.link
dig thinktap.link

# Wait for propagation (can take up to 48 hours, usually 5-30 minutes)
# Verify DNS settings in your domain registrar
```

### Problem: "SSL certificate failed"

**Solution:**
- Ensure DNS is pointing to your VPS IP
- Ensure ports 80 and 443 are open in firewall
- Try: `sudo certbot certonly --standalone -d thinktap.link -d www.thinktap.link --force-renewal`

### Problem: "CORS errors in browser"

**Solution:**
- Verify `CORS_ORIGIN` in `backend/.env` includes `https://thinktap.link`
- Restart backend: `docker compose restart backend`

### Problem: "502 Bad Gateway"

**Solution:**
```bash
# Check backend logs
docker compose logs backend

# Check if backend is running
docker compose ps backend

# Restart services
docker compose restart
```

---

## 📝 Environment Files Summary

### Files to Create/Edit:

1. **`backend/.env`**
   - Database URL
   - JWT secrets
   - CORS_ORIGIN: `https://thinktap.link,https://www.thinktap.link`

2. **`frontend/.env`**
   - NEXT_PUBLIC_API_URL: `https://thinktap.link/api`
   - NEXT_PUBLIC_SOCKET_URL: `https://thinktap.link`

3. **`.env` (root)**
   - DB_PASSWORD
   - JWT secrets
   - API_URL: `https://thinktap.link/api`
   - SOCKET_URL: `https://thinktap.link`

---

## 🎉 Success!

Once all steps are complete, your ThinkTap application will be live at:

- **Website**: https://thinktap.link
- **API**: https://thinktap.link/api
- **WebSocket**: https://thinktap.link

---

**Need help?** See `VPS_DEPLOYMENT_GUIDE.md` for detailed instructions.

