# ⚡ Quick Setup for thinktap.link

**Fast setup guide - follow these steps in order**

> **Note:** This guide uses Docker. For manual installation (PostgreSQL, Nginx, Node.js without Docker), see `VPS_MANUAL_DEPLOYMENT_GUIDE.md`

## Prerequisites Checklist

- [ ] VPS server ready
- [ ] Domain `thinktap.link` DNS pointing to VPS IP
- [ ] SSH access to server
- [ ] Docker installed on VPS (or use manual deployment guide)

---

## Step 1: Connect to VPS

```bash
ssh root@your-vps-ip
# Or: ssh username@your-vps-ip
```

---

## Step 2: Clone/Upload Project

```bash
cd ~
git clone <your-repo-url> thinktap
cd thinktap
```

---

## Step 3: Generate JWT Secrets

**On your local machine or VPS:**

```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate Refresh Secret (run again)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Save both outputs** - you'll need them in the next step.

---

## Step 4: Configure Environment Files

### 4.1 Backend .env

```bash
cd ~/thinktap/backend
cp .env.thinktap.link.example .env
nano .env
```

**Replace:**
- `YOUR_STRONG_PASSWORD` → Your database password
- `YOUR_GENERATED_JWT_SECRET_HERE` → First JWT secret from Step 3
- `YOUR_GENERATED_REFRESH_SECRET_HERE` → Second JWT secret from Step 3

**Save:** `Ctrl+X`, `Y`, `Enter`

### 4.2 Frontend .env

```bash
cd ~/thinktap/frontend
cp env.example .env
nano .env
```

**Update with:**
```env
NEXT_PUBLIC_API_URL=https://thinktap.link/api
NEXT_PUBLIC_SOCKET_URL=https://thinktap.link
```

**Save:** `Ctrl+X`, `Y`, `Enter`

### 4.3 Root .env

```bash
cd ~/thinktap
cp .env.thinktap.link.example .env
nano .env
```

**Replace:**
- `YOUR_STRONG_DATABASE_PASSWORD_HERE` → Same password as backend/.env
- `YOUR_GENERATED_JWT_SECRET_HERE` → Same as backend/.env
- `YOUR_GENERATED_REFRESH_SECRET_HERE` → Same as backend/.env

**Save:** `Ctrl+X`, `Y`, `Enter`

---

## Step 5: SSL Certificate

```bash
# Install Certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Get certificate (ensure DNS is pointing first!)
sudo certbot certonly --standalone -d thinktap.link -d www.thinktap.link

# Copy certificates
mkdir -p ~/thinktap/nginx/ssl
sudo cp /etc/letsencrypt/live/thinktap.link/fullchain.pem ~/thinktap/nginx/ssl/
sudo cp /etc/letsencrypt/live/thinktap.link/privkey.pem ~/thinktap/nginx/ssl/
sudo chown -R $USER:$USER ~/thinktap/nginx/ssl
chmod 644 ~/thinktap/nginx/ssl/fullchain.pem
chmod 600 ~/thinktap/nginx/ssl/privkey.pem
```

---

## Step 6: Deploy

```bash
cd ~/thinktap

# Build images
docker compose build

# Start services
docker compose up -d

# Run migrations
docker compose exec backend npx prisma migrate deploy
```

---

## Step 7: Verify

```bash
# Check services
docker compose ps

# Test backend
curl https://thinktap.link/api/health

# Open in browser
# https://thinktap.link
```

---

## ✅ Done!

Your ThinkTap is now live at **https://thinktap.link** 🎉

---

## 🔄 Update Commands

```bash
cd ~/thinktap
git pull
docker compose build
docker compose up -d
docker compose exec backend npx prisma migrate deploy
```

---

## 🐛 Quick Troubleshooting

**502 Bad Gateway:**
```bash
docker compose logs backend
docker compose restart backend
```

**SSL Error:**
```bash
sudo certbot renew
sudo cp /etc/letsencrypt/live/thinktap.link/*.pem ~/thinktap/nginx/ssl/
docker compose restart nginx
```

**CORS Error:**
- Check `CORS_ORIGIN` in `backend/.env` includes `https://thinktap.link`
- Restart: `docker compose restart backend`

---

**Full guide:** See `THINKTAP_LINK_CONFIG.md` for detailed instructions.

