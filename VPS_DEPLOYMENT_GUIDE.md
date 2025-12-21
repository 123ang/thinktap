# 🚀 ThinkTap VPS Deployment Guide - Step by Step

**Complete guide to deploy ThinkTap on your VPS server**

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ A VPS server (Ubuntu 20.04+ recommended)
- ✅ Root or sudo access
- ✅ A domain name pointing to your VPS IP
- ✅ SSH access to your server
- ✅ Basic terminal knowledge

**Recommended VPS Specs:**
- **Minimum**: 2 CPU cores, 2GB RAM, 20GB storage
- **Recommended**: 4 CPU cores, 4GB RAM, 40GB storage

---

## Step 1: Connect to Your VPS

### 1.1 SSH into Your Server

**Windows (PowerShell/CMD):**
```powershell
ssh root@your-server-ip
# Or if using a specific user:
ssh username@your-server-ip
```

**Mac/Linux:**
```bash
ssh root@your-server-ip
# Or:
ssh username@your-server-ip
```

**First time?** You'll be asked to accept the server's fingerprint - type `yes`.

---

## Step 2: Update System

```bash
# Update package list
sudo apt update

# Upgrade system packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git ufw
```

---

## Step 3: Install Docker & Docker Compose

### 3.1 Install Docker

```bash
# Remove old versions (if any)
sudo apt remove -y docker docker-engine docker.io containerd runc

# Install prerequisites
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### 3.2 Add Your User to Docker Group (Optional but Recommended)

```bash
# Replace 'your-username' with your actual username
sudo usermod -aG docker $USER

# Log out and log back in for changes to take effect
# Or run:
newgrp docker
```

---

## Step 4: Configure Firewall

```bash
# Allow SSH (important - don't lock yourself out!)
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## Step 5: Clone Your Project

### 5.1 Create Project Directory

```bash
# Create directory
mkdir -p ~/thinktap
cd ~/thinktap
```

### 5.2 Clone Repository

**Option A: If using Git**
```bash
git clone <your-repository-url> .
```

**Option B: If uploading files manually**
```bash
# Use SCP from your local machine:
# scp -r /path/to/ThinkTap/* username@your-server-ip:~/thinktap/
```

---

## Step 6: Configure Environment Variables

### 6.1 Create Backend .env File

```bash
cd ~/thinktap/backend
cp env.example .env
nano .env
```

**Edit with your values:**
```env
# Database (will use docker-compose values)
DATABASE_URL=postgresql://thinktap:YOUR_STRONG_PASSWORD@postgres:5432/thinktap

# Generate JWT secrets (run TWICE - once for each secret):
# FIRST RUN: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy output → use for JWT_SECRET
# SECOND RUN: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy output → use for JWT_REFRESH_SECRET (must be different!)
JWT_SECRET=YOUR_GENERATED_JWT_SECRET_HERE
JWT_REFRESH_SECRET=YOUR_GENERATED_REFRESH_SECRET_HERE
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://redis:6379

# Server
NODE_ENV=production
PORT=3001

# CORS (replace with your domain)
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

### 6.2 Create Frontend .env File

```bash
cd ~/thinktap/frontend
cp env.example .env
nano .env
```

**Edit:**
```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_SOCKET_URL=https://yourdomain.com
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

### 6.3 Create Root .env File for Docker Compose

```bash
cd ~/thinktap
nano .env
```

**Add:**
```env
# Database password (use same as in backend/.env)
DB_PASSWORD=YOUR_STRONG_PASSWORD_HERE

# JWT secrets (same as backend/.env)
JWT_SECRET=YOUR_GENERATED_JWT_SECRET_HERE
JWT_REFRESH_SECRET=YOUR_GENERATED_REFRESH_SECRET_HERE

# API URLs (replace with your domain)
API_URL=https://yourdomain.com/api
SOCKET_URL=https://yourdomain.com
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

---

## Step 7: Set Up SSL Certificate (Let's Encrypt)

### 7.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Obtain SSL Certificate

**Important:** Make sure your domain DNS is pointing to your VPS IP first!

```bash
# Replace 'yourdomain.com' with your actual domain
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

**Follow the prompts:**
- Enter your email address
- Agree to terms
- Choose whether to share email (optional)

### 7.3 Copy Certificates to Nginx Directory

```bash
# Create SSL directory
mkdir -p ~/thinktap/nginx/ssl

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ~/thinktap/nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ~/thinktap/nginx/ssl/

# Set proper permissions
sudo chown -R $USER:$USER ~/thinktap/nginx/ssl
chmod 644 ~/thinktap/nginx/ssl/fullchain.pem
chmod 600 ~/thinktap/nginx/ssl/privkey.pem
```

### 7.4 Update Nginx Configuration

```bash
cd ~/thinktap
nano nginx/nginx.conf
```

**Find and replace `thinktap.com` with your domain:**
- Line 28: `server_name yourdomain.com www.yourdomain.com;`

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

### 7.5 Set Up Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically creates a cron job, but verify:
sudo systemctl status certbot.timer
```

---

## Step 8: Build and Deploy

### 8.1 Build Docker Images

```bash
cd ~/thinktap
docker compose build
```

⏳ **This will take 5-10 minutes** - grab a coffee! ☕

### 8.2 Start All Services

```bash
docker compose up -d
```

The `-d` flag runs containers in the background.

### 8.3 Check Service Status

```bash
# View running containers
docker compose ps

# View logs
docker compose logs -f
```

**Press `Ctrl+C` to exit logs view**

### 8.4 Run Database Migrations

```bash
docker compose exec backend npx prisma migrate deploy
```

✅ **You should see:** "All migrations have been successfully applied."

---

## Step 9: Verify Deployment

### 9.1 Check Backend Health

```bash
# From server
curl http://localhost:3001/health

# Or from your browser
# https://yourdomain.com/api/health
```

### 9.2 Check Frontend

Open in browser: **https://yourdomain.com**

You should see the ThinkTap landing page! 🎉

### 9.3 Test API

```bash
# Test registration endpoint
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'
```

---

## Step 10: Post-Deployment Setup

### 10.1 Set Up Automatic Backups

```bash
# Create backup directory
mkdir -p ~/thinktap/backups

# Create backup script
nano ~/thinktap/backup.sh
```

**Add this content:**
```bash
#!/bin/bash
BACKUP_DIR="$HOME/thinktap/backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker compose exec -T postgres pg_dump -U thinktap thinktap > "$BACKUP_DIR/thinktap_$DATE.sql"
# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "thinktap_*.sql" -mtime +7 -delete
```

**Make executable:**
```bash
chmod +x ~/thinktap/backup.sh
```

**Add to crontab (daily at 2 AM):**
```bash
crontab -e
```

**Add this line:**
```
0 2 * * * /home/your-username/thinktap/backup.sh
```

### 10.2 Set Up Log Rotation

Docker Compose handles this automatically, but you can monitor logs:

```bash
# View backend logs
docker compose logs -f backend

# View frontend logs
docker compose logs -f frontend

# View all logs
docker compose logs -f
```

---

## 🔄 Updating Your Deployment

When you need to update the application:

```bash
cd ~/thinktap

# Pull latest code
git pull

# Rebuild images
docker compose build

# Restart services
docker compose down
docker compose up -d

# Run migrations (if any)
docker compose exec backend npx prisma migrate deploy
```

---

## 🛠️ Common Commands

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### Restart Services
```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend
```

### Stop Services
```bash
docker compose down
```

### Start Services
```bash
docker compose up -d
```

### Access Database
```bash
docker compose exec postgres psql -U thinktap -d thinktap
```

### Access Backend Container
```bash
docker compose exec backend sh
```

---

## 🐛 Troubleshooting

### Problem: "Cannot connect to database"

**Solution:**
```bash
# Check if postgres is running
docker compose ps postgres

# Check logs
docker compose logs postgres

# Restart postgres
docker compose restart postgres
```

### Problem: "502 Bad Gateway"

**Solution:**
```bash
# Check if backend is running
docker compose ps backend

# Check backend logs
docker compose logs backend

# Restart backend
docker compose restart backend
```

### Problem: "SSL certificate error"

**Solution:**
```bash
# Renew certificate
sudo certbot renew

# Copy certificates again
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ~/thinktap/nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ~/thinktap/nginx/ssl/

# Restart nginx
docker compose restart nginx
```

### Problem: "Port already in use"

**Solution:**
```bash
# Check what's using the port
sudo lsof -i :80
sudo lsof -i :443

# Stop conflicting service or change ports in docker-compose.yml
```

### Problem: "Out of disk space"

**Solution:**
```bash
# Clean up Docker
docker system prune -a

# Remove old images
docker image prune -a

# Check disk usage
df -h
```

---

## 🔒 Security Checklist

- [ ] ✅ Strong database password set
- [ ] ✅ JWT secrets generated and set
- [ ] ✅ SSL certificate installed
- [ ] ✅ Firewall configured (UFW)
- [ ] ✅ Environment variables secured
- [ ] ✅ Regular backups scheduled
- [ ] ✅ Docker containers running as non-root (if possible)
- [ ] ✅ Domain DNS properly configured
- [ ] ✅ CORS origins set correctly

---

## 📊 Monitoring

### Check Resource Usage

```bash
# Docker stats
docker stats

# System resources
htop
# Or if not installed:
top
```

### Check Service Health

```bash
# All services status
docker compose ps

# Health check
curl https://yourdomain.com/health
```

---

## 🎉 Success!

Your ThinkTap application is now deployed and running on your VPS!

### Next Steps:

1. **Test the application** - Create an account and test all features
2. **Set up monitoring** - Consider tools like UptimeRobot for uptime monitoring
3. **Configure backups** - Ensure backups are working
4. **Set up alerts** - Get notified if services go down
5. **Read documentation** - Check `DEPLOYMENT.md` for advanced configurations

---

## 📞 Need Help?

- Check logs: `docker compose logs -f`
- Review this guide step by step
- Check `DEPLOYMENT.md` for advanced topics
- Verify all environment variables are set correctly

---

**Last Updated:** December 2025

