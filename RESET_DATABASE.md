# 🔄 Reset Database - Drop and Recreate

Complete guide to drop and recreate your PostgreSQL database to match the new schema.

## ⚠️ WARNING

**This will DELETE ALL DATA in your database!** Make sure you have a backup if you need to preserve any data.

---

## 📋 Prerequisites

- PostgreSQL is running
- You have access to the `postgres` superuser or the `thinktap` user
- Database connection string: `postgresql://thinktap:920214@localhost:5432/thinktap`

---

## 🔄 Method 1: Using Prisma (Recommended)

### Step 1: Drop and Recreate Database

```bash
# Navigate to backend directory
cd backend

# Reset database (drops, recreates, and applies all migrations)
npx prisma migrate reset

# This will:
# - Drop the database
# - Create a new database
# - Apply all migrations from scratch
# - Run seed script if you have one
```

**Note:** This requires the `thinktap` user to have database creation privileges.

### Step 2: Verify

```bash
# Check migration status
npx prisma migrate status

# Should show all migrations as applied

# Generate Prisma Client
npx prisma generate
```

---

## 🔄 Method 2: Manual PostgreSQL Commands

### Step 1: Connect to PostgreSQL

```bash
# Connect as postgres superuser
psql -U postgres

# Or connect directly to the database
psql -U thinktap -d thinktap
```

### Step 2: Drop and Recreate Database

**Option A: Using postgres superuser (Recommended)**

```bash
# Connect as postgres
psql -U postgres

# In PostgreSQL prompt:
-- Terminate all connections to the database
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'thinktap'
  AND pid <> pg_backend_pid();

-- Drop the database
DROP DATABASE IF EXISTS thinktap;

-- Recreate the database
CREATE DATABASE thinktap;

-- Grant privileges to thinktap user
GRANT ALL PRIVILEGES ON DATABASE thinktap TO thinktap;

-- Connect to the new database
\c thinktap

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO thinktap;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO thinktap;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO thinktap;

-- Exit
\q
```

**Option B: Using thinktap user (if it has privileges)**

```bash
# Connect as thinktap user
psql -U thinktap -d postgres

# In PostgreSQL prompt:
DROP DATABASE IF EXISTS thinktap;
CREATE DATABASE thinktap;
\q
```

### Step 3: Apply Prisma Schema

```bash
# Navigate to backend
cd backend

# Push schema to database (creates tables without migrations)
npx prisma db push

# OR apply migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

---

## 🚀 Complete Reset Script (One Command)

### For VPS (Production-like)

```bash
#!/bin/bash
# Save as: reset-db.sh

cd ~/projects/thinktap/backend

# Stop backend to avoid connection issues
pm2 stop thinktap-backend

# Connect and reset database
psql -U postgres << EOF
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'thinktap'
  AND pid <> pg_backend_pid();

DROP DATABASE IF EXISTS thinktap;
CREATE DATABASE thinktap;
GRANT ALL PRIVILEGES ON DATABASE thinktap TO thinktap;
EOF

# Connect to new database and set permissions
psql -U postgres -d thinktap << EOF
GRANT ALL ON SCHEMA public TO thinktap;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO thinktap;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO thinktap;
EOF

# Apply Prisma schema
npx prisma db push --force-reset
# OR
# npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Restart backend
pm2 start thinktap-backend

echo "Database reset complete!"
```

**Make it executable and run:**
```bash
chmod +x reset-db.sh
./reset-db.sh
```

---

## 🔧 Quick Reset Commands

### Option 1: Prisma Reset (Easiest)

```bash
cd backend
npx prisma migrate reset
```

### Option 2: Manual SQL + Prisma

```bash
# Drop and recreate
psql -U postgres -c "DROP DATABASE IF EXISTS thinktap;"
psql -U postgres -c "CREATE DATABASE thinktap;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE thinktap TO thinktap;"

# Apply schema
cd backend
npx prisma db push
npx prisma generate
```

### Option 3: Using Prisma DB Push with Force Reset

```bash
cd backend

# This will drop and recreate the database
npx prisma db push --force-reset

# Generate client
npx prisma generate
```

---

## 📝 Step-by-Step for Your VPS

### 1. Stop Backend

```bash
pm2 stop thinktap-backend
```

### 2. Drop Database

```bash
# Connect as postgres user
psql -U postgres

# Run these commands:
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'thinktap'
  AND pid <> pg_backend_pid();

DROP DATABASE IF EXISTS thinktap;
CREATE DATABASE thinktap;
GRANT ALL PRIVILEGES ON DATABASE thinktap TO thinktap;
\q
```

### 3. Set Permissions

```bash
psql -U postgres -d thinktap << EOF
GRANT ALL ON SCHEMA public TO thinktap;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO thinktap;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO thinktap;
EOF
```

### 4. Apply Schema

```bash
cd ~/projects/thinktap/backend

# Option A: Push schema directly
npx prisma db push

# Option B: Apply migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 5. Restart Backend

```bash
pm2 start thinktap-backend
pm2 logs thinktap-backend
```

---

## 🔍 Verify Database Reset

### Check Tables

```bash
psql -U thinktap -d thinktap

# List all tables
\dt

# Should show tables from your schema:
# - User
# - Quiz
# - Session
# - Question
# - Response
# - _prisma_migrations

# Exit
\q
```

### Check Migration Status

```bash
cd backend
npx prisma migrate status
```

### Test Connection

```bash
cd backend
npx prisma studio
# Opens web interface at http://localhost:5555
```

---

## ⚠️ Troubleshooting

### Error: "database is being accessed by other users"

**Solution:**
```bash
# Terminate all connections first
psql -U postgres << EOF
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'thinktap'
  AND pid <> pg_backend_pid();
EOF

# Then drop
psql -U postgres -c "DROP DATABASE thinktap;"
```

### Error: "permission denied to create database"

**Solution:**
```bash
# Use postgres superuser
psql -U postgres

# Or grant privileges:
ALTER USER thinktap CREATEDB;
```

### Error: "permission denied for schema public"

**Solution:**
```bash
psql -U postgres -d thinktap << EOF
GRANT ALL ON SCHEMA public TO thinktap;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO thinktap;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO thinktap;
EOF
```

---

## 🎯 Recommended Approach

For your specific case with connection string `postgresql://thinktap:920214@localhost:5432/thinktap`:

```bash
# 1. Stop backend
pm2 stop thinktap-backend

# 2. Drop and recreate (as postgres user)
psql -U postgres << EOF
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'thinktap' AND pid <> pg_backend_pid();
DROP DATABASE IF EXISTS thinktap;
CREATE DATABASE thinktap;
GRANT ALL PRIVILEGES ON DATABASE thinktap TO thinktap;
EOF

# 3. Set permissions
psql -U postgres -d thinktap << EOF
GRANT ALL ON SCHEMA public TO thinktap;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO thinktap;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO thinktap;
EOF

# 4. Apply schema
cd ~/projects/thinktap/backend
npx prisma db push
npx prisma generate

# 5. Restart backend
pm2 start thinktap-backend
```

---

## 📦 Backup Before Reset (Optional)

If you want to backup first:

```bash
# Backup database
pg_dump -U thinktap -d thinktap > thinktap_backup_$(date +%Y%m%d_%H%M%S).sql

# Then proceed with reset
```

---

That's it! Your database will be reset and match your new schema. 🎉

