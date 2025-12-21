# ✅ VPS Manual Deployment Checklist (No Docker)

Use this checklist to track your manual deployment progress.

## Pre-Deployment

- [ ] VPS server provisioned
- [ ] Domain `thinktap.link` DNS pointing to VPS IP
- [ ] SSH access working
- [ ] Root or sudo access confirmed

## System Setup

- [ ] System updated (`sudo apt update && sudo apt upgrade -y`)
- [ ] Essential tools installed (curl, wget, git, build-essential)
- [ ] Firewall configured (ports 22, 80, 443 open)

## PostgreSQL Installation

- [ ] PostgreSQL repository added
- [ ] PostgreSQL 16 installed
- [ ] PostgreSQL service running
- [ ] Database `thinktap` created
- [ ] User `thinktap` created with password
- [ ] Permissions granted
- [ ] PostgreSQL accessible from localhost

## Node.js Installation

- [ ] Node.js 20 installed
- [ ] npm installed
- [ ] Node.js version verified (`node --version`)
- [ ] PM2 installed globally
- [ ] PM2 version verified (`pm2 --version`)

## Redis Installation

- [ ] Redis installed
- [ ] Redis service running
- [ ] Redis accessible (`redis-cli ping` returns PONG)
- [ ] Redis enabled on boot

## Nginx Installation

- [ ] Nginx installed
- [ ] Nginx service running
- [ ] Nginx accessible (`curl http://localhost` works)
- [ ] Nginx enabled on boot

## Project Setup

- [ ] Project cloned to `~/thinktap`
- [ ] All files present

## Backend Setup

- [ ] Backend dependencies installed (`npm install`)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Backend `.env` file created
- [ ] Database URL configured in `.env`
- [ ] JWT secrets generated and set
- [ ] CORS_ORIGIN configured with `thinktap.link`
- [ ] Database migrations run (`npx prisma migrate deploy`)
- [ ] Backend built (`npm run build`)
- [ ] Backend running with PM2
- [ ] PM2 startup configured
- [ ] Backend accessible at `http://localhost:3001`

## Frontend Setup

- [ ] Frontend dependencies installed (`npm install`)
- [ ] Frontend `.env` file created
- [ ] `NEXT_PUBLIC_API_URL` configured
- [ ] `NEXT_PUBLIC_SOCKET_URL` configured
- [ ] Frontend built (`npm run build`)
- [ ] Frontend running with PM2
- [ ] Frontend accessible at `http://localhost:3000`

## SSL Certificate

- [ ] Certbot installed
- [ ] SSL certificate obtained for `thinktap.link` and `www.thinktap.link`
- [ ] Certificate auto-renewal tested
- [ ] Certbot timer enabled

## Nginx Configuration

- [ ] Nginx site config created at `/etc/nginx/sites-available/thinktap`
- [ ] SSL certificates configured
- [ ] Frontend proxy configured (port 3000)
- [ ] Backend API proxy configured (port 3001)
- [ ] WebSocket proxy configured (`/socket.io/`)
- [ ] Rate limiting configured
- [ ] Security headers configured
- [ ] Site enabled (`ln -s` to sites-enabled)
- [ ] Nginx config tested (`sudo nginx -t`)
- [ ] Nginx reloaded

## Verification

- [ ] Backend health check passes (`curl http://localhost:3001/health`)
- [ ] Frontend loads (`curl http://localhost:3000`)
- [ ] HTTPS working (`https://thinktap.link`)
- [ ] API accessible (`https://thinktap.link/api/health`)
- [ ] Can register account
- [ ] Can login
- [ ] Can create session
- [ ] Real-time features working (Socket.io)

## Post-Deployment

- [ ] Backup script created
- [ ] Backup cron job configured
- [ ] PM2 processes saved
- [ ] All services enabled on boot
- [ ] Monitoring set up
- [ ] Logs accessible

## Security

- [ ] Strong database password set
- [ ] JWT secrets generated (not default)
- [ ] SSL/TLS enabled
- [ ] Firewall active
- [ ] Environment variables secured
- [ ] `.env` files not in git
- [ ] Regular backups scheduled

---

## Quick Commands Reference

### PM2
```bash
pm2 status                    # View all processes
pm2 logs                      # View all logs
pm2 restart thinktap-backend  # Restart backend
pm2 restart thinktap-frontend # Restart frontend
pm2 save                      # Save current list
```

### Nginx
```bash
sudo nginx -t                 # Test config
sudo systemctl reload nginx   # Reload config
sudo tail -f /var/log/nginx/error.log  # View errors
```

### PostgreSQL
```bash
sudo systemctl status postgresql  # Check status
sudo -u postgres psql -d thinktap # Connect to DB
```

### Services
```bash
sudo systemctl status postgresql  # PostgreSQL
sudo systemctl status redis-server # Redis
sudo systemctl status nginx       # Nginx
```

---

**Full Guide:** See `VPS_MANUAL_DEPLOYMENT_GUIDE.md` for detailed instructions.

