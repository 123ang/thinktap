# ✅ VPS Deployment Checklist

Use this checklist to ensure you complete all steps correctly.

## Pre-Deployment

- [ ] VPS server provisioned and accessible
- [ ] Domain name purchased and DNS configured
- [ ] Domain DNS A record pointing to VPS IP
- [ ] SSH access to server working
- [ ] Root or sudo access confirmed

## Server Setup

- [ ] System updated (`sudo apt update && sudo apt upgrade -y`)
- [ ] Docker installed and working (`docker --version`)
- [ ] Docker Compose installed (`docker compose version`)
- [ ] User added to docker group (optional)
- [ ] Firewall configured (ports 22, 80, 443 open)

## Project Setup

- [ ] Project cloned/uploaded to server
- [ ] Backend `.env` file created with:
  - [ ] Database URL
  - [ ] JWT_SECRET (generated)
  - [ ] JWT_REFRESH_SECRET (generated)
  - [ ] CORS_ORIGIN (your domain)
- [ ] Frontend `.env` file created with:
  - [ ] NEXT_PUBLIC_API_URL
  - [ ] NEXT_PUBLIC_SOCKET_URL
- [ ] Root `.env` file created with:
  - [ ] DB_PASSWORD
  - [ ] JWT_SECRET
  - [ ] JWT_REFRESH_SECRET
  - [ ] API_URL
  - [ ] SOCKET_URL

## SSL Certificate

- [ ] Certbot installed
- [ ] SSL certificate obtained
- [ ] Certificates copied to `nginx/ssl/` directory
- [ ] Nginx config updated with your domain
- [ ] Auto-renewal tested

## Deployment

- [ ] Docker images built successfully
- [ ] All services started (`docker compose up -d`)
- [ ] Database migrations run (`prisma migrate deploy`)
- [ ] All containers running (`docker compose ps`)

## Verification

- [ ] Backend health check passes (`/api/health`)
- [ ] Frontend loads in browser
- [ ] SSL certificate working (HTTPS)
- [ ] Can register new account
- [ ] Can login
- [ ] Can create session
- [ ] Can join session
- [ ] Real-time features working (Socket.io)

## Post-Deployment

- [ ] Backup script created
- [ ] Backup cron job configured
- [ ] Logs accessible and monitored
- [ ] Firewall rules verified
- [ ] Security checklist completed

## Security

- [ ] Strong passwords set (database, JWT secrets)
- [ ] Environment variables secured
- [ ] SSL/TLS enabled
- [ ] CORS properly configured
- [ ] Firewall active
- [ ] Regular backups scheduled

## Monitoring

- [ ] Service health checks working
- [ ] Log rotation configured
- [ ] Resource monitoring set up (optional)
- [ ] Uptime monitoring configured (optional)

---

**Quick Commands Reference:**

```bash
# Check services
docker compose ps

# View logs
docker compose logs -f

# Restart services
docker compose restart

# Stop services
docker compose down

# Start services
docker compose up -d

# Run migrations
docker compose exec backend npx prisma migrate deploy
```

---

**Need Help?** See `VPS_DEPLOYMENT_GUIDE.md` for detailed instructions.

