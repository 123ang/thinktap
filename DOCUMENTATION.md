# ThinkTap - Complete Documentation

## 📖 Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Architecture](#architecture)
4. [API Documentation](#api-documentation)
5. [Deployment Guide](#deployment-guide)
6. [User Guide](#user-guide)
7. [Developer Guide](#developer-guide)

---

## Introduction

ThinkTap is a full-stack interactive learning platform that enables real-time Q&A sessions between lecturers and students. Built with NestJS, Next.js, and React Native.

### Features
- 🔐 JWT Authentication
- 📱 Multi-platform (Web + Mobile)
- ⚡ Real-time with Socket.io
- 📊 Comprehensive Analytics
- 🎯 3 Session Modes
- ❓ 5 Question Types
- 🏆 Leaderboards
- 💰 Freemium Model

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 16
- Redis (optional, for scaling)
- Expo CLI (for mobile)

### Quick Start

#### 1. Clone Repository
```bash
git clone <repository-url>
cd ThinkTap
```

#### 2. Backend Setup
```bash
cd backend
npm install

# Setup environment
cp env.example .env
# Edit .env with your database credentials

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start backend
npm run start:dev
```

Backend runs on `http://localhost:3001`

#### 3. Web Frontend Setup
```bash
cd frontend
npm install

# Setup environment
cp env.example .env.local
# Add NEXT_PUBLIC_API_URL=http://localhost:3001

# Start frontend
npm run dev
```

Frontend runs on `http://localhost:3000`

#### 4. Mobile App Setup
```bash
cd mobile
npm install

# Start Expo
npm start
```

Scan QR code with Expo Go app

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/thinktap"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
REDIS_URL="redis://localhost:6379"
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

#### Mobile (env.example)
```env
API_URL=http://localhost:3001
SOCKET_URL=http://localhost:3001
```

---

## Architecture

### Tech Stack

**Backend:**
- NestJS (Node.js framework)
- PostgreSQL 16 (Database)
- Prisma ORM
- Socket.io (Real-time)
- JWT (Authentication)
- Redis (Scaling)

**Web Frontend:**
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Axios
- Socket.io Client
- Recharts

**Mobile:**
- React Native 0.81
- Expo SDK 54
- TypeScript
- React Navigation 7
- Socket.io Client

### System Architecture

```
┌─────────────────┐
│   Web Browser   │
└────────┬────────┘
         │
    ┌────┴────┐
    │  Nginx  │
    └────┬────┘
         │
    ┌────┴─────────────────┐
    │                      │
┌───┴────┐          ┌──────┴─────┐
│ Next.js│          │   NestJS   │
│Frontend│◄────────►│  Backend   │
└────────┘          └──────┬─────┘
                           │
                    ┌──────┼──────┐
                    │      │      │
              ┌─────┴─┐ ┌──┴───┐ ┌┴─────┐
              │Postgres│ │Socket│ │Redis │
              │   DB   │ │ .io  │ │Cache │
              └────────┘ └──────┘ └──────┘
```

### Database Schema

```prisma
model User {
  id         String   @id @default(uuid())
  email      String   @unique
  password   String
  plan       Plan     @default(FREE)
  sessions   Session[]
  responses  Response[]
}

model Session {
  id         String        @id @default(uuid())
  code       String        @unique
  lecturerId String
  mode       SessionMode
  status     SessionStatus
  questions  Question[]
  responses  Response[]
}

model Question {
  id            String       @id @default(uuid())
  sessionId     String
  type          QuestionType
  question      String
  options       Json?
  correctAnswer Json
  responses     Response[]
}

model Response {
  id             String  @id @default(uuid())
  sessionId      String
  questionId     String
  userId         String?
  response       Json
  isCorrect      Boolean?
  responseTimeMs Int
}
```

---

## API Documentation

### Authentication

#### POST /auth/register
Register a new user
```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

Response:
```json
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "plan": "FREE"
  }
}
```

#### POST /auth/login
Login existing user
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /auth/refresh
Refresh access token
```json
{
  "refreshToken": "refresh-token"
}
```

### Sessions

#### POST /sessions
Create new session (Protected)
```json
{
  "mode": "RUSH" | "THINKING" | "SEMINAR"
}
```

#### GET /sessions
Get all user sessions (Protected)

#### GET /sessions/:id
Get session by ID (Protected)

#### GET /sessions/join/:code
Join session by code

#### PATCH /sessions/:id/status
Update session status (Protected)
```json
{
  "status": "ACTIVE" | "ENDED"
}
```

### Questions

#### POST /sessions/:sessionId/questions
Create question (Protected)
```json
{
  "type": "MULTIPLE_CHOICE",
  "question": "What is 2+2?",
  "options": ["3", "4", "5"],
  "correctAnswer": "4",
  "timerSeconds": 30,
  "order": 1
}
```

#### GET /sessions/:sessionId/questions
Get all questions for session

### Responses

#### POST /sessions/:sessionId/responses
Submit response
```json
{
  "questionId": "uuid",
  "response": "4",
  "responseTimeMs": 5000
}
```

### Analytics

#### GET /analytics/dashboard
Get dashboard statistics (Protected)

#### GET /analytics/sessions/:sessionId
Get session insights (Protected)

#### GET /analytics/sessions/:sessionId/leaderboard
Get leaderboard (Protected)

### Socket.io Events

#### Client → Server
- `join_session(code)` - Join session
- `start_question(questionId)` - Start question
- `submit_response(data)` - Submit response
- `show_results(questionId)` - Show results
- `end_session()` - End session

#### Server → Client
- `student_joined({ userId, email })` - Student joined
- `question_started(question)` - Question started
- `timer_update({ timeRemaining })` - Timer update
- `response_submitted({ responseCount })` - Response submitted
- `results_shown(insights)` - Results shown
- `session_ended()` - Session ended

---

## Deployment Guide

### Production Environment Variables

```env
# Backend
DATABASE_URL=postgresql://production-db-url
JWT_SECRET=strong-secret-key-production
JWT_REFRESH_SECRET=strong-refresh-secret-production
REDIS_URL=redis://production-redis-url
NODE_ENV=production

# Frontend
NEXT_PUBLIC_API_URL=https://api.thinktap.com
NEXT_PUBLIC_SOCKET_URL=https://api.thinktap.com
```

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Backend Deployment (PM2)

```bash
cd backend
npm run build
pm2 start dist/main.js --name thinktap-backend
```

### Frontend Deployment (Vercel)

```bash
cd frontend
npm run build
vercel --prod
```

### Mobile App Deployment

#### iOS
```bash
cd mobile
eas build --platform ios
eas submit --platform ios
```

#### Android
```bash
cd mobile
eas build --platform android
eas submit --platform android
```

---

## User Guide

### For Lecturers

#### Creating a Session
1. Login to your account
2. Click "Create Session"
3. Select session mode:
   - **RUSH**: Competitive, speed-based
   - **THINKING**: Focus on accuracy
   - **SEMINAR**: Anonymous responses
4. Share 6-digit code with students

#### Managing a Session
1. Add questions during or before session
2. Click "Start Session" when ready
3. Start questions one by one
4. View real-time responses
5. Show results to students
6. End session when complete

#### Viewing Analytics
1. Go to session insights
2. View overall statistics
3. Check question-by-question breakdown
4. See leaderboard (Rush mode)
5. Review engagement metrics

### For Students

#### Joining a Session
1. Click "Join Session"
2. Enter 6-digit code
3. Wait for lecturer to start

#### Participating
1. Read question carefully
2. Select/type your answer
3. Click "Submit"
4. View results when shown
5. Wait for next question

---

## Developer Guide

### Project Structure

```
backend/src/
├── auth/          # Authentication module
├── sessions/      # Session management
├── questions/     # Question CRUD
├── responses/     # Response handling
├── analytics/     # Analytics engine
└── events/        # Socket.io gateway

frontend/src/
├── app/           # Next.js pages
├── components/    # React components
├── contexts/      # React contexts
├── hooks/         # Custom hooks
└── lib/           # Utilities

mobile/src/
├── screens/       # React Native screens
├── components/    # Mobile components
├── navigation/    # React Navigation
└── services/      # API service
```

### Adding a New Feature

#### 1. Backend
```typescript
// Create module
nest generate module feature

// Create service
nest generate service feature

// Create controller
nest generate controller feature
```

#### 2. Frontend
```typescript
// Create API method
export const featureApi = {
  getData: () => apiClient.get('/feature'),
};

// Create hook
export function useFeature() {
  // Implementation
}

// Create component
export function FeatureComponent() {
  // Implementation
}
```

### Testing

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test

# E2E tests
npm run test:e2e
```

### Code Style

- ESLint for linting
- Prettier for formatting
- TypeScript for type safety
- Follow existing patterns

---

## Troubleshooting

### Common Issues

**Database Connection Error**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Run migrations: `npx prisma migrate dev`

**Socket.io Not Connecting**
- Check backend is running
- Verify SOCKET_URL matches backend
- Check CORS configuration

**Mobile App Not Loading**
- Check API_URL in mobile code
- Ensure backend is accessible from mobile
- Try clearing Expo cache

### Support

For issues or questions:
- GitHub Issues
- Email: support@thinktap.com
- Documentation: docs.thinktap.com

---

## License

MIT License - see LICENSE file

## Contributors

Built with ❤️ by the ThinkTap team

---

**Last Updated:** December 7, 2025

