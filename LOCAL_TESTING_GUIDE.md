# 🧪 ThinkTap Local Testing Guide for Beginners

**Welcome!** This guide will help you set up and test ThinkTap on your computer, step by step. No prior experience needed!

---

## 📋 Before You Start

### What You'll Need (Prerequisites)

1. **Node.js** (version 20 or higher)
   - Download from: https://nodejs.org/
   - Choose the "LTS" (Long Term Support) version
   - Install it with default settings

2. **PostgreSQL** (version 16)
   - Download from: https://www.postgresql.org/download/
   - During installation, remember the password you set!
   - Default port: 5432

3. **A Code Editor** (optional but helpful)
   - VS Code (recommended): https://code.visualstudio.com/
   - Or any text editor you prefer

4. **A Web Browser**
   - Chrome, Firefox, Edge, or Safari

---

## ⏱️ Time Estimate

- **Setup**: 15-20 minutes
- **Testing**: 10-15 minutes
- **Total**: ~30 minutes

---

## 🚀 Step 1: Download the Project

### Option A: If you have Git installed
```bash
git clone <your-repository-url>
cd ThinkTap
```

### Option B: If you don't have Git
1. Download the project as a ZIP file
2. Extract it to a folder (e.g., `C:\Users\YourName\Desktop\ThinkTap`)
3. Open that folder

---

## 🔧 Step 2: Set Up the Backend

The backend is the "brain" of ThinkTap - it handles data and logic.

### 2.1 Open a Terminal/Command Prompt

**Windows:**
- Press `Windows + R`
- Type `cmd` and press Enter
- Navigate to your project folder:
  ```bash
  cd C:\Users\YourName\Desktop\ThinkTap
  ```

**Mac/Linux:**
- Open Terminal
- Navigate to your project folder:
  ```bash
  cd ~/Desktop/ThinkTap
  ```

### 2.2 Go to Backend Folder
```bash
cd backend
```

### 2.3 Install Dependencies
This downloads all the code libraries ThinkTap needs.
```bash
npm install
```
⏳ **Wait**: This might take 2-3 minutes.

### 2.4 Create Environment File

**Windows (PowerShell):**
```powershell
Copy-Item env.example .env
```

**Mac/Linux:**
```bash
cp env.example .env
```

### 2.5 Edit the Environment File

1. Open the `.env` file in your text editor
2. Find this line:
   ```
   DATABASE_URL="postgresql://thinktap:changeme@localhost:5432/thinktap"
   ```
3. Replace `changeme` with the password you set when installing PostgreSQL
4. Save the file

**Example:**
If your PostgreSQL password is `mypassword123`, change it to:
```
DATABASE_URL="postgresql://thinktap:mypassword123@localhost:5432/thinktap"
```

### 2.6 Set Up the Database

**Create the database:**

#### Option A: Using psql (Command Line) - Windows

**⚠️ Common Issue**: If you get `psql: command not found`, PostgreSQL's bin folder is not in your PATH.

**Quick Fix - Use Full Path:**
1. Find your PostgreSQL installation path (usually one of these):
   - `C:\Program Files\PostgreSQL\16\bin\psql.exe`
   - `C:\Program Files\PostgreSQL\15\bin\psql.exe`
   - `C:\Program Files (x86)\PostgreSQL\16\bin\psql.exe`

2. Open PowerShell and run:
   ```powershell
   & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres
   ```
   (Replace `16` with your PostgreSQL version number)

3. Enter your PostgreSQL password when prompted

4. Run these SQL commands:
   ```sql
   CREATE DATABASE thinktap;
   CREATE USER thinktap WITH PASSWORD 'changeme' CREATEDB;
   GRANT ALL PRIVILEGES ON DATABASE thinktap TO thinktap;
   \q
   ```
   (Replace `changeme` with your chosen password)
   
   **Important**: The `CREATEDB` privilege is required for Prisma Migrate to create shadow databases during development.

**Permanent Fix - Add PostgreSQL to PATH:**
1. Press `Windows + X` and select "System"
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Under "System variables", find and select "Path", then click "Edit"
5. Click "New" and add: `C:\Program Files\PostgreSQL\16\bin`
   (Replace `16` with your PostgreSQL version)
6. Click "OK" on all dialogs
7. **Restart PowerShell** for changes to take effect
8. Now you can use `psql -U postgres` directly!

#### Option B: Using pgAdmin (GUI - Easier for Beginners)

1. Open **pgAdmin 4** (installed with PostgreSQL)
2. Enter your master password (set during installation)
3. In the left sidebar, right-click on "Servers" → "PostgreSQL 16" → "Databases"
4. Right-click "Databases" → "Create" → "Database"
5. Name it: `thinktap`
6. Click "Save"
7. Expand "thinktap" → "Schemas" → "public"
8. Right-click "public" → "Query Tool"
9. Run this SQL:
   ```sql
   CREATE USER thinktap WITH PASSWORD 'changeme' CREATEDB;
   GRANT ALL PRIVILEGES ON DATABASE thinktap TO thinktap;
   ```
   (Replace `changeme` with your chosen password)
   
   **Important**: The `CREATEDB` privilege is required for Prisma Migrate to create shadow databases during development.

#### Option C: Using psql (Mac/Linux)

1. Open Terminal
2. Type:
   ```bash
   psql -U postgres
   ```
3. Enter your PostgreSQL password
4. Type:
   ```sql
   CREATE DATABASE thinktap;
   CREATE USER thinktap WITH PASSWORD 'changeme' CREATEDB;
   GRANT ALL PRIVILEGES ON DATABASE thinktap TO thinktap;
   \q
   ```
   (Replace `changeme` with your chosen password)
   
   **Important**: The `CREATEDB` privilege is required for Prisma Migrate to create shadow databases during development.

**Run migrations:**
Back in your original terminal, **make sure you're in the `backend` folder**:
```bash
cd backend
```

**Verify you're in the right place:**
- You should see `prisma` folder in the current directory
- Run: `ls prisma` (Mac/Linux) or `dir prisma` (Windows) to confirm

Then run:
```bash
npx prisma generate
npx prisma migrate dev
```

✅ **Success!** You should see: "Your database is now in sync with your schema."

**Alternative (if migrate dev has issues):**
If you encounter permission or lock timeout errors, you can use `db push` instead:
```bash
npx prisma generate
npx prisma db push
```
This syncs your schema without creating migration files (useful for initial setup).

⚠️ **Important**: These commands MUST be run from the `backend` directory, not from the project root!

### 2.7 Start the Backend
```bash
npm run start:dev
```

✅ **You should see**: "Application is running on: http://localhost:3001"

**🎉 Keep this terminal window open!** The backend needs to stay running.

---

## 🌐 Step 3: Set Up the Web Frontend

The frontend is what users see and interact with in their browser.

### 3.1 Open a NEW Terminal
Don't close the backend terminal! Open a second one.

### 3.2 Go to Frontend Folder
```bash
cd C:\Users\YourName\Desktop\ThinkTap\frontend
```
(Adjust path as needed)

### 3.3 Install Dependencies
```bash
npm install
```
⏳ **Wait**: This might take 2-3 minutes.

### 3.4 Create Environment File

**Windows:**
```powershell
Copy-Item env.example .env.local
```

**Mac/Linux:**
```bash
cp env.example .env.local
```

The default settings should work! No need to edit.

### 3.5 Start the Frontend
```bash
npm run dev
```

✅ **You should see**: "Ready started server on 0.0.0.0:3000"

**🎉 Keep this terminal window open too!**

---

## 🧪 Step 4: Test the Application

Now the fun part - let's test if everything works!

### 4.1 Open Your Browser
Go to: **http://localhost:3000**

You should see the ThinkTap landing page! 🎓

---

## 👤 Step 5: Test as a Lecturer (Teacher)

### 5.1 Create an Account
1. Click **"Register"** (or go to http://localhost:3000/register)
2. Enter:
   - **Email**: `lecturer@test.com`
   - **Password**: `password123`
   - **Confirm Password**: `password123`
3. Click **"Register"**

✅ **Success!** You should be logged in and see the dashboard.

### 5.2 Create Your First Session
1. On the dashboard, click **"Create Session"**
2. Choose a mode:
   - **Rush Mode**: Fast-paced, competitive
   - **Thinking Mode**: Take your time
   - **Seminar Mode**: Anonymous responses
3. Click on your chosen mode

✅ **You'll get a 6-digit code!** Write it down (e.g., `ABC123`)

### 5.3 Add a Question
1. In your session, find **"Add Question"**
2. Fill in:
   - **Question**: "What is 2 + 2?"
   - **Type**: Multiple Choice
   - **Options**: 
     - Option 1: `3`
     - Option 2: `4`
     - Option 3: `5`
   - **Correct Answer**: `4`
   - **Timer**: `30` seconds
3. Click **"Create Question"**

✅ **Question added!**

### 5.4 Start the Session
1. Click **"Start Session"**
2. Your session is now ACTIVE! ✅

---

## 👨‍🎓 Step 6: Test as a Student

Now let's join as a student to answer questions!

### 6.1 Open an Incognito/Private Window
**Why?** So you can be logged in as both lecturer and student at the same time.

**How to open:**
- **Chrome**: Ctrl+Shift+N (Windows) or Cmd+Shift+N (Mac)
- **Firefox**: Ctrl+Shift+P (Windows) or Cmd+Shift+P (Mac)
- **Edge**: Ctrl+Shift+N (Windows) or Cmd+Shift+N (Mac)

### 6.2 Go to ThinkTap
In the incognito window, go to: **http://localhost:3000**

### 6.3 Join the Session
1. Click **"Join Session"**
2. Enter the **6-digit code** you got earlier (e.g., `ABC123`)
3. Click **"Join"**

✅ **You're in!** You should see a waiting screen.

### 6.4 Answer the Question
Go back to your **lecturer window** (the regular browser window):

1. Click **"Start Question"** next to your question
2. Switch to the **student window** (incognito)
3. You should now see the question appear!
4. Click on answer **"4"**
5. Click **"Submit"**

✅ **Response submitted!**

### 6.5 View Results
Back in the **lecturer window**:

1. Click **"Show Results"**
2. Both windows should now show:
   - Response distribution
   - Correctness percentage
   - How many students answered

🎉 **It works!**

---

## 📊 Step 7: Test Analytics

### 7.1 View Session Insights
In the **lecturer window**:

1. Click **"View Insights"** or **"Analytics"**
2. You should see:
   - **Charts**: Bar charts, pie charts
   - **Statistics**: Response times, correctness rates
   - **Leaderboard**: Student rankings (if Rush Mode)

✅ **Beautiful charts!**

---

## 🔄 Step 8: Test Real-Time Features

Let's test if updates happen instantly!

### 8.1 Test Live Updates
1. Keep both windows visible (lecturer and student)
2. In the **lecturer window**, add a new question
3. Start the question
4. Watch the **student window** - it should update automatically!
5. Submit an answer in the **student window**
6. Watch the **lecturer window** - response count should increase!

✅ **Real-time working!**

---

## 🎯 Step 9: Test Different Question Types

Try creating questions with different types:

### Multiple Choice (Already done! ✅)

### True/False
1. **Question**: "The Earth is flat."
2. **Type**: True/False
3. **Correct Answer**: `False`

### Multiple Select
1. **Question**: "Which are programming languages?"
2. **Type**: Multiple Select
3. **Options**: `Python`, `HTML`, `Java`, `CSS`
4. **Correct Answers**: `Python`, `Java`

### Short Answer
1. **Question**: "What is the capital of France?"
2. **Type**: Short Answer
3. **Correct Answer**: `Paris`

### Long Answer
1. **Question**: "Explain photosynthesis."
2. **Type**: Long Answer
3. **Correct Answer**: (Manual grading)

---

## 🎨 Step 10: Test Different Session Modes

### Test Rush Mode
1. Create a new session
2. Choose **Rush Mode**
3. Add questions
4. Join as a student
5. Answer quickly!
6. Check the **Leaderboard** - fastest correct answers win!

### Test Thinking Mode
1. Create a new session
2. Choose **Thinking Mode**
3. Focus is on accuracy, not speed
4. Longer timer allowed

### Test Seminar Mode
1. Create a new session
2. Choose **Seminar Mode**
3. Student responses are **anonymous**
4. Great for sensitive topics!

---

## ✅ What to Check

Use this checklist to make sure everything works:

### Backend
- [ ] Backend starts without errors
- [ ] Can connect to database
- [ ] API responds at http://localhost:3001

### Authentication
- [ ] Can register a new account
- [ ] Can login with email/password
- [ ] Can access dashboard after login
- [ ] Can't access dashboard when logged out

### Sessions
- [ ] Can create a session
- [ ] Receives a 6-digit code
- [ ] Can join session with code
- [ ] Session status changes (Pending → Active → Ended)

### Questions
- [ ] Can add questions
- [ ] Can add all 5 question types
- [ ] Questions appear for students
- [ ] Timer counts down

### Responses
- [ ] Can submit answers
- [ ] Correctness is calculated
- [ ] Response count increases
- [ ] Response time is recorded

### Real-Time
- [ ] Updates happen instantly
- [ ] New questions appear automatically
- [ ] Results show immediately
- [ ] Timer syncs across browsers

### Analytics
- [ ] Charts display correctly
- [ ] Statistics are accurate
- [ ] Leaderboard shows rankings
- [ ] Insights page loads

### UI/UX
- [ ] Pages load quickly
- [ ] No error messages
- [ ] Buttons work
- [ ] Forms validate input
- [ ] Design looks good

---

## 🐛 Troubleshooting

### Problem: "psql: command not found" or "psql: The term 'psql' is not recognized" (Windows)
**Solution**: PostgreSQL's bin folder is not in your PATH.

**Quick Fix (Use Full Path):**
```powershell
# Find your PostgreSQL version first, then use:
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres
```
(Replace `16` with your PostgreSQL version: 15, 16, 17, etc.)

**To Find Your PostgreSQL Version:**
1. Open File Explorer
2. Navigate to `C:\Program Files\PostgreSQL\`
3. Look for folders like `15`, `16`, `17` - that's your version number

**Permanent Fix (Add to PATH):**
1. Press `Windows + X` → "System" → "Advanced system settings"
2. Click "Environment Variables"
3. Under "System variables", select "Path" → "Edit"
4. Click "New" → Add: `C:\Program Files\PostgreSQL\16\bin` (replace `16` with your version)
5. Click "OK" on all dialogs
6. **Close and reopen PowerShell** (important!)
7. Now `psql -U postgres` should work!

**Alternative - Use pgAdmin GUI:**
- Open pgAdmin 4 (installed with PostgreSQL)
- Use the GUI instead of command line (see Option B in section 2.6)

### Problem: "npm: command not found"
**Solution**: Node.js isn't installed or not in PATH.
- Reinstall Node.js from nodejs.org
- Restart your terminal

### Problem: "Port 3001 already in use"
**Solution**: Something else is using port 3001.
- Close other applications
- Or change the port in `backend/.env`: `PORT=3002`

### Problem: "Database connection failed"
**Solution**: PostgreSQL isn't running or wrong credentials.
- Check PostgreSQL is running
- Verify password in `backend/.env`
- Make sure you created the database

### Problem: "Prisma Migrate could not create the shadow database" or "permission denied to create database"
**Solution**: The `thinktap` user doesn't have permission to create databases.

**Fix - Grant CREATEDB privilege:**
1. Connect to PostgreSQL as `postgres` user:
   ```powershell
   psql -U postgres
   ```
   (Or use full path: `& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres`)

2. Run this SQL command:
   ```sql
   ALTER USER thinktap CREATEDB;
   ```
   
3. Exit:
   ```sql
   \q
   ```

4. Try migration again:
   ```bash
   npx prisma migrate dev
   ```

**Alternative - Recreate user with CREATEDB:**
If the above doesn't work, drop and recreate the user:
```sql
DROP USER thinktap;
CREATE USER thinktap WITH PASSWORD 'yourpassword' CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE thinktap TO thinktap;
```

### Problem: "Could not find Prisma Schema" or "schema.prisma: file not found"
**Solution**: You're not in the `backend` directory, or the schema file is missing.

**Quick Fix:**
1. Check your current directory:
   ```powershell
   pwd
   ```
   (Windows) or
   ```bash
   pwd
   ```
   (Mac/Linux)

2. **Navigate to the backend folder:**
   ```powershell
   cd backend
   ```
   (If you're in the project root)

3. **Verify the schema file exists:**
   ```powershell
   dir prisma\schema.prisma
   ```
   (Windows) or
   ```bash
   ls prisma/schema.prisma
   ```
   (Mac/Linux)

4. **If the file exists, run the command again:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

**If the file doesn't exist:**
- The schema file should be at: `backend/prisma/schema.prisma`
- If it's missing, check your project structure
- Make sure you cloned/downloaded the complete project

**Remember**: Prisma commands must be run from the `backend` directory!

### Problem: "permission denied for schema public" or "ERROR: permission denied for schema public"
**Solution**: The `thinktap` user doesn't have permissions on the `public` schema.

**Fix - Grant permissions:**
1. Connect to PostgreSQL as `postgres` user:
   ```powershell
   psql -U postgres -d thinktap
   ```
   (Or use full path: `& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d thinktap`)

2. Run these SQL commands:
   ```sql
   GRANT ALL ON SCHEMA public TO thinktap;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO thinktap;
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO thinktap;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO thinktap;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO thinktap;
   \q
   ```

3. Try Prisma commands again:
   ```bash
   npx prisma migrate dev
   ```
   Or use the alternative:
   ```bash
   npx prisma db push
   ```

**Quick PowerShell Fix (if you know the postgres password):**
```powershell
$env:PGPASSWORD='your_postgres_password'
psql -U postgres -d thinktap -c "GRANT ALL ON SCHEMA public TO thinktap; GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO thinktap; GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO thinktap; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO thinktap; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO thinktap;"
```

### Problem: "Cannot connect to backend"
**Solution**: Backend isn't running.
- Check the backend terminal is still running
- Restart backend: `npm run start:dev`

### Problem: "Page not loading"
**Solution**: Frontend isn't running.
- Check the frontend terminal is still running
- Restart frontend: `npm run dev`

### Problem: "White screen in browser"
**Solution**: JavaScript error.
- Open browser console (F12)
- Look for error messages
- Check browser URL is correct: http://localhost:3000

---

## 🎉 Success! What's Next?

If all tests pass, congratulations! 🎊 You've successfully set up and tested ThinkTap locally!

### Next Steps:

1. **Experiment**: Try creating different types of sessions
2. **Invite Friends**: Have them join your sessions
3. **Read Docs**: Check out `DOCUMENTATION.md` for more features
4. **Deploy**: Ready for production? See `DEPLOYMENT.md`

---

## 📸 Screenshots Guide

### What You Should See:

**1. Landing Page**
- Logo at top
- "Create Session" and "Join Session" buttons
- Clean, modern design

**2. Dashboard**
- "Create Session" button
- List of your sessions
- Session statistics

**3. Session Code Screen**
- Big 6-digit code (e.g., ABC123)
- "Copy Code" button
- "Start Session" button

**4. Lecturer Session View**
- Participant count
- Question list
- "Add Question" button
- "Start Question" and "Show Results" buttons

**5. Student Join Screen**
- 6-digit code input field
- Numeric keypad
- "Join" button

**6. Student Question View**
- Question text
- Answer options (buttons/inputs)
- Timer countdown
- "Submit" button

**7. Results Screen**
- Correctness percentage
- Response distribution chart
- "Next Question" button

**8. Analytics Page**
- Multiple charts
- Statistics cards
- Leaderboard table

---

## 💡 Tips for Testing

1. **Keep Both Terminals Running**: Don't close them!
2. **Use Incognito Windows**: To test lecturer and student at the same time
3. **Check Browser Console**: Press F12 to see any errors
4. **Clear Browser Cache**: If something looks weird, try Ctrl+Shift+R
5. **Test Mobile View**: Resize your browser to phone size
6. **Try Different Browsers**: Test in Chrome, Firefox, Edge

---

## 📝 Test Scenarios

### Scenario 1: Quick Quiz
1. Create Rush Mode session
2. Add 5 multiple choice questions
3. Join as 2-3 students (multiple incognito windows)
4. Answer questions quickly
5. Check leaderboard

### Scenario 2: Anonymous Feedback
1. Create Seminar Mode session
2. Add open-ended questions
3. Students submit anonymous responses
4. Lecturer views aggregated results

### Scenario 3: Timed Assessment
1. Create Thinking Mode session
2. Add questions with 60-second timer
3. Test timer countdown
4. Verify auto-submit when time expires

---

## 🔍 Detailed Testing Checklist

### Pre-Test
- [ ] Backend running at http://localhost:3001
- [ ] Frontend running at http://localhost:3000
- [ ] Database connected
- [ ] No console errors

### User Flow Test
- [ ] Register → Login → Dashboard → Create Session → Add Question → Start Session
- [ ] Open incognito → Join Session → Answer Question → See Results
- [ ] Lecturer → Show Results → View Analytics → End Session

### Edge Cases
- [ ] Try invalid login credentials
- [ ] Try joining with wrong code
- [ ] Submit answer after timer expires
- [ ] Create session with no questions
- [ ] Answer same question twice

### Performance
- [ ] Pages load in < 2 seconds
- [ ] Real-time updates are instant
- [ ] No lag when multiple students join
- [ ] Charts render smoothly

---

## 🆘 Need Help?

1. **Check the docs**: `DOCUMENTATION.md`
2. **Review API docs**: `API_REFERENCE.md`
3. **Look at examples**: Code has comments
4. **Check logs**: Backend terminal shows errors

---

## ✅ Final Verification

Run through this final checklist:

```
✅ Backend is running
✅ Frontend is running
✅ Database is connected
✅ Can register/login
✅ Can create sessions
✅ Can join sessions
✅ Can add questions
✅ Can submit answers
✅ Real-time updates work
✅ Analytics display
✅ No errors in console
✅ All features tested
```

---

## 🎊 Congratulations!

You've successfully set up and tested ThinkTap locally! You're now ready to:
- Use it for real teaching sessions
- Customize it for your needs
- Deploy it to production
- Contribute improvements

**Happy Teaching!** 🎓✨

---

<p align="center">
  <strong>Need more help?</strong><br>
  Check out the other documentation files:<br>
  📖 DOCUMENTATION.md | 🚀 DEPLOYMENT.md | 🔌 API_REFERENCE.md
</p>

---

**Last Updated**: December 7, 2025

