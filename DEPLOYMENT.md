# ThinkTap Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Docker Deployment](#docker-deployment)
4. [Manual Deployment](#manual-deployment)
5. [Mobile App Deployment](#mobile-app-deployment)
6. [SSL Configuration](#ssl-configuration)
7. [Monitoring](#monitoring)

---

## Prerequisites

### Required Software
- Docker 24+ & Docker Compose
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Nginx (for reverse proxy)

### Required Services
- Domain name
- SSL certificate (Let's Encrypt recommended)
- Cloud hosting (AWS, DigitalOcean, etc.)

---

## Environment Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd ThinkTap
```

### 2. Configure Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://thinktap:STRONG_PASSWORD@postgres:5432/thinktap

# JWT
JWT_SECRET=GENERATE_STRONG_SECRET_HERE
JWT_REFRESH_SECRET=GENERATE_STRONG_REFRESH_SECRET_HERE
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://redis:6379

# Server
NODE_ENV=production
PORT=3001

# CORS
CORS_ORIGIN=https://thinktap.com,https://www.thinktap.com
```

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://api.thinktap.com
NEXT_PUBLIC_SOCKET_URL=https://api.thinktap.com
```

#### Docker Compose (.env)
```env
DB_PASSWORD=STRONG_DATABASE_PASSWORD
JWT_SECRET=YOUR_JWT_SECRET
JWT_REFRESH_SECRET=YOUR_REFRESH_SECRET
API_URL=https://api.thinktap.com
SOCKET_URL=https://api.thinktap.com
```

---

## Docker Deployment

### 1. Build and Start Services
```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 2. Run Database Migrations
```bash
docker-compose exec backend npx prisma migrate deploy
```

### 3. Verify Deployment
```bash
# Check backend health
curl http://localhost:3001/health

# Check frontend
curl http://localhost:3000
```

### 4. Stop Services
```bash
docker-compose down
```

### 5. Update Deployment
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Run migrations
docker-compose exec backend npx prisma migrate deploy
```

---

## Manual Deployment

### Backend Deployment

#### 1. Install Dependencies
```bash
cd backend
npm ci --only=production
```

#### 2. Build Application
```bash
npm run build
```

#### 3. Generate Prisma Client
```bash
npx prisma generate
```

#### 4. Run Migrations
```bash
npx prisma migrate deploy
```

#### 5. Start with PM2
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start dist/main.js --name thinktap-backend

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

#### 6. PM2 Commands
```bash
# View logs
pm2 logs thinktap-backend

# Restart
pm2 restart thinktap-backend

# Stop
pm2 stop thinktap-backend

# Monitor
pm2 monit
```

### Frontend Deployment

#### Option 1: Vercel (Recommended)
```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Configure environment variables in Vercel dashboard.

#### Option 2: PM2
```bash
cd frontend

# Install dependencies
npm ci --only=production

# Build
npm run build

# Start with PM2
pm2 start npm --name thinktap-frontend -- start

# Save configuration
pm2 save
```

---

## Mobile App Deployment

### Prerequisites
```bash
npm install -g eas-cli
eas login
```

### Configure EAS
```bash
cd mobile

# Initialize EAS
eas build:configure
```

#### eas.json
```json
{
  "build": {
    "production": {
      "node": "20.0.0",
      "env": {
        "API_URL": "https://api.thinktap.com"
      },
      "ios": {
        "bundleIdentifier": "com.thinktap.app"
      },
      "android": {
        "package": "com.thinktap.app"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### iOS Deployment

#### 1. Build for iOS
```bash
eas build --platform ios --profile production
```

#### 2. Submit to App Store
```bash
eas submit --platform ios
```

Requirements:
- Apple Developer Account ($99/year)
- App Store Connect credentials
- App icons and screenshots

### Android Deployment

#### 1. Build for Android
```bash
eas build --platform android --profile production
```

#### 2. Submit to Google Play
```bash
eas submit --platform android
```

Requirements:
- Google Play Developer Account ($25 one-time)
- Signing keystore
- App icons and screenshots

---

## SSL Configuration

### Using Let's Encrypt (Certbot)

#### 1. Install Certbot
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

#### 2. Obtain Certificate
```bash
sudo certbot --nginx -d thinktap.com -d www.thinktap.com
```

#### 3. Auto-renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically sets up cron job
```

#### 4. Copy Certificates to Docker
```bash
# Create SSL directory
mkdir -p nginx/ssl

# Copy certificates
sudo cp /etc/letsencrypt/live/thinktap.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/thinktap.com/privkey.pem nginx/ssl/

# Set permissions
sudo chown -R $USER:$USER nginx/ssl
```

---

## Monitoring

### Health Checks

#### Backend Health
```bash
curl https://api.thinktap.com/health
```

#### Database Connection
```bash
docker-compose exec backend npx prisma db execute --stdin <<< "SELECT 1;"
```

### Logging

#### View Docker Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 backend
```

#### PM2 Logs
```bash
pm2 logs thinktap-backend --lines 100
```

### Performance Monitoring

#### Install Monitoring Tools
```bash
# Install PM2 monitoring
pm2 install pm2-server-monit

# Install log rotation
pm2 install pm2-logrotate
```

#### Database Monitoring
```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Long-running queries
SELECT pid, now() - query_start as duration, query 
FROM pg_stat_activity 
WHERE state = 'active' 
ORDER BY duration DESC;

-- Database size
SELECT pg_size_pretty(pg_database_size('thinktap'));
```

### Backup Strategy

#### Database Backup
```bash
# Create backup directory
mkdir -p backups

# Backup script
docker-compose exec -T postgres pg_dump -U thinktap thinktap > backups/thinktap_$(date +%Y%m%d_%H%M%S).sql

# Automated daily backup (crontab)
0 2 * * * /path/to/backup-script.sh
```

#### Restore Database
```bash
docker-compose exec -T postgres psql -U thinktap thinktap < backups/thinktap_20251207_020000.sql
```

---

## Scaling

### Horizontal Scaling

#### Multiple Backend Instances
```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      replicas: 3
    
  nginx:
    # Load balancing configured in nginx.conf
```

#### Redis Adapter for Socket.io
Already configured in `backend/src/events/events.gateway.ts`

### Vertical Scaling

#### Increase Resources
```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

---

## Security Checklist

- ✅ Strong passwords and secrets
- ✅ SSL/TLS enabled
- ✅ CORS properly configured
- ✅ Rate limiting enabled
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection headers
- ✅ JWT token expiration
- ✅ Environment variables secured
- ✅ Database backups automated
- ✅ Firewall rules configured

---

## Troubleshooting

### Backend Not Starting
```bash
# Check logs
docker-compose logs backend

# Verify database connection
docker-compose exec backend npx prisma db pull

# Check environment variables
docker-compose exec backend env | grep DATABASE_URL
```

### Frontend Build Errors
```bash
# Clear cache
rm -rf frontend/.next

# Rebuild
docker-compose build frontend
docker-compose up -d frontend
```

### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready

# View connections
docker-compose exec postgres psql -U thinktap -c "SELECT count(*) FROM pg_stat_activity;"
```

### Socket.io Not Connecting
- Verify WebSocket support in Nginx config
- Check CORS configuration
- Ensure Redis is running for multi-instance setups

---

## Rollback Procedure

### 1. Stop Current Deployment
```bash
docker-compose down
```

### 2. Restore Previous Version
```bash
git checkout previous-tag
docker-compose build
docker-compose up -d
```

### 3. Restore Database
```bash
docker-compose exec -T postgres psql -U thinktap thinktap < backups/previous-backup.sql
```

---

## Performance Optimization

### Database Indexing
```sql
-- Add indexes for common queries
CREATE INDEX idx_sessions_lecturer ON "Session"("lecturerId");
CREATE INDEX idx_responses_question ON "Response"("questionId");
CREATE INDEX idx_responses_user ON "Response"("userId");
```

### Caching Strategy
- Redis for session data
- CDN for static assets
- Browser caching headers

### Frontend Optimization
- Image optimization
- Code splitting
- Lazy loading
- Service Worker for PWA

---

## Maintenance

### Regular Tasks
- [ ] Weekly: Review logs for errors
- [ ] Weekly: Check disk space
- [ ] Monthly: Update dependencies
- [ ] Monthly: Review security advisories
- [ ] Quarterly: Load testing
- [ ] Quarterly: Backup restoration test

---

**Support:** support@thinktap.com
**Documentation:** docs.thinktap.com

