# PostgreSQL Database Management Guide

## How to Change/Switch Databases in PostgreSQL

### 1. Using psql Command Line

#### Connect to a Specific Database Directly
```bash
# Connect to a specific database
psql -U username -d database_name

# Example: Connect to thinktap database
psql -U thinktap -d thinktap

# Or as postgres user
psql -U postgres -d thinktap
```

#### Switch Database While Already in psql
```sql
-- List all databases
\l

-- Connect to a different database
\c database_name

-- Example: Switch to thinktap database
\c thinktap

-- Example: Switch to postgres database
\c postgres
```

#### Connect with Full Connection String
```bash
psql "postgresql://username:password@localhost:5432/database_name"

# Example
psql "postgresql://thinktap:yourpassword@localhost:5432/thinktap"
```

---

### 2. Change Database in Your Application

#### Backend (.env file)
```env
# Current database
DATABASE_URL="postgresql://thinktap:password@localhost:5432/thinktap"

# Change to different database
DATABASE_URL="postgresql://thinktap:password@localhost:5432/new_database_name"
```

#### After Changing .env
```bash
cd backend

# Regenerate Prisma client (if needed)
npx prisma generate

# Run migrations on new database
npx prisma migrate deploy

# Or for development
npx prisma migrate dev
```

---

### 3. Create a New Database

#### Using psql
```sql
-- Connect as postgres user
psql -U postgres

-- Create new database
CREATE DATABASE new_database_name;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE new_database_name TO your_username;
```

#### Using Command Line
```bash
# Create database from command line
createdb -U postgres new_database_name

# Or with specific owner
createdb -U postgres -O your_username new_database_name
```

---

### 4. List All Databases

#### In psql
```sql
\l
-- or
\list
```

#### From Command Line
```bash
psql -U postgres -l
```

---

### 5. Drop/Delete a Database

#### Using psql
```sql
-- Connect to postgres database first (can't drop database you're connected to)
\c postgres

-- Drop database
DROP DATABASE database_name;

-- Drop with force (disconnect all connections first)
DROP DATABASE database_name WITH (FORCE);
```

#### Using Command Line
```bash
dropdb -U postgres database_name
```

---

### 6. Rename a Database

```sql
-- Connect to postgres database
\c postgres

-- Rename database
ALTER DATABASE old_name RENAME TO new_name;
```

---

### 7. Copy/Clone a Database

```bash
# Method 1: Using pg_dump and psql
pg_dump -U postgres old_database > backup.sql
psql -U postgres -d new_database < backup.sql

# Method 2: Direct copy
createdb -U postgres -T old_database new_database
```

---

### 8. Check Current Database

#### In psql
```sql
-- Show current database
SELECT current_database();

-- Or use shortcut
\c
```

---

### 9. Common PostgreSQL Commands

```sql
-- Show current user
SELECT current_user;

-- Show current database
SELECT current_database();

-- Show all tables in current database
\dt

-- Show all schemas
\dn

-- Show table structure
\d table_name

-- Exit psql
\q
```

---

### 10. For ThinkTap Project

#### Change Database Name

**Step 1: Update .env file**
```env
# backend/.env
DATABASE_URL="postgresql://thinktap:password@localhost:5432/new_database_name"
```

**Step 2: Create the new database**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create new database
CREATE DATABASE new_database_name;
CREATE USER thinktap WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE new_database_name TO thinktap;
\q
```

**Step 3: Run migrations**
```bash
cd backend
npx prisma migrate deploy
```

#### Switch Between Development and Production Databases

**Development (.env)**
```env
DATABASE_URL="postgresql://thinktap:password@localhost:5432/thinktap_dev"
```

**Production (.env.production)**
```env
DATABASE_URL="postgresql://thinktap:password@localhost:5432/thinktap_prod"
```

---

### 11. Troubleshooting

#### "Database does not exist"
```bash
# Check if database exists
psql -U postgres -l | grep database_name

# Create if missing
createdb -U postgres database_name
```

#### "Permission denied"
```sql
-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE database_name TO username;
GRANT ALL ON SCHEMA public TO username;
```

#### "Database is being accessed by other users"
```sql
-- Find active connections
SELECT pid, usename, datname 
FROM pg_stat_activity 
WHERE datname = 'database_name';

-- Terminate connections (be careful!)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'database_name' AND pid <> pg_backend_pid();
```

---

### 12. Quick Reference

```bash
# Connect to database
psql -U username -d database_name

# List databases
psql -U postgres -l

# Create database
createdb -U postgres database_name

# Drop database
dropdb -U postgres database_name

# Backup database
pg_dump -U postgres database_name > backup.sql

# Restore database
psql -U postgres -d database_name < backup.sql
```

---

**For ThinkTap specific help:**
- Database name is set in `backend/.env` as `DATABASE_URL`
- Default database name: `thinktap`
- Default user: `thinktap`
- After changing database, run: `npx prisma migrate deploy`

