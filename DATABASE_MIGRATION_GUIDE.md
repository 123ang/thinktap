# 🗄️ Database Migration Guide

Complete guide for implementing database changes using Prisma.

## Overview

This project uses **Prisma** as the ORM with **PostgreSQL**. All database schema changes are managed through Prisma migrations.

---

## 📋 Prerequisites

1. **PostgreSQL** is installed and running
2. **Database** is created (e.g., `thinktap`)
3. **DATABASE_URL** is configured in `backend/.env`
4. **Prisma** is installed (`npm install` in backend directory)

---

## 🔄 Workflow: Making Database Changes

### Step 1: Update Prisma Schema

Edit the schema file:
```bash
cd backend
nano prisma/schema.prisma
# or
code prisma/schema.prisma
```

**Example changes:**
- Add a new field to a model
- Create a new model
- Modify relationships
- Add/remove indexes

### Step 2: Create Migration

After modifying the schema, create a migration:

```bash
cd backend

# Create a new migration (development)
npx prisma migrate dev --name your_migration_name

# Example:
npx prisma migrate dev --name add_user_avatar_field
```

**What this does:**
- Creates a new migration file in `prisma/migrations/`
- Applies the migration to your development database
- Regenerates the Prisma Client

### Step 3: Review Migration

Check the generated migration file:

```bash
# List migrations
ls -la prisma/migrations/

# View the latest migration
cat prisma/migrations/YYYYMMDDHHMMSS_your_migration_name/migration.sql
```

### Step 4: Test Locally

```bash
# Start your backend
npm run start:dev

# Test the changes work correctly
```

---

## 🚀 Applying Migrations on VPS (Production)

### Method 1: Using Prisma Migrate Deploy (Recommended)

This applies pending migrations without creating new ones:

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Navigate to backend directory
cd ~/projects/thinktap/backend

# Make sure DATABASE_URL is set in .env
cat .env | grep DATABASE_URL

# Apply pending migrations
npx prisma migrate deploy

# This will:
# - Check which migrations haven't been applied
# - Apply only the pending migrations
# - Not create new migrations
```

### Method 2: Manual Migration

If you need more control:

```bash
cd ~/projects/thinktap/backend

# 1. Pull latest code (if using git)
git pull

# 2. Install dependencies (if needed)
npm install

# 3. Generate Prisma Client
npx prisma generate

# 4. Apply migrations
npx prisma migrate deploy

# 5. Restart backend
pm2 restart thinktap-backend
```

---

## 📝 Common Migration Scenarios

### Scenario 1: Add a New Field

**1. Update Schema:**
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  avatar    String?  // New field
  createdAt DateTime @default(now())
}
```

**2. Create Migration:**
```bash
npx prisma migrate dev --name add_user_avatar
```

**3. Apply to Production:**
```bash
npx prisma migrate deploy
```

### Scenario 2: Create a New Model

**1. Update Schema:**
```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  message   String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}

model User {
  // ... existing fields
  notifications Notification[]
}
```

**2. Create Migration:**
```bash
npx prisma migrate dev --name add_notifications
```

### Scenario 3: Modify Existing Field

**1. Update Schema:**
```prisma
model User {
  email String @unique @db.VarChar(255) // Add length constraint
}
```

**2. Create Migration:**
```bash
npx prisma migrate dev --name update_email_constraint
```

**⚠️ Warning:** Modifying existing fields may require data migration if you have existing data.

### Scenario 4: Add Index

**1. Update Schema:**
```prisma
model Session {
  // ... existing fields
  
  @@index([status, createdAt]) // Composite index
}
```

**2. Create Migration:**
```bash
npx prisma migrate dev --name add_session_status_index
```

---

## 🔧 Prisma Commands Reference

### Development Commands

```bash
# Create and apply migration (dev)
npx prisma migrate dev --name migration_name

# Reset database (⚠️ DESTROYS ALL DATA)
npx prisma migrate reset

# Generate Prisma Client only
npx prisma generate

# View database in Prisma Studio (GUI)
npx prisma studio

# Format schema file
npx prisma format
```

### Production Commands

```bash
# Apply pending migrations (production)
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Generate Prisma Client
npx prisma generate
```

---

## 🛠️ Troubleshooting

### Error: "Migration failed to apply"

**Solution:**
```bash
# Check migration status
npx prisma migrate status

# If migration is marked as failed, resolve manually:
# 1. Fix the migration SQL if needed
# 2. Mark migration as applied manually (if safe)
# 3. Or rollback and reapply
```

### Error: "Database schema is not in sync"

**Solution:**
```bash
# Reset and reapply (⚠️ DESTROYS DATA in dev only)
npx prisma migrate reset

# Or manually sync:
npx prisma db push  # ⚠️ Use with caution in production
```

### Error: "Permission denied for schema public"

**Solution:**
```bash
# Grant permissions to database user
psql -U postgres -d thinktap

# In PostgreSQL:
GRANT ALL ON SCHEMA public TO thinktap;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO thinktap;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO thinktap;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO thinktap;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO thinktap;
```

### Error: "Migration already applied"

**Solution:**
```bash
# Check which migrations are applied
npx prisma migrate status

# If migration shows as applied but schema is out of sync:
npx prisma migrate resolve --applied migration_name
```

---

## 📦 Complete VPS Deployment Workflow

### Initial Setup

```bash
# 1. SSH into VPS
ssh root@your-vps-ip

# 2. Navigate to project
cd ~/projects/thinktap/backend

# 3. Ensure .env is configured
cat .env | grep DATABASE_URL
# Should show: DATABASE_URL="postgresql://thinktap:password@localhost:5432/thinktap"

# 4. Install dependencies (if needed)
npm install

# 5. Generate Prisma Client
npx prisma generate

# 6. Apply all migrations
npx prisma migrate deploy

# 7. Verify
npx prisma migrate status
```

### After Code Updates

```bash
# 1. Pull latest code
cd ~/projects/thinktap
git pull

# 2. Navigate to backend
cd backend

# 3. Install new dependencies (if any)
npm install

# 4. Generate Prisma Client
npx prisma generate

# 5. Apply new migrations
npx prisma migrate deploy

# 6. Restart backend
pm2 restart thinktap-backend

# 7. Check logs
pm2 logs thinktap-backend
```

---

## 🔍 Verifying Migrations

### Check Migration Status

```bash
cd backend
npx prisma migrate status
```

**Output shows:**
- ✅ Applied migrations
- ⏳ Pending migrations
- ❌ Failed migrations

### View Database Schema

```bash
# Open Prisma Studio (web GUI)
npx prisma studio

# Or connect directly to PostgreSQL
psql -U thinktap -d thinktap
\dt  # List tables
\d+ table_name  # Describe table
```

### Check Applied Migrations

```bash
# In PostgreSQL
psql -U thinktap -d thinktap

SELECT * FROM "_prisma_migrations" ORDER BY finished_at DESC;
```

---

## ⚠️ Important Notes

1. **Always backup** before applying migrations in production
2. **Test migrations** in development first
3. **Review migration SQL** before applying to production
4. **Never use `prisma migrate reset`** in production
5. **Use `prisma migrate deploy`** in production, not `prisma migrate dev`

---

## 📚 Best Practices

1. **Name migrations descriptively:**
   ```bash
   npx prisma migrate dev --name add_user_preferences_table
   ```

2. **Keep migrations small and focused:**
   - One logical change per migration
   - Easier to review and rollback if needed

3. **Review generated SQL:**
   - Check `prisma/migrations/*/migration.sql`
   - Ensure it matches your intent

4. **Test in development first:**
   - Always test migrations locally
   - Verify data integrity after migration

5. **Document breaking changes:**
   - If migration requires code changes, document them
   - Update API documentation if needed

---

## 🆘 Emergency Rollback

If a migration causes issues:

```bash
# 1. Stop the backend
pm2 stop thinktap-backend

# 2. Connect to database
psql -U thinktap -d thinktap

# 3. Manually rollback the migration SQL
# (Reverse the changes from migration.sql)

# 4. Mark migration as rolled back
DELETE FROM "_prisma_migrations" WHERE migration_name = 'problematic_migration';

# 5. Fix the migration file
# 6. Reapply when ready
```

---

## 📞 Quick Reference

| Task | Command |
|------|---------|
| Create migration | `npx prisma migrate dev --name name` |
| Apply migrations (prod) | `npx prisma migrate deploy` |
| Check status | `npx prisma migrate status` |
| Generate client | `npx prisma generate` |
| View database | `npx prisma studio` |
| Reset (dev only) | `npx prisma migrate reset` |

---

## Example: Complete Migration Workflow

```bash
# 1. Make schema change
# Edit: backend/prisma/schema.prisma

# 2. Create migration
cd backend
npx prisma migrate dev --name add_user_phone_number

# 3. Test locally
npm run start:dev
# Test the new field works

# 4. Commit changes
git add prisma/
git commit -m "Add user phone number field"

# 5. Deploy to VPS
ssh root@vps
cd ~/projects/thinktap
git pull
cd backend
npx prisma migrate deploy
pm2 restart thinktap-backend
```

---

That's it! You're ready to manage database changes. 🎉

