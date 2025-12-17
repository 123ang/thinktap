# ThinkTap Project Summary

> **Quick Reference**: Overview of the complete ThinkTap system  
> **Last Updated**: December 6, 2025

---

## 🎯 Project Overview

**ThinkTap** is a university-focused interactive classroom engagement platform that enables lecturers to run real-time quizzes and gather instant feedback from students across web and mobile platforms.

---

## 💰 Pricing Structure

| Plan | Price | Key Features |
|------|-------|--------------|
| **Freemium** | RM0 | Unlimited live sessions, no history save |
| **ThinkTap Pro** | RM20/month | Full history, analytics, export results |
| **Faculty Plan** | RM1,000/month | Multiple users, shared resources, admin dashboard |
| **University License** | Custom | Institution-wide, LMS integration, on-premise option |

### Freemium Restriction
- ✅ Run unlimited live sessions
- ❌ Cannot save session history (deleted after session ends)
- ✅ Live analytics during session
- ❌ No access to past analytics

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────┐
│  Web Frontend (Next.js) + Mobile (Expo)     │
│                    ↓                         │
│             Nginx (Reverse Proxy)           │
│                    ↓                         │
│         Backend API (NestJS + Socket.io)    │
│              ↓           ↓                   │
│        PostgreSQL     Redis                 │
└─────────────────────────────────────────────┘
```

### Technology Stack

**Frontend (Web)**
- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- Socket.io-client
- Axios

**Mobile App**
- React Native + Expo
- TypeScript
- React Navigation
- Socket.io-client

**Backend**
- NestJS
- TypeScript
- Prisma ORM
- Socket.io
- JWT Authentication

**Infrastructure**
- PostgreSQL 16
- Redis 7+
- Docker + docker-compose
- Nginx
- SSL (Certbot)

---

## 🎓 Core Features

### For Lecturers
- Create real-time interactive sessions
- 3 session modes: Rush, Thinking, Seminar
- 5 question types: MC, T/F, Multiple Select, Short Answer, Long Answer
- Generate 6-digit session codes
- View live analytics and insights
- Export results (Pro+)
- Save session history (Pro+)

### For Students
- Join with 6-digit code (no account needed)
- Answer questions in real-time
- View timer countdown
- See results when lecturer shares
- Anonymous mode in Seminar sessions
- Works on web and mobile

---

## 🎮 Session Modes

### Rush Mode
- **Focus**: Speed
- First to answer correctly wins
- Visible countdown timer
- Real-time leaderboard
- Competitive environment

### Thinking Mode
- **Focus**: Accuracy
- All students can answer
- Results shown after timer
- No leaderboard (analytics only)
- Focus on correctness

### Seminar Mode
- **Focus**: Participation
- Anonymous responses (names hidden)
- User IDs tracked internally
- Encourages honest feedback
- Discussion-focused

---

## 📝 Question Types

1. **Multiple Choice**: Single correct answer
2. **True/False**: Boolean response
3. **Multiple Select**: Multiple correct answers
4. **Short Answer**: Single-line text input
5. **Long Answer**: Paragraph text area

---

## 🔐 Authentication & Users

### User Model
- Email/password authentication
- JWT tokens (access + refresh)
- Plan type (FREE, PRO, FACULTY, UNIVERSITY)
- Subscription status tracking

### Access Control
- **Public**: Landing page, pricing
- **Authenticated**: Dashboard, create sessions
- **Plan-based**: History access, analytics, exports

---

## 🌐 Platform Support

### Web Application
- Responsive design (mobile, tablet, desktop)
- Works on all modern browsers
- Progressive Web App (optional)

### Mobile Application
- iOS (iPhone, iPad)
- Android (phones, tablets)
- Native performance with Expo
- Offline handling
- Push notifications (future)

---

## 📡 Real-Time Features (Socket.io)

### Events

**Client → Server**
- `join_session` - Join session with code
- `start_question` - Lecturer starts question
- `submit_response` - Student submits answer
- `show_results` - Lecturer shows results
- `end_session` - Lecturer ends session

**Server → Client**
- `student_joined` - Student count update
- `question_started` - Question data to all
- `timer_update` - Countdown (every second)
- `response_received` - Response count update
- `results_shown` - Analytics/insights
- `session_ended` - Session ended

---

## 📊 Analytics & Insights

### For All Modes
- Total participants
- Response rate (%)
- Average response time
- Individual responses

### Rush Mode Specific
- Leaderboard (fastest correct)
- Speed rankings
- Winner highlights

### Thinking Mode Specific
- Correctness percentages
- Response distribution
- Accuracy charts

### Seminar Mode Specific
- Anonymous response distribution
- Participation metrics
- (No individual tracking shown)

---

## 🎨 Landing Page Sections

1. **Hero** - Main value proposition + CTAs
2. **Trust Bar** - University logos
3. **Features** - 6 key features showcase
4. **How It Works** - 3-step process
5. **Pricing** - 4-tier comparison table
6. **Testimonials** - Social proof carousel
7. **FAQ** - Common questions
8. **Final CTA** - Conversion-focused
9. **Footer** - Links, contact, legal

---

## 🚀 Deployment

### Development
```bash
# Frontend
cd frontend && npm run dev

# Mobile
cd mobile && npx expo start

# Backend
cd backend && npm run start:dev
```

### Production (Docker)
```bash
docker compose build
docker compose up -d
```

### Services
- Frontend: Port 3000 (internal)
- Backend: Port 4000 (internal)
- Nginx: Port 80/443 (public)
- PostgreSQL: Port 5432 (internal)
- Redis: Port 6379 (internal)

---

## 📂 Project Structure

```
ThinkTap/
├── frontend/                 # Next.js web app
│   ├── app/
│   │   ├── page.tsx         # Landing page
│   │   ├── pricing/         # Pricing page
│   │   ├── (auth)/          # Login/Register
│   │   ├── dashboard/       # Lecturer dashboard
│   │   ├── join/            # Student join
│   │   └── session/[code]/  # Live session
│   ├── components/
│   ├── contexts/
│   └── hooks/
├── mobile/                   # React Native app
│   ├── app/
│   ├── components/
│   ├── contexts/
│   └── hooks/
├── backend/                  # NestJS API
│   ├── src/
│   │   ├── auth/
│   │   ├── sessions/
│   │   ├── questions/
│   │   ├── responses/
│   │   ├── subscriptions/
│   │   └── common/
│   └── prisma/
│       └── schema.prisma
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
└── .env.example
```

---

## 🗄️ Database Schema (Simplified)

**Database**: PostgreSQL 16 with JSON/JSONB support

### Users
- id, email, password (hashed)
- plan (FREE, PRO, FACULTY, UNIVERSITY)
- subscriptionId, subscriptionStatus
- createdAt, updatedAt

### Sessions
- id, code (6-digit numeric)
- lecturerId, mode (RUSH/THINKING/SEMINAR)
- status (CREATED/ACTIVE/ENDED)
- createdAt, endedAt

### Questions
- id, sessionId
- type (MULTIPLE_CHOICE/TRUE_FALSE/etc)
- question (text)
- **options (JSONB)**: Array of options for MC/MS questions
- **correctAnswer (JSONB)**: Flexible structure based on question type
- timerSeconds, order

### Responses
- id, sessionId, questionId, userId (nullable)
- **response (JSONB)**: Student's answer in flexible JSON format
- isCorrect (boolean)
- responseTimeMs, submittedAt

**PostgreSQL JSON Benefits:**
- Native JSONB type for efficient storage
- JSON operators for querying (`->`, `->>`, `@>`, etc.)
- GIN indexes for fast JSON queries
- Type validation at database level

---

## ✅ MVP Completion Criteria

- [x] Landing page with pricing tiers
- [ ] Lecturer can create sessions (web + mobile)
- [ ] Students can join via 6-digit code (web + mobile)
- [ ] Rush/Thinking/Seminar modes operational
- [ ] All 5 question types working
- [ ] Real-time updates (Socket.io)
- [ ] Analytics and insights viewable
- [ ] Freemium restrictions enforced (no history save)
- [ ] Subscription management (Stripe integration)
- [ ] Mobile apps built and tested
- [ ] Docker deployment on VPS
- [ ] SSL certificates configured
- [ ] Documentation complete

---

## 🔮 Future Features (Post-MVP)

### Phase 2
- Question templates & question bank
- Advanced leaderboards
- Export analytics (PDF, CSV, Excel)
- Student progress tracking

### Phase 3
- LMS integration (Moodle, Canvas, Blackboard)
- AI question generator
- Collaborative sessions (co-lecturers)
- Advanced Pro analytics

### Phase 4
- Push notifications (mobile)
- Offline mode (mobile)
- White-label options
- API for third-party integrations

---

## 📞 Support & Contact

- **Email**: support@thinktap.com
- **Docs**: docs.thinktap.com (to be created)
- **Status**: status.thinktap.com (to be created)

---

## 📄 Related Documents

1. **ThinkTap_Development_Guide.md** - Original requirements
2. **ThinkTap_MVP_Development_Plan.md** - Complete development plan (160 tasks)
3. **TODO.md** - Checklist for tracking progress
4. **Landing_Page_Design.md** - Visual design specifications

---

## 🎯 Next Steps

1. ✅ Planning complete
2. → Start Phase 0: Build landing page
3. → Start Phase 1: Set up project structure
4. → Start Phase 2: Design database schema
5. → Continue through all 20 phases

---

**Ready to build?** Start with Phase 0 (Landing Page) or Phase 1 (Project Setup)!
