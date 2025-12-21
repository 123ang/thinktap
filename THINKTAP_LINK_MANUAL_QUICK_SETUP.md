# ⚡ Quick Manual Setup for thinktap.link (No Docker)

**Fast manual setup guide - PostgreSQL, Nginx, Node.js installed directly**

> **For Docker setup, see `THINKTAP_LINK_QUICK_SETUP.md`**  
> **For detailed manual guide, see `VPS_MANUAL_DEPLOYMENT_GUIDE.md`**

---

## Prerequisites

- [ ] VPS server (Ubuntu 20.04+)
- [ ] Domain `thinktap.link` DNS pointing to VPS IP
- [ ] SSH access
- [ ] Root or sudo access

---

## Step 1: Install PostgreSQL 16

```bash
# Add PostgreSQL repository
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list
sudo apt update

# Install PostgreSQL
sudo apt install -y postgresql-16 postgresql-contrib-16

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE thinktap;
CREATE USER thinktap WITH PASSWORD 'YOUR_STRONG_PASSWORD';
ALTER ROLE thinktap CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE thinktap TO thinktap;
\q
EOF
```

---

## Step 2: Install Node.js 20 & PM2

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2
```

---

## Step 3: Install Redis & Nginx

```bash
# Install Redis
sudo apt install -y redis-server
sudo systemctl enable redis-server

# Install Nginx
sudo apt install -y nginx
sudo systemctl enable nginx
```

---

## Step 4: Configure Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Step 5: Clone Project

```bash
cd ~
git clone <your-repo-url> thinktap
cd thinktap
```

---

## Step 6: Setup Backend

```bash
cd ~/thinktap/backend

# Install dependencies
npm install
npx prisma generate

# Create .env
cp env.example .env
nano .env
```

**Edit `.env`:**
```env
DATABASE_URL="postgresql://thinktap:YOUR_PASSWORD@localhost:5432/thinktap"
JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")"
JWT_REFRESH_SECRET="$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
REDIS_URL="redis://localhost:6379"
NODE_ENV="production"
PORT=3001
CORS_ORIGIN="https://thinktap.link,https://www.thinktap.link"
```

**Run migrations and build:**
```bash
npx prisma migrate deploy
npm run build

# Start with PM2
pm2 start dist/main.js --name thinktap-backend
pm2 save
pm2 startup  # Follow instructions
```

---

## Step 7: Setup Frontend

```bash
cd ~/thinktap/frontend

# Install dependencies
npm install

# Create .env
cp env.example .env
nano .env
```

**Edit `.env`:**
```env
NEXT_PUBLIC_API_URL=https://thinktap.link/api
NEXT_PUBLIC_SOCKET_URL=https://thinktap.link
```

**Build and start:**
```bash
npm run build
pm2 start npm --name thinktap-frontend -- start
pm2 save
```

---

## Step 8: SSL Certificate

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo systemctl stop nginx
sudo certbot certonly --standalone -d thinktap.link -d www.thinktap.link
sudo systemctl start nginx
```

---

## Step 9: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/thinktap
```

**Paste this config:**
```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

server {
    listen 80;
    server_name thinktap.link www.thinktap.link;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name thinktap.link www.thinktap.link;

    ssl_certificate /etc/letsencrypt/live/thinktap.link/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/thinktap.link/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3001/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 3600s;
    }
}
```

**Enable and test:**
```bash
sudo ln -s /etc/nginx/sites-available/thinktap /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 10: Verify

```bash
# Check services
pm2 status
sudo systemctl status postgresql
sudo systemctl status nginx

# Test
curl https://thinktap.link/api/health
```

**Open:** https://thinktap.link

---

## ✅ Done!

Your ThinkTap is live at **https://thinktap.link** 🎉

---

## 🔄 Update Commands

```bash
cd ~/thinktap
git pull

# Backend
cd backend
npm install
npx prisma migrate deploy
npm run build
pm2 restart thinktap-backend

# Frontend
cd ../frontend
npm install
npm run build
pm2 restart thinktap-frontend
```

---

## 🐛 Quick Troubleshooting

**502 Bad Gateway:**
```bash
pm2 logs thinktap-backend
pm2 restart thinktap-backend
```

**Database Error:**
```bash
sudo systemctl status postgresql
sudo -u postgres psql -d thinktap
```

**Nginx Error:**
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

---

**Full guide:** See `VPS_MANUAL_DEPLOYMENT_GUIDE.md` for detailed instructions.

