# 🔑 JWT Secret Generation Guide

## Quick Answer

**You need to run the command TWICE** - once for `JWT_SECRET` and once for `JWT_REFRESH_SECRET`. They must be different values!

---

## Step-by-Step

### Step 1: Generate JWT_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Example output:**
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890abcdef
```

**Copy this value** - use it for `JWT_SECRET`

---

### Step 2: Generate JWT_REFRESH_SECRET

**Run the same command again:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Example output (will be different):**
```
x9y8z7w6v5u4321098765432109876543210fedcba9876543210fedcba9876543210fedcba
```

**Copy this value** - use it for `JWT_REFRESH_SECRET`

---

## Why Two Different Secrets?

- **JWT_SECRET**: Used for access tokens (short-lived, 15 minutes)
- **JWT_REFRESH_SECRET**: Used for refresh tokens (long-lived, 7 days)

Using different secrets provides better security - if one is compromised, the other remains secure.

---

## Where to Use Them

### Backend `.env` file:
```env
JWT_SECRET="a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890abcdef"
JWT_REFRESH_SECRET="x9y8z7w6v5u4321098765432109876543210fedcba9876543210fedcba9876543210fedcba"
```

### Root `.env` file (for Docker):
```env
JWT_SECRET="a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890abcdef"
JWT_REFRESH_SECRET="x9y8z7w6v5u4321098765432109876543210fedcba9876543210fedcba9876543210fedcba"
```

**Important:** Use the **same values** in both files!

---

## Common Mistakes

### ❌ Wrong: Using the same secret for both
```env
JWT_SECRET="same-secret-here"
JWT_REFRESH_SECRET="same-secret-here"  # ❌ Don't do this!
```

### ✅ Correct: Using different secrets
```env
JWT_SECRET="first-secret-here"
JWT_REFRESH_SECRET="different-secret-here"  # ✅ Different value!
```

---

## Quick Copy-Paste Commands

**For Windows PowerShell:**
```powershell
# First secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Second secret (run again)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**For Linux/Mac:**
```bash
# First secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Second secret (run again)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Verification

After setting up, verify your secrets are:
- ✅ Different from each other
- ✅ At least 64 characters long
- ✅ Set in both `backend/.env` and root `.env` (if using Docker)
- ✅ Not committed to git (check `.gitignore`)

---

## Troubleshooting

### "JWT_SECRET must be defined"
- Check that `JWT_SECRET` is set in your `.env` file
- Make sure there are no quotes around the value (or use proper quotes)
- Restart your backend after changing `.env`

### "Invalid token"
- Verify both secrets are set correctly
- Make sure you're using the same secrets that were used to create the tokens
- Check for typos or extra spaces in your `.env` file

---

**Remember:** 
1. Run the command **TWICE**
2. Get **TWO different values**
3. Use first value for `JWT_SECRET`
4. Use second value for `JWT_REFRESH_SECRET`
5. Use **same values** in both `backend/.env` and root `.env`

