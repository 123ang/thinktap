# ⚡ VPS Deployment Quick Start

**TL;DR version for experienced users**

## Prerequisites
- VPS with Ubuntu 20.04+
- Domain pointing to VPS IP
- Docker & Docker Compose installed

## Quick Steps

### 1. Connect & Update
```bash
ssh root@your-server-ip
sudo apt update && sudo apt upgrade -y
```

### 2. Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

### 3. Clone Project
```bash
cd ~
git clone <your-repo-url> thinktap
cd thinktap
```

### 4. Configure Environment
```bash
# Backend
cd backend && cp env.example .env
nano .env  # Edit with your values

# Frontend
cd ../frontend && cp env.example .env
nano .env  # Edit with your domain

# Root
cd .. && nano .env  # Edit with your values
```

### 5. SSL Certificate
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/*.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl
```

### 6. Update Nginx Config
```bash
nano nginx/nginx.conf
# Replace 'thinktap.com' with 'yourdomain.com' on line 28
```

### 7. Deploy
```bash
docker compose build
docker compose up -d
docker compose exec backend npx prisma migrate deploy
```

### 8. Verify
```bash
docker compose ps
curl https://yourdomain.com/api/health
```

## Environment Variables Needed

**backend/.env:**
- `DATABASE_URL=postgresql://thinktap:PASSWORD@postgres:5432/thinktap`
- `JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">`
- `JWT_REFRESH_SECRET=<generate same way>`
- `CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com`

**frontend/.env:**
- `NEXT_PUBLIC_API_URL=https://yourdomain.com/api`
- `NEXT_PUBLIC_SOCKET_URL=https://yourdomain.com`

**.env (root):**
- `DB_PASSWORD=YOUR_STRONG_PASSWORD`
- `JWT_SECRET=<same as backend>`
- `JWT_REFRESH_SECRET=<same as backend>`
- `API_URL=https://yourdomain.com/api`
- `SOCKET_URL=https://yourdomain.com`

## Common Commands

```bash
# View logs
docker compose logs -f

# Restart
docker compose restart

# Update
git pull && docker compose build && docker compose up -d

# Backup
docker compose exec -T postgres pg_dump -U thinktap thinktap > backup.sql
```

## Troubleshooting

**502 Bad Gateway:** Check backend logs: `docker compose logs backend`

**SSL Error:** Renew cert: `sudo certbot renew` then copy certs again

**Can't connect:** Check firewall: `sudo ufw status`

---

**Full guide:** See `VPS_DEPLOYMENT_GUIDE.md` for detailed instructions.

