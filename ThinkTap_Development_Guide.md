# ThinkTap Development Guide

This document provides the full technical specification, development structure, and deployment workflow for the ThinkTap platform. It is intended for the engineering team responsible for building the MVP.

---

# 1. System Overview

ThinkTap is a university-focused interactive classroom engagement platform.  
The system consists of:

- **Frontend**: Next.js + TypeScript  
- **Backend**: NestJS + TypeScript  
- **Database**: PostgreSQL  
- **Cache / Session Store**: Redis  
- **Reverse Proxy**: Nginx  
- **Deployment**: Docker + docker-compose on VPS

---

# 2. Core Requirements (MVP)

## Lecturer Features
- Create & host real-time sessions
- Run 3 modes:
  - **Rush Mode** (speed)
  - **Thinking Mode** (accuracy)
  - **Seminar Mode** (anonymous)
- View results + basic insights

## Student Features
- Join session with code
- Answer questions in real-time
- Anonymous option for seminar mode

## Admin / System
- Authentication (email + password)
- Freemium vs. Pro feature checks
- Limited storage for free users

---

# 3. Technology Stack

## Frontend (Next.js)
- React + TypeScript
- Tailwind CSS + shadcn/ui
- Socket.io-client for real-time
- API calls via Axios or Fetch
- Deployed via Docker

## Backend (NestJS)
- REST API endpoints
- Socket.io gateway for real-time updates
- Prisma ORM for PostgreSQL
- JWT authentication
- RBAC: Free vs. Pro logic

## Database
- PostgreSQL 16
- Tables:
  - users
  - sessions
  - questions
  - responses
  - plans / subscriptions

## Redis
- Temporary session data (TTL)
- Real-time caching
- Pub/Sub for scaling socket events

---

# 4. API Requirements

## Authentication
- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/refresh`

## Sessions
- POST `/sessions`
- GET `/sessions/{id}`
- DELETE `/sessions/{id}`

## Questions
- POST `/sessions/{id}/questions`
- GET `/sessions/{id}/questions`

## Responses
- POST `/sessions/{id}/respond`
- GET `/sessions/{id}/responses`

---

# 5. Frontend Structure

```
/frontend
  /app
    /dashboard
    /join
    /session/[code]
  /components
  /hooks
  /lib
  tailwind.config.js
  Dockerfile
```

---

# 6. Backend Structure

```
/backend
  /src
    /auth
    /sessions
    /questions
    /responses
    /common
    main.ts
  prisma/
  Dockerfile
```

---

# 7. Environment Variables

## Backend `.env`
```
DATABASE_URL=postgresql://thinktap:password@postgres:5432/thinktap
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=<secret>
FRONTEND_URL=https://yourdomain.com
```

## Frontend `.env`
```
NEXT_PUBLIC_API_BASE_URL=https://yourdomain.com/api
```

---

# 8. Deployment Architecture (Docker)

```
Nginx → Frontend (3000)
      ↳ Backend (4000, WebSockets)
Backend → PostgreSQL
Backend → Redis
```

All deployed on **one VPS** using Docker.

---

# 9. docker-compose.yml (Overview)

Services:
- `frontend`
- `backend`
- `postgres`
- `redis`
- `nginx`

Each container runs isolated; only Nginx is exposed to internet.

---

# 10. Nginx Reverse Proxy

Routes:
- `/` → frontend
- `/api` → backend
- `/socket.io` → backend (WebSockets)

SSL handled with Certbot certificates mounted into container.

---

# 11. Development Workflow

1. **Clone repo**
2. Install dependencies (`npm install`)
3. Start dev environment:
   - Frontend: `npm run dev`
   - Backend:  `npm run start:dev`
4. Make pull requests
5. Merge into main branch
6. VPS deploy via:

```
docker compose build
docker compose up -d
```

---

# 12. MVP Checklist

## Completed when:
- Lecturer can create session
- Student can join via code
- Rush/Thinking/Seminar modes operational
- Results viewable
- Freemium restrictions enforced
- Deployment stable on VPS

---

# 13. Future Features (Post-MVP)

- Templates & question bank
- Leaderboards
- Export analytics
- Moodle / LMS integration
- AI question generator

---

# 14. Contact / Notes

This document should remain updated as development progresses.

