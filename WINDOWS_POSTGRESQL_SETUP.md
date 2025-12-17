# 🪟 Windows PostgreSQL Setup Guide

## Quick Fix for "psql: command not found"

### ✅ Solution 1: Use Full Path (Immediate Fix)

1. **Find your PostgreSQL installation:**
   - Open File Explorer
   - Go to: `C:\Program Files\PostgreSQL\`
   - Look for a folder with a version number (e.g., `15`, `16`, `17`)

2. **Use the full path in PowerShell:**
   ```powershell
   & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres
   ```
   ⚠️ **Replace `16` with your actual PostgreSQL version!**

3. **Enter your password when prompted**

4. **Create the database:**
   ```sql
   CREATE DATABASE thinktap;
   CREATE USER thinktap WITH PASSWORD 'yourpassword';
   GRANT ALL PRIVILEGES ON DATABASE thinktap TO thinktap;
   \q
   ```

---

### ✅ Solution 2: Add PostgreSQL to PATH (Permanent Fix)

**Step-by-Step:**

1. **Open Environment Variables:**
   - Press `Windows + X`
   - Click "System"
   - Click "Advanced system settings" (on the right)
   - Click "Environment Variables" button

2. **Edit PATH:**
   - Under "System variables" (bottom section)
   - Find and select "Path"
   - Click "Edit..."

3. **Add PostgreSQL:**
   - Click "New"
   - Type: `C:\Program Files\PostgreSQL\16\bin`
     - ⚠️ **Replace `16` with your PostgreSQL version!**
   - Click "OK"

4. **Apply Changes:**
   - Click "OK" on all open dialogs
   - **Close PowerShell completely**
   - **Open a new PowerShell window**

5. **Test:**
   ```powershell
   psql -U postgres
   ```
   ✅ Should work now!

---

### ✅ Solution 3: Use pgAdmin (GUI - Easiest for Beginners)

**No command line needed!**

1. **Open pgAdmin 4:**
   - Search for "pgAdmin 4" in Windows Start Menu
   - Click to open

2. **Connect to Server:**
   - Enter your master password (set during PostgreSQL installation)
   - Click "OK"

3. **Create Database:**
   - In left sidebar: Right-click "Databases" → "Create" → "Database"
   - Name: `thinktap`
   - Click "Save"

4. **Create User:**
   - Right-click "thinktap" database → "Query Tool"
   - Paste this SQL:
     ```sql
     CREATE USER thinktap WITH PASSWORD 'yourpassword';
     GRANT ALL PRIVILEGES ON DATABASE thinktap TO thinktap;
     ```
   - Click "Execute" (or press F5)

5. **Done!** ✅

---

## Finding Your PostgreSQL Version

### Method 1: File Explorer
```
C:\Program Files\PostgreSQL\
├── 15/
├── 16/  ← This is your version
└── 17/
```

### Method 2: PowerShell
```powershell
Get-ChildItem "C:\Program Files\PostgreSQL\" | Select-Object Name
```

### Method 3: Check pgAdmin
- Open pgAdmin 4
- Look at the server name in the left sidebar (usually shows version)

---

## Common PostgreSQL Installation Paths

```
C:\Program Files\PostgreSQL\16\bin\psql.exe
C:\Program Files\PostgreSQL\15\bin\psql.exe
C:\Program Files (x86)\PostgreSQL\16\bin\psql.exe
```

---

## Quick Commands Reference

### Using Full Path (No PATH setup needed)
```powershell
# Connect to PostgreSQL
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres

# Create database (after connecting)
CREATE DATABASE thinktap;

# Create user
CREATE USER thinktap WITH PASSWORD 'yourpassword';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE thinktap TO thinktap;

# Exit
\q
```

### Using PATH (After adding to PATH)
```powershell
# Connect
psql -U postgres

# Then same SQL commands as above
```

---

## Troubleshooting

### "Access Denied" or "Password Incorrect"
- Make sure you're using the password you set during PostgreSQL installation
- Default user is `postgres` (not `root` or `admin`)

### "Database already exists"
- The database was already created
- You can skip the `CREATE DATABASE` step
- Or drop it first: `DROP DATABASE thinktap;`

### "Permission denied"
- Make sure you're running PowerShell as Administrator
- Or use the `postgres` superuser account

### Still Can't Find PostgreSQL?
1. Check if PostgreSQL is installed:
   ```powershell
   Get-Service -Name postgresql*
   ```

2. If not installed, download from:
   https://www.postgresql.org/download/windows/

3. During installation, make sure to:
   - ✅ Check "Command Line Tools"
   - ✅ Remember your password!
   - ✅ Note the port (usually 5432)

---

## Alternative: Use Docker (Advanced)

If you prefer not to install PostgreSQL directly:

```powershell
# Install Docker Desktop first, then:
docker run --name thinktap-db `
  -e POSTGRES_PASSWORD=yourpassword `
  -e POSTGRES_DB=thinktap `
  -p 5432:5432 `
  -d postgres:16
```

Then use:
```powershell
docker exec -it thinktap-db psql -U postgres
```

---

## Quick Test

After setup, test your connection:

```powershell
# If using PATH:
psql -U postgres -d thinktap

# If using full path:
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d thinktap
```

You should see:
```
thinktap=#
```

Type `\q` to exit.

---

## Summary

**Easiest Method for Beginners:**
1. ✅ Use **pgAdmin 4** (GUI) - No command line needed!

**Quick Fix:**
2. ✅ Use **full path** to psql.exe

**Best Long-term:**
3. ✅ **Add PostgreSQL to PATH** - Then `psql` works everywhere!

---

**Need Help?** Check `LOCAL_TESTING_GUIDE.md` section 2.6 for more details!


