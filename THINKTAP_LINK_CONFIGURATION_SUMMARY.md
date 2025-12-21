# 📋 thinktap.link Configuration Summary

**All configuration values you need for thinktap.link**

---

## 🌐 Domain Information

- **Domain**: thinktap.link
- **Frontend URL**: https://thinktap.link
- **API URL**: https://thinktap.link/api
- **WebSocket URL**: https://thinktap.link

---

## 📝 Environment Variables

### 1. Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://thinktap:YOUR_STRONG_PASSWORD@postgres:5432/thinktap
JWT_SECRET=YOUR_GENERATED_JWT_SECRET_HERE
JWT_REFRESH_SECRET=YOUR_GENERATED_REFRESH_SECRET_HERE
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
REDIS_URL=redis://redis:6379
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://thinktap.link,https://www.thinktap.link
```

### 2. Frontend (`frontend/.env`)

```env
NEXT_PUBLIC_API_URL=https://thinktap.link/api
NEXT_PUBLIC_SOCKET_URL=https://thinktap.link
```

### 3. Root Docker Compose (`.env`)

```env
DB_PASSWORD=YOUR_STRONG_DATABASE_PASSWORD_HERE
JWT_SECRET=YOUR_GENERATED_JWT_SECRET_HERE
JWT_REFRESH_SECRET=YOUR_GENERATED_REFRESH_SECRET_HERE
API_URL=https://thinktap.link/api
SOCKET_URL=https://thinktap.link
```

---

## 🔑 Generate Secrets

**Run these commands to generate secure JWT secrets:**

```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Refresh Secret (run again for different value)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Important:** Use the SAME secrets in both `backend/.env` and root `.env`

---

## 🔒 SSL Certificate Commands

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d thinktap.link -d www.thinktap.link

# Copy to nginx directory
mkdir -p ~/thinktap/nginx/ssl
sudo cp /etc/letsencrypt/live/thinktap.link/fullchain.pem ~/thinktap/nginx/ssl/
sudo cp /etc/letsencrypt/live/thinktap.link/privkey.pem ~/thinktap/nginx/ssl/
sudo chown -R $USER:$USER ~/thinktap/nginx/ssl
chmod 644 ~/thinktap/nginx/ssl/fullchain.pem
chmod 600 ~/thinktap/nginx/ssl/privkey.pem
```

---

## 🚀 Deployment Commands

```bash
cd ~/thinktap

# Build
docker compose build

# Start
docker compose up -d

# Migrations
docker compose exec backend npx prisma migrate deploy

# Check status
docker compose ps
```

---

## ✅ Verification

```bash
# Backend health
curl https://thinktap.link/api/health

# Should return: healthy
```

**Open in browser:** https://thinktap.link

---

## 📋 Checklist

- [ ] DNS A record for `thinktap.link` → VPS IP
- [ ] DNS A record for `www.thinktap.link` → VPS IP
- [ ] Backend `.env` created with thinktap.link URLs
- [ ] Frontend `.env` created with thinktap.link URLs
- [ ] Root `.env` created with thinktap.link URLs
- [ ] JWT secrets generated and set
- [ ] SSL certificate obtained
- [ ] Certificates copied to `nginx/ssl/`
- [ ] Nginx config updated (already done ✅)
- [ ] Docker containers running
- [ ] Database migrations completed
- [ ] Site accessible at https://thinktap.link

---

## 🔄 Update Process

```bash
cd ~/thinktap
git pull
docker compose build
docker compose down
docker compose up -d
docker compose exec backend npx prisma migrate deploy
```

---

## 🐛 Common Issues

### CORS Error
**Fix:** Ensure `CORS_ORIGIN` in `backend/.env` includes `https://thinktap.link`

### SSL Error
**Fix:** 
```bash
sudo certbot renew
sudo cp /etc/letsencrypt/live/thinktap.link/*.pem ~/thinktap/nginx/ssl/
docker compose restart nginx
```

### 502 Bad Gateway
**Fix:**
```bash
docker compose logs backend
docker compose restart backend
```

---

**Need more details?** See:
- `THINKTAP_LINK_CONFIG.md` - Full detailed guide
- `THINKTAP_LINK_QUICK_SETUP.md` - Quick setup steps
- `VPS_DEPLOYMENT_GUIDE.md` - General VPS deployment guide

