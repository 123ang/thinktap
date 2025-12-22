#!/bin/bash
# Database Reset Script
# Drops and recreates the thinktap database

set -e  # Exit on error

echo "🔄 Starting database reset..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="thinktap"
DB_USER="thinktap"
POSTGRES_USER="postgres"

# Step 1: Stop backend
echo -e "${YELLOW}📦 Stopping backend...${NC}"
pm2 stop thinktap-backend 2>/dev/null || echo "Backend not running or PM2 not available"

# Step 2: Terminate all connections
echo -e "${YELLOW}🔌 Terminating database connections...${NC}"
psql -U $POSTGRES_USER -d postgres << EOF 2>/dev/null || true
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = '$DB_NAME'
  AND pid <> pg_backend_pid();
EOF

# Step 3: Drop and recreate database
echo -e "${YELLOW}🗑️  Dropping database...${NC}"
psql -U $POSTGRES_USER << EOF
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF

# Step 4: Set permissions
echo -e "${YELLOW}🔐 Setting permissions...${NC}"
psql -U $POSTGRES_USER -d $DB_NAME << EOF
GRANT ALL ON SCHEMA public TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;
EOF

# Step 5: Navigate to backend
cd ~/projects/thinktap/backend || cd backend || (echo "❌ Backend directory not found!" && exit 1)

# Step 6: Apply Prisma schema
echo -e "${YELLOW}📊 Applying Prisma schema...${NC}"
npx prisma db push --accept-data-loss || npx prisma migrate deploy

# Step 7: Generate Prisma Client
echo -e "${YELLOW}🔧 Generating Prisma Client...${NC}"
npx prisma generate

# Step 8: Restart backend
echo -e "${YELLOW}🚀 Restarting backend...${NC}"
pm2 start thinktap-backend 2>/dev/null || echo "Backend not managed by PM2"

echo -e "${GREEN}✅ Database reset complete!${NC}"
echo ""
echo "Verify with:"
echo "  psql -U $DB_USER -d $DB_NAME -c '\\dt'"
echo "  npx prisma migrate status"

