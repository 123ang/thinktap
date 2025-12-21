# 🚀 ThinkTap VPS Manual Deployment Guide (No Docker)

**Complete step-by-step guide for deploying ThinkTap on VPS without Docker**

This guide covers manual installation of PostgreSQL, Nginx, Node.js, and all services.

---

## 📋 Prerequisites

- ✅ VPS server (Ubuntu 20.04+ recommended)
- ✅ Root or sudo access
- ✅ Domain name (`thinktap.link`) pointing to VPS IP
- ✅ SSH access to server
- ✅ Basic terminal knowledge

**Recommended VPS Specs:**
- **Minimum**: 2 CPU cores, 2GB RAM, 20GB storage
- **Recommended**: 4 CPU cores, 4GB RAM, 40GB storage

---

## Step 1: Connect to Your VPS

```bash
ssh root@your-vps-ip
# Or: ssh username@your-vps-ip
```

---

## Step 2: Update System

```bash
# Update package list
sudo apt update

# Upgrade system packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential software-properties-common
```

---

## Step 3: Install PostgreSQL 16

### 3.1 Add PostgreSQL Repository

```bash
# Install prerequisites
sudo apt install -y wget ca-certificates

# Add PostgreSQL GPG key
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# Add PostgreSQL repository
echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list

# Update package list
sudo apt update
```

### 3.2 Install PostgreSQL

```bash
# Install PostgreSQL 16
sudo apt install -y postgresql-16 postgresql-contrib-16

# Check PostgreSQL version
psql --version

# Check if PostgreSQL is running
sudo systemctl status postgresql
```

### 3.3 Configure PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt, run:
CREATE DATABASE thinktap;
CREATE USER thinktap WITH PASSWORD '920214';
ALTER ROLE thinktap CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE thinktap TO thinktap;
\q
```

**Important:** Replace `YOUR_STRONG_PASSWORD_HERE` with a strong password. Save this password - you'll need it for the backend configuration.

### 3.4 Grant Schema Permissions (Required for Prisma)

**⚠️ Important:** After creating the database and user, you MUST grant permissions on the `public` schema, otherwise Prisma migrations will fail with "permission denied for schema public" error.

```bash
# Connect to PostgreSQL as postgres user
sudo -u postgres psql -d thinktap

# Grant permissions on public schema
GRANT ALL ON SCHEMA public TO thinktap;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO thinktap;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO thinktap;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO thinktap;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO thinktap;
\q
```

**Why this is needed:** Prisma needs these permissions to create migration tables and manage the database schema.

### 3.5 Configure PostgreSQL for Remote Access (Optional)

If you need remote access:

```bash
# Edit PostgreSQL config
sudo nano /etc/postgresql/16/main/postgresql.conf

# Find and uncomment/modify:
# listen_addresses = 'localhost'

# Edit pg_hba.conf
sudo nano /etc/postgresql/16/main/pg_hba.conf

# Add at the end:
# host    thinktap    thinktap    127.0.0.1/32    md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

## Step 4: Install Node.js 20

### 4.1 Install Node.js via NodeSource

```bash
# Download and run NodeSource setup script
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

**Expected output:** Node.js v20.x.x and npm 10.x.x

### 4.2 Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

---

## Step 5: Install Redis (for Socket.io scaling)

```bash
# Install Redis
sudo apt install -y redis-server

# Start Redis
sudo systemctl start redis-server

# Enable Redis on boot
sudo systemctl enable redis-server

# Test Redis
redis-cli ping
# Should return: PONG

# Configure Redis (optional - for production)
sudo nano /etc/redis/redis.conf

# Find and set:
# maxmemory 256mb
# maxmemory-policy allkeys-lru

# Restart Redis
sudo systemctl restart redis-server
```

---

## Step 6: Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx

# Enable Nginx on boot
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx

# Test Nginx
curl http://localhost
# Should return HTML content
```

---

## Step 7: Configure Firewall

```bash
# Install UFW if not already installed
sudo apt install -y ufw

# Allow SSH (important!)
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

## Step 8: Clone Your Project

```bash
# Create project directory
mkdir -p ~/thinktap
cd ~/thinktap

# Clone repository
git clone <your-repository-url> .

# Or if uploading manually:
# Use SCP from your local machine
```

---

## Step 9: Set Up Backend

### 9.1 Install Backend Dependencies

```bash
cd ~/thinktap/backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate
```

### 9.2 Configure Backend Environment

```bash
# Copy example file
cp env.example .env

# Edit environment file
nano .env
```

**Edit `.env` with these values:**

```env
# Database (use localhost since not using Docker)
DATABASE_URL="postgresql://thinktap:YOUR_STRONG_PASSWORD@localhost:5432/thinktap"

# Generate JWT secrets (run on server):
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET="YOUR_GENERATED_JWT_SECRET_HERE"
JWT_REFRESH_SECRET="YOUR_GENERATED_REFRESH_SECRET_HERE"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Redis
REDIS_URL="redis://localhost:6379"

# Server Configuration
NODE_ENV="production"
PORT=3001

# CORS (replace with your domain)
CORS_ORIGIN="https://thinktap.link,https://www.thinktap.link"
```

**Save:** `Ctrl+X`, `Y`, `Enter`

### 9.3 Generate JWT Secrets

**Important:** You need to run the command **TWICE** - once for JWT_SECRET and once for JWT_REFRESH_SECRET. They must be different values!

```bash
# Generate JWT Secret (FIRST RUN)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy this output - use it for JWT_SECRET

# Generate Refresh Secret (SECOND RUN - run the command again!)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy this output - use it for JWT_REFRESH_SECRET
```

**Example:**
```bash
$ node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
a1b2c3d4e5f6...  # Use this for JWT_SECRET

$ node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
x9y8z7w6v5u4...  # Use this for JWT_REFRESH_SECRET
```

Copy both outputs and add them to your `.env` file. **Make sure they are different values!**

### 9.4 Run Database Migrations

```bash
# Make sure you're in backend directory
cd ~/thinktap/backend

# Run migrations
npx prisma migrate deploy

# Or if first time:
npx prisma migrate dev
```

### 9.5 Build Backend

```bash
# Build the application
npm run build

# Verify build
ls -la dist/
```

### 9.6 Start Backend with PM2

**First, verify the build output location:**
```bash
# Check where main.js is located
ls -la dist/
ls -la dist/src/  # If src folder exists in dist

# The main.js file might be at:
# - dist/main.js (standard NestJS)
# - dist/src/main.js (if src structure is preserved)
```

**Start backend with PM2:**

```bash
# Option 1: If main.js is at dist/main.js (standard)
pm2 start dist/main.js --name thinktap-backend

# Option 2: If main.js is at dist/src/main.js
pm2 start dist/src/main.js --name thinktap-backend

# Option 3: Use npm start (recommended - uses package.json)
pm2 start npm --name thinktap-backend -- run start:prod

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions it provides (usually run a sudo command)

# Check status
pm2 status

# View logs
pm2 logs thinktap-backend
```

**Troubleshooting:** If you get "Script not found" error, check the actual location:
```bash
find dist -name "main.js" -type f
```
Then use the correct path in the PM2 command.

---

## Step 10: Set Up Frontend

### 10.1 Verify Frontend Directory

**First, make sure the frontend directory exists and has files:**

```bash
# Check if frontend directory exists
ls -la ~/thinktap/frontend/

# If it doesn't exist or is empty, check project structure
cd ~/thinktap
ls -la

# Find package.json files
find . -name "package.json" -type f
```

**If frontend directory is missing:**
- Check if you cloned the repository correctly
- Verify the project structure matches the repository
- If needed, pull the latest code: `git pull`

### 10.2 Install Frontend Dependencies

```bash
# Navigate to frontend directory
cd ~/thinktap/frontend

# Verify package.json exists
ls -la package.json

# If package.json exists, install dependencies
npm install

# If you get "package.json not found" error, see FIX_FRONTEND_SETUP.md
```

### 10.2 Configure Frontend Environment

```bash
# Copy example file
cp env.example .env

# Edit environment file
nano .env
```

**Edit `.env` with these values:**

```env
NEXT_PUBLIC_API_URL=https://thinktap.link/api
NEXT_PUBLIC_SOCKET_URL=https://thinktap.link
```

**Save:** `Ctrl+X`, `Y`, `Enter`

### 10.3 Build Frontend

```bash
# Fix permissions (if files were copied from Windows)
chmod +x node_modules/.bin/*

# Build for production
npm run build

# If you get "Permission denied" error:
# 1. Fix permissions: chmod +x node_modules/.bin/*
# 2. Or reinstall: rm -rf node_modules && npm install
# 3. See FIX_NPM_PERMISSION_DENIED.md for details

# Verify build
ls -la .next/
```

### 10.4 Start Frontend with PM2

```bash
# Start frontend with PM2
pm2 start npm --name thinktap-frontend -- start

# Save PM2 configuration
pm2 save

# Check status
pm2 status

# View logs
pm2 logs thinktap-frontend
```

---

## Step 11: Set Up SSL Certificate (Let's Encrypt)

### 11.1 Install Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### 11.2 Obtain SSL Certificate

**⚠️ Important:** 
1. Make sure your domain DNS is pointing to your VPS IP first!
2. Verify DNS: `nslookup thinktap.link` or `dig thinktap.link`
3. Ports 80 and 443 must be open in firewall

```bash
# Stop Nginx temporarily (Certbot needs port 80)
sudo systemctl stop nginx

# Obtain certificate
sudo certbot certonly --standalone -d thinktap.link -d www.thinktap.link

# Follow prompts:
# - Enter your email
# - Agree to terms
# - Choose whether to share email (optional)

# Verify certificate was created
sudo ls -la /etc/letsencrypt/live/thinktap.link/
# Should show: fullchain.pem, privkey.pem, cert.pem, chain.pem

# Start Nginx again
sudo systemctl start nginx
```

**Troubleshooting:** If you get errors:
- Check DNS is pointing correctly: `nslookup thinktap.link`
- Check firewall allows port 80: `sudo ufw status`
- Wait 5-30 minutes after DNS change for propagation

### 11.3 Set Up Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically creates a cron job, verify:
sudo systemctl status certbot.timer
```

---

## Step 12: Configure Nginx

### 12.1 Create Nginx Configuration

```bash
# Create Nginx site configuration
sudo nano /etc/nginx/sites-available/thinktap
```

**Add this configuration:**

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name thinktap.link www.thinktap.link;
    return 301 https://$host$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name thinktap.link www.thinktap.link;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/thinktap.link/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/thinktap.link/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://localhost:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeouts for long-polling
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Auth endpoints with stricter rate limiting
    location /api/auth/login {
        limit_req zone=login_limit burst=3 nodelay;
        
        proxy_pass http://localhost:3001/auth/login;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support for Socket.io
    location /socket.io/ {
        proxy_pass http://localhost:3001/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket specific timeouts
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://localhost:3001/health;
        add_header Content-Type text/plain;
    }
}
```

**Save:** `Ctrl+X`, `Y`, `Enter`

### 12.2 Enable Site and Test Configuration

```bash
# Create symbolic link to enable site
sudo ln -s /etc/nginx/sites-available/thinktap /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Check for conflicting sites (if you have multiple domains)
sudo ls -la /etc/nginx/sites-enabled/
# If you have other sites using port 443, disable unused ones:
# sudo rm /etc/nginx/sites-enabled/other-site

# Test Nginx configuration
sudo nginx -t

# If you get SSL certificate errors:
# 1. Check certificate exists: sudo ls -la /etc/letsencrypt/live/thinktap.link/
# 2. If missing, get it: sudo certbot certonly --standalone -d thinktap.link -d www.thinktap.link
# 3. See FIX_NGINX_SSL_ERROR.md for detailed troubleshooting

# If test passes, reload Nginx
sudo systemctl reload nginx
```

---

## Step 13: Verify Deployment

### 13.1 Check Services

```bash
# Check PM2 processes
pm2 status

# Check PostgreSQL
sudo systemctl status postgresql

# Check Redis
sudo systemctl status redis-server

# Check Nginx
sudo systemctl status nginx
```

### 13.2 Test Backend

```bash
# Test backend health
curl http://localhost:3001/health

# Test from external (replace with your domain)
curl https://thinktap.link/api/health
```

### 13.3 Test Frontend

Open in browser: **https://thinktap.link**

You should see the ThinkTap landing page! 🎉

### 13.4 Test API

```bash
# Test registration endpoint
curl -X POST https://thinktap.link/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'
```

---

## Step 14: Set Up Automatic Backups

### 14.1 Create Backup Script

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
DB_NAME="thinktap"
DB_USER="thinktap"

# Create backup
PGPASSWORD=$DB_PASSWORD pg_dump -U $DB_USER $DB_NAME > "$BACKUP_DIR/thinktap_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/thinktap_$DATE.sql"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "thinktap_*.sql.gz" -mtime +7 -delete

echo "Backup completed: thinktap_$DATE.sql.gz"
```

**Make executable:**
```bash
chmod +x ~/thinktap/backup.sh
```

### 14.2 Set Up Cron Job

```bash
# Edit crontab
crontab -e

# Add this line (daily at 2 AM):
0 2 * * * /home/your-username/thinktap/backup.sh
```

**Note:** Replace `your-username` with your actual username.

---

## Step 15: Monitoring and Maintenance

### 15.1 PM2 Monitoring

```bash
# View all processes
pm2 list

# View logs
pm2 logs

# Monitor resources
pm2 monit

# View specific service logs
pm2 logs thinktap-backend
pm2 logs thinktap-frontend
```

### 15.2 System Monitoring

```bash
# Install htop for better monitoring
sudo apt install -y htop

# View system resources
htop

# Check disk space
df -h

# Check memory
free -h
```

### 15.3 Database Monitoring

```bash
# Connect to PostgreSQL
sudo -u postgres psql -d thinktap

# Check database size
SELECT pg_size_pretty(pg_database_size('thinktap'));

# Check active connections
SELECT count(*) FROM pg_stat_activity;

# View long-running queries
SELECT pid, now() - query_start as duration, query 
FROM pg_stat_activity 
WHERE state = 'active' 
ORDER BY duration DESC;

# Exit
\q
```

---

## 🔄 Updating Your Application

When you need to update:

```bash
cd ~/thinktap

# Pull latest code
git pull

# Update backend
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart thinktap-backend

# Update frontend
cd ../frontend
npm install
npm run build
pm2 restart thinktap-frontend
```

---

## 🛠️ Common Commands

### PM2 Commands

```bash
# Start service
pm2 start thinktap-backend

# Stop service
pm2 stop thinktap-backend

# Restart service
pm2 restart thinktap-backend

# View logs
pm2 logs thinktap-backend

# Delete service
pm2 delete thinktap-backend

# Save current process list
pm2 save
```

### Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# View access logs
sudo tail -f /var/log/nginx/access.log
```

### PostgreSQL Commands

```bash
# Start PostgreSQL
sudo systemctl start postgresql

# Stop PostgreSQL
sudo systemctl stop postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check status
sudo systemctl status postgresql

# Connect to database
sudo -u postgres psql -d thinktap
```

### Redis Commands

```bash
# Start Redis
sudo systemctl start redis-server

# Stop Redis
sudo systemctl stop redis-server

# Restart Redis
sudo systemctl restart redis-server

# Check status
sudo systemctl status redis-server

# Connect to Redis CLI
redis-cli
```

---

## 🐛 Troubleshooting

### Problem: Backend not starting

**Check logs:**
```bash
pm2 logs thinktap-backend
```

**Common issues:**
- Database connection failed → Check PostgreSQL is running and credentials in `.env`
- Port already in use → Change PORT in `.env` or kill process using port 3001
- Missing dependencies → Run `npm install` in backend directory

### Problem: Frontend not loading

**Check logs:**
```bash
pm2 logs thinktap-frontend
```

**Check if frontend is running:**
```bash
curl http://localhost:3004
```

**Common issues:**
- Build errors → Check `npm run build` output
- Port conflict → Check if port 3004 is available: `lsof -i :3004` or `netstat -tulpn | grep 3004`

### Problem: 502 Bad Gateway

**Check:**
```bash
# Check if backend is running
pm2 status thinktap-backend

# Check backend logs
pm2 logs thinktap-backend

# Test backend directly
curl http://localhost:3001/health

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Problem: Database connection error

**Check PostgreSQL:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Test connection
sudo -u postgres psql -d thinktap

# Check credentials in backend/.env
cat ~/thinktap/backend/.env | grep DATABASE_URL
```

### Problem: SSL certificate error

**Renew certificate:**
```bash
sudo certbot renew

# Reload Nginx
sudo systemctl reload nginx
```

### Problem: Out of memory

**Check memory:**
```bash
free -h
```

**Solutions:**
- Increase swap space
- Optimize Node.js memory usage
- Upgrade VPS plan

---

## 🔒 Security Checklist

- [ ] ✅ Strong database password set
- [ ] ✅ JWT secrets generated and set
- [ ] ✅ SSL certificate installed
- [ ] ✅ Firewall configured (UFW)
- [ ] ✅ Environment variables secured (`.env` files not in git)
- [ ] ✅ Regular backups scheduled
- [ ] ✅ PostgreSQL not exposed to public (if not needed)
- [ ] ✅ Nginx security headers configured
- [ ] ✅ Rate limiting enabled
- [ ] ✅ PM2 running as non-root user (if possible)

---

## 📊 Performance Optimization

### Database Optimization

```sql
-- Connect to database
sudo -u postgres psql -d thinktap

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_sessions_lecturer ON "Session"("lecturerId");
CREATE INDEX IF NOT EXISTS idx_responses_question ON "Response"("questionId");
CREATE INDEX IF NOT EXISTS idx_responses_user ON "Response"("userId");
```

### Nginx Caching (Optional)

Add to Nginx config for static assets:
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### PM2 Cluster Mode (Optional)

For better performance, run backend in cluster mode:
```bash
pm2 delete thinktap-backend
pm2 start dist/main.js --name thinktap-backend -i max
pm2 save
```

---

## ✅ Deployment Checklist

- [ ] System updated
- [ ] PostgreSQL 16 installed and configured
- [ ] Node.js 20 installed
- [ ] PM2 installed and configured
- [ ] Redis installed and running
- [ ] Nginx installed and configured
- [ ] Firewall configured
- [ ] Project cloned
- [ ] Backend dependencies installed
- [ ] Backend `.env` configured
- [ ] Database migrations run
- [ ] Backend built and running with PM2
- [ ] Frontend dependencies installed
- [ ] Frontend `.env` configured
- [ ] Frontend built and running with PM2
- [ ] SSL certificate obtained
- [ ] Nginx configured with SSL
- [ ] Site accessible at https://thinktap.link
- [ ] Backups configured
- [ ] Monitoring set up

---

## 🎉 Success!

Your ThinkTap application is now deployed and running on your VPS!

**Access your application:**
- **Website**: https://thinktap.link
- **API**: https://thinktap.link/api
- **WebSocket**: https://thinktap.link

---

## 📞 Need Help?

- Check PM2 logs: `pm2 logs`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check PostgreSQL logs: `sudo tail -f /var/log/postgresql/postgresql-16-main.log`
- Review this guide step by step

---

**Last Updated:** December 2025

