#!/bin/bash

# ThinkTap.link Environment Configuration Examples
# Copy these to your actual .env files

echo "📝 ThinkTap.link Environment Configuration"
echo "==========================================="
echo ""

echo "1. Backend .env (backend/.env):"
echo "--------------------------------"
cat << 'EOF'
DATABASE_URL=postgresql://thinktap:YOUR_STRONG_PASSWORD@postgres:5432/thinktap
JWT_SECRET=YOUR_GENERATED_JWT_SECRET_HERE
JWT_REFRESH_SECRET=YOUR_GENERATED_REFRESH_SECRET_HERE
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
REDIS_URL=redis://redis:6379
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://thinktap.link,https://www.thinktap.link
EOF

echo ""
echo "2. Frontend .env (frontend/.env):"
echo "-----------------------------------------------"
cat << 'EOF'
NEXT_PUBLIC_API_URL=https://thinktap.link/api
NEXT_PUBLIC_SOCKET_URL=https://thinktap.link
EOF

echo ""
echo "3. Root .env (.env):"
echo "---------------------"
cat << 'EOF'
DB_PASSWORD=YOUR_STRONG_DATABASE_PASSWORD_HERE
JWT_SECRET=YOUR_GENERATED_JWT_SECRET_HERE
JWT_REFRESH_SECRET=YOUR_GENERATED_REFRESH_SECRET_HERE
API_URL=https://thinktap.link/api
SOCKET_URL=https://thinktap.link
EOF

echo ""
echo "💡 To generate JWT secrets, run:"
echo "   node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
echo ""

