# ThinkTap MVP Development Plan

> **Status**: Not Started  
> **Last Updated**: December 6, 2025

---

## Executive Summary

ThinkTap is a university-focused interactive classroom engagement platform consisting of:
- **Web Frontend**: Next.js + TypeScript
- **Mobile App**: React Native + Expo
- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL 16
- **Cache/Session Store**: Redis
- **Reverse Proxy**: Nginx
- **Deployment**: Docker + docker-compose on VPS

---

## Project Structure

```
ThinkTap/
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── pricing/              # Pricing page
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/
│   │   ├── join/
│   │   └── session/[code]/
│   ├── components/
│   │   ├── landing/              # Landing page components
│   │   ├── ui/                   # shadcn/ui components
│   │   └── session/
│   └── ...
├── mobile/                        # React Native + Expo
├── backend/                       # NestJS application
├── docker-compose.yml
├── nginx/
└── .env.example
```

---

## Development Checklist

### Phase 0: Landing Page & Marketing Site
- [ ] 0.1 Design landing page hero section
- [ ] 0.2 Create features showcase section
- [ ] 0.3 Build pricing tiers comparison table
- [ ] 0.4 Add testimonials/social proof section
- [ ] 0.5 Create FAQ section
- [ ] 0.6 Build contact/demo request form
- [ ] 0.7 Add call-to-action buttons
- [ ] 0.8 Implement responsive design for landing page

### Phase 1: Project Setup & Infrastructure
- [ ] 1.1 Initialize project structure (frontend/, mobile/, backend/)
- [ ] 1.2 Initialize Next.js 14+ with TypeScript, Tailwind CSS, shadcn/ui
- [ ] 1.3 Initialize React Native with Expo
- [ ] 1.4 Initialize NestJS with TypeScript
- [ ] 1.5 Create docker-compose.yml with all services
- [ ] 1.6 Create Dockerfiles for frontend and backend
- [ ] 1.7 Configure Nginx reverse proxy with SSL
- [ ] 1.8 Create .env.example files

### Phase 2: Database Schema Design
- [ ] 2.1 Design Prisma schema (Users, Sessions, Questions, Responses) using PostgreSQL JSONB for flexible data
- [ ] 2.2 Run Prisma migrations (PostgreSQL 16 with JSON/JSONB support)
- [ ] 2.3 Set up PrismaService in NestJS
- [ ] 2.4 Create GIN indexes on JSONB columns for performance (options, correctAnswer, response)

### Phase 3: Backend Core Setup
- [ ] 3.1 Create NestJS module structure (auth, sessions, questions, responses)
- [ ] 3.2 Implement JWT authentication (register, login, refresh)
- [ ] 3.3 Add password hashing with bcrypt
- [ ] 3.4 Create JWT guards for protected routes

### Phase 4: Backend API Endpoints
- [ ] 4.1 Sessions API (POST, GET, DELETE) with 6-digit code generation
- [ ] 4.2 Implement freemium logic (no history save for FREE users)
- [ ] 4.3 Questions API (POST, GET) - all question types
- [ ] 4.4 Responses API (POST, GET) with correctness calculation
- [ ] 4.5 Implement anonymization for SEMINAR mode
- [ ] 4.6 Create subscription/plan management API
- [ ] 4.7 Implement plan upgrade/downgrade endpoints

### Phase 5: Backend Real-time (Socket.io)
- [ ] 5.1 Install and configure Socket.io gateway
- [ ] 5.2 Implement server-to-client events (student_joined, question_started, timer_update, results_shown, session_ended)
- [ ] 5.3 Implement client-to-server events (join_session, start_question, submit_response, show_results, end_session)
- [ ] 5.4 Set up room management with session codes
- [ ] 5.5 Configure Redis adapter for scaling

### Phase 6: Backend Analytics & Insights
- [ ] 6.1 Create insights endpoint with response statistics
- [ ] 6.2 Implement Rush Mode leaderboard calculation
- [ ] 6.3 Implement Thinking Mode accuracy statistics
- [ ] 6.4 Implement Seminar Mode anonymous statistics
- [ ] 6.5 Add participant engagement metrics

### Phase 7: Web Frontend Setup
- [ ] 7.1 Set up Next.js App Router structure
- [ ] 7.2 Install and configure shadcn/ui
- [ ] 7.3 Create reusable UI components (Button, Input, Card, Dialog, Toast)
- [ ] 7.4 Set up API client (Axios) with interceptors
- [ ] 7.5 Create custom hooks (useAuth, useSession, useSocket)

### Phase 8: Web Frontend Authentication
- [ ] 8.1 Build login page
- [ ] 8.2 Build registration page
- [ ] 8.3 Create AuthContext with JWT token management
- [ ] 8.4 Implement route protection

### Phase 9: Web Frontend Session Management
- [ ] 9.1 Build lecturer dashboard (session list, create session)
- [ ] 9.2 Build session creation flow with mode selection
- [ ] 9.3 Build student join page (6-digit code input)
- [ ] 9.4 Add session status indicators

### Phase 10: Web Frontend Real-time Features
- [ ] 10.1 Set up Socket.io client
- [ ] 10.2 Build lecturer session view (participant count, question creation, timer, results)
- [ ] 10.3 Build student session view (question display, answer input, timer, results)
- [ ] 10.4 Create question type UI components (MC, T/F, MS, Short, Long)
- [ ] 10.5 Implement real-time updates for all events

### Phase 11: Web Frontend Analytics & Visualization
- [ ] 11.1 Install charting library (recharts or Chart.js)
- [ ] 11.2 Create response distribution charts
- [ ] 11.3 Create correctness percentage charts
- [ ] 11.4 Create response time histogram
- [ ] 11.5 Build comprehensive insights display
- [ ] 11.6 Add leaderboard component for Rush Mode

### Phase 12: Mobile App Setup (React Native)
- [ ] 12.1 Initialize Expo project with TypeScript
- [ ] 12.2 Install dependencies (React Navigation, Socket.io-client, Axios)
- [ ] 12.3 Set up navigation structure (Auth Stack, Main Stack)
- [ ] 12.4 Create reusable mobile components
- [ ] 12.5 Set up mobile-specific state management

### Phase 13: Mobile App Authentication
- [ ] 13.1 Build mobile login screen
- [ ] 13.2 Build mobile registration screen
- [ ] 13.3 Create AuthContext for mobile
- [ ] 13.4 Implement secure token storage (AsyncStorage/SecureStore)
- [ ] 13.5 Add biometric authentication (optional)

### Phase 14: Mobile App Session Management
- [ ] 14.1 Build mobile dashboard screen (session list)
- [ ] 14.2 Build session creation screen with mode selection
- [ ] 14.3 Build student join screen (6-digit code input with keypad)
- [ ] 14.4 Add pull-to-refresh functionality

### Phase 15: Mobile App Real-time Features
- [ ] 15.1 Set up Socket.io client for mobile
- [ ] 15.2 Build lecturer session screen (mobile-optimized)
- [ ] 15.3 Build student session screen (mobile-optimized)
- [ ] 15.4 Implement mobile-friendly question input UI
- [ ] 15.5 Add haptic feedback for interactions
- [ ] 15.6 Handle background/foreground transitions

### Phase 16: Mobile App Analytics
- [ ] 16.1 Install mobile charting library (react-native-chart-kit or Victory Native)
- [ ] 16.2 Create mobile-optimized results view
- [ ] 16.3 Build mobile leaderboard screen
- [ ] 16.4 Add swipeable insights cards

### Phase 17: Testing & Polish (All Platforms)
- [ ] 17.1 Add error handling (web & mobile)
- [ ] 17.2 Implement loading states and skeleton loaders
- [ ] 17.3 Ensure responsive design for web (mobile, tablet, desktop)
- [ ] 17.4 Test mobile app on iOS and Android
- [ ] 17.5 Add offline handling for mobile app
- [ ] 17.6 Implement proper reconnection logic

### Phase 18: Deployment Configuration
- [ ] 18.1 Optimize Next.js production build
- [ ] 18.2 Configure NestJS for production
- [ ] 18.3 Set up Nginx SSL with Certbot
- [ ] 18.4 Configure WebSocket upgrades
- [ ] 18.5 Multi-stage Docker builds
- [ ] 18.6 Add health checks for all services
- [ ] 18.7 Configure environment variables for all platforms

### Phase 19: Mobile App Deployment
- [ ] 19.1 Set up EAS Build for Expo
- [ ] 19.2 Configure app.json with proper metadata
- [ ] 19.3 Create app icons and splash screens
- [ ] 19.4 Build APK for Android
- [ ] 19.5 Build IPA for iOS
- [ ] 19.6 Submit to Google Play Store (optional)
- [ ] 19.7 Submit to Apple App Store (optional)

### Phase 20: Documentation
- [ ] 20.1 Create comprehensive README
- [ ] 20.2 Document REST API endpoints
- [ ] 20.3 Document Socket.io events
- [ ] 20.4 Write setup instructions for web
- [ ] 20.5 Write setup instructions for mobile
- [ ] 20.6 Create deployment guide
- [ ] 20.7 Add API testing collection (Postman/Insomnia)

---

## Detailed Implementation Specifications

### Landing Page Design

The landing page (`frontend/app/page.tsx`) should be designed to convert visitors into users with a modern, professional design.

#### Section 1: Hero Section
**Layout**: Full-width, centered content
- **Headline**: "Transform Your Classroom with Real-Time Engagement"
- **Subheadline**: "ThinkTap makes interactive learning seamless with real-time quizzes, instant feedback, and powerful analytics for lecturers and students"
- **CTA Buttons**: 
  - Primary: "Start Free" (→ register)
  - Secondary: "Watch Demo" (→ demo video/modal)
- **Hero Image/Animation**: Interactive classroom illustration or product screenshot
- **Trust Indicators**: "Trusted by 500+ lecturers" or university logos

#### Section 2: Features Showcase
**Layout**: 3-column grid (responsive to 1 column on mobile)

**Feature 1: Real-Time Interaction**
- Icon: Lightning bolt
- Title: "Instant Engagement"
- Description: "Run live quizzes with Rush, Thinking, and Seminar modes. Students answer in real-time from any device."

**Feature 2: Multiple Question Types**
- Icon: List/checkmark
- Title: "Versatile Question Formats"
- Description: "Multiple choice, true/false, multiple select, short and long answer questions. All in one platform."

**Feature 3: Powerful Analytics**
- Icon: Chart/graph
- Title: "Actionable Insights"
- Description: "View response rates, correctness percentages, and student engagement with beautiful charts and graphs."

**Feature 4: Cross-Platform**
- Icon: Devices (phone, tablet, laptop)
- Title: "Works Everywhere"
- Description: "Web and mobile apps for lecturers and students. Join sessions with a simple 6-digit code."

**Feature 5: Anonymous Mode**
- Icon: Privacy/mask
- Title: "Privacy-First Learning"
- Description: "Seminar mode enables anonymous responses for sensitive topics and open discussions."

**Feature 6: Easy to Use**
- Icon: Rocket/star
- Title: "No Learning Curve"
- Description: "Create and launch sessions in seconds. Students join instantly with no account required."

#### Section 3: How It Works
**Layout**: 3-step timeline/process

**Step 1**: Create Session
- "Choose your question mode and create questions in seconds"
- Screenshot: Session creation interface

**Step 2**: Students Join
- "Share the 6-digit code. Students join from any device instantly"
- Screenshot: Student join screen

**Step 3**: Engage & Analyze
- "Run live questions, see real-time responses, and review insights"
- Screenshot: Analytics dashboard

#### Section 4: Pricing Table
**Layout**: 4-column comparison table (responsive to stacked cards on mobile)

| Feature | Freemium | ThinkTap Pro | Faculty Plan | University License |
|---------|----------|--------------|--------------|-------------------|
| **Price** | **RM0** | **RM20/month** | **RM1,000/month** | **Custom** |
| Live Sessions | ✓ Unlimited | ✓ Unlimited | ✓ Unlimited | ✓ Unlimited |
| Save History | ✗ | ✓ | ✓ | ✓ |
| Analytics | Live only | ✓ Full access | ✓ Advanced | ✓ Custom |
| Question Types | ✓ All 5 types | ✓ All 5 types | ✓ All 5 types | ✓ All 5 types |
| Session Modes | ✓ All 3 modes | ✓ All 3 modes | ✓ All 3 modes | ✓ All 3 modes |
| Export Results | ✗ | ✓ | ✓ | ✓ |
| Question Bank | ✗ | ✗ | ✓ Shared | ✓ Shared |
| Users | 1 | 1 lecturer | Multiple | Unlimited |
| Support | Community | Priority email | Priority + Chat | Dedicated manager |
| LMS Integration | ✗ | ✗ | ✗ | ✓ |
| Custom Branding | ✗ | ✗ | ✓ | ✓ |
| On-Premise Option | ✗ | ✗ | ✗ | ✓ |
| **CTA** | "Start Free" | "Subscribe" | "Contact Sales" | "Contact Sales" |

**Design Notes**:
- Highlight "ThinkTap Pro" as "Most Popular"
- Use different colors for each tier
- Add tooltips for features
- Make CTAs prominent with contrasting colors

#### Section 5: Social Proof / Testimonials
**Layout**: Carousel or 3-column grid

Example testimonials (to be replaced with real ones):
- "ThinkTap transformed my lectures. Students are more engaged than ever!" - Dr. Sarah Lee, UUM
- "The Rush Mode makes revision sessions fun and competitive. My students love it!" - Prof. Ahmad, UTM
- "Anonymous responses in Seminar Mode encourage honest participation." - Dr. Lim, UM

Include:
- Photo (or avatar)
- Name
- Position & University
- 5-star rating

#### Section 6: FAQ Section
**Layout**: Accordion/expandable items

**Q: Do students need to create an account?**
A: No! Students can join sessions instantly using a 6-digit code. Only lecturers need an account.

**Q: What happens to my sessions on the free plan?**
A: On the free plan, you can run unlimited live sessions, but session history is not saved. Upgrade to ThinkTap Pro to access full history and analytics.

**Q: Can I use ThinkTap on mobile?**
A: Yes! We have dedicated mobile apps for iOS and Android, plus a fully responsive web app.

**Q: How many students can join a session?**
A: All plans support unlimited students per session.

**Q: Can I export results?**
A: Yes, on ThinkTap Pro and higher plans, you can export results as PDF or CSV.

**Q: What payment methods do you accept?**
A: We accept credit/debit cards, FPX, and bank transfers for enterprise plans.

**Q: Is there a money-back guarantee?**
A: Yes, we offer a 30-day money-back guarantee on all paid plans.

#### Section 7: Final CTA Section
**Layout**: Full-width, centered, bold background color

- **Headline**: "Ready to Transform Your Classroom?"
- **Subtext**: "Join hundreds of lecturers already using ThinkTap"
- **CTA Button**: "Get Started Free" (→ register)
- **Additional text**: "No credit card required • Set up in 2 minutes"

#### Section 8: Footer
**Layout**: Multi-column footer

**Column 1: Product**
- Features
- Pricing
- Demo
- Changelog

**Column 2: Resources**
- Documentation
- Help Center
- API Docs
- System Status

**Column 3: Company**
- About Us
- Contact
- Privacy Policy
- Terms of Service

**Column 4: Connect**
- Email: support@thinktap.com
- Social media links
- Newsletter signup

**Bottom Bar**:
- © 2025 ThinkTap. All rights reserved.
- Language selector (EN/BM)

---

### Database Schema

#### Users Table
```prisma
model User {
  id           String         @id @default(uuid())
  email        String         @unique
  password     String         // bcrypt hashed
  plan         Plan           @default(FREE)
  stripeCustomerId String?    // For payment integration
  subscriptionId   String?    // For subscription tracking
  subscriptionStatus SubscriptionStatus @default(INACTIVE)
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  sessions     Session[]
  responses    Response[]
}

enum Plan {
  FREE
  PRO
  FACULTY
  UNIVERSITY
}

enum SubscriptionStatus {
  ACTIVE
  INACTIVE
  PAST_DUE
  CANCELLED
}
```

#### Sessions Table
```prisma
model Session {
  id         String        @id @default(uuid())
  code       String        @unique // 6-digit numeric
  lecturerId String
  lecturer   User          @relation(fields: [lecturerId], references: [id])
  mode       SessionMode
  status     SessionStatus @default(CREATED)
  createdAt  DateTime      @default(now())
  endedAt    DateTime?
  questions  Question[]
  responses  Response[]
}

enum SessionMode {
  RUSH
  THINKING
  SEMINAR
}

enum SessionStatus {
  CREATED
  ACTIVE
  ENDED
}
```

#### Questions Table
```prisma
model Question {
  id            String       @id @default(uuid())
  sessionId     String
  session       Session      @relation(fields: [sessionId], references: [id])
  type          QuestionType
  question      String
  options       Json?        // PostgreSQL JSONB - For MC/MS: ["Option A", "Option B", "Option C", "Option D"]
  correctAnswer Json         // PostgreSQL JSONB - Varies by question type (see JSON structure below)
  timerSeconds  Int?
  order         Int
  createdAt     DateTime     @default(now())
  responses     Response[]
}

enum QuestionType {
  MULTIPLE_CHOICE
  TRUE_FALSE
  MULTIPLE_SELECT
  SHORT_ANSWER
  LONG_ANSWER
}
```

**PostgreSQL JSON Structure for Questions:**

- **options** (JSONB, nullable):
  - Multiple Choice/Select: `["Option A", "Option B", "Option C", "Option D"]`
  - True/False: `null` (not needed)
  - Short/Long Answer: `null` (not needed)

- **correctAnswer** (JSONB, required):
  - Multiple Choice: `"A"` or `"Option A"` (single string)
  - True/False: `true` or `false` (boolean)
  - Multiple Select: `["A", "C"]` or `["Option A", "Option C"]` (array of strings)
  - Short Answer: `"expected answer"` or `["answer1", "answer2"]` (string or array for variations)
  - Long Answer: `"expected answer"` or `["answer1", "answer2"]` (string or array for variations)

#### Responses Table
```prisma
model Response {
  id             String    @id @default(uuid())
  sessionId      String
  session        Session   @relation(fields: [sessionId], references: [id])
  questionId     String
  question       Question  @relation(fields: [questionId], references: [id])
  userId         String?   // Nullable for anonymous (Seminar mode)
  user           User?     @relation(fields: [userId], references: [id])
  response       Json      // PostgreSQL JSONB - Student's answer (structure varies by question type)
  isCorrect      Boolean?  // Calculated based on question type and correctAnswer
  responseTimeMs Int       // Time taken to answer in milliseconds
  submittedAt    DateTime  @default(now())
}
```

**PostgreSQL JSON Structure for Responses:**

- **response** (JSONB, required):
  - Multiple Choice: `"A"` or `"Option A"` (single string)
  - True/False: `true` or `false` (boolean)
  - Multiple Select: `["A", "C"]` or `["Option A", "Option C"]` (array of strings)
  - Short Answer: `"student's text answer"` (string)
  - Long Answer: `"student's paragraph answer"` (string)

**Note**: PostgreSQL's JSONB type provides:
- Efficient storage and indexing
- Query capabilities with JSON operators (`->`, `->>`, `@>`)
- Validation of JSON structure
- Better performance than JSON type for querying

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh` - Refresh JWT token

### Sessions API
- `POST /api/sessions` - Create new session (enforces freemium limits)
- `GET /api/sessions` - List user's sessions (FREE users get live sessions only)
- `GET /api/sessions/:id` - Get session details (requires PRO+ for past sessions)
- `DELETE /api/sessions/:id` - Delete/end session

### Plans & Billing
- `GET /api/plans` - Get all available plans
- `POST /api/subscriptions/create` - Create new subscription (Stripe)
- `POST /api/subscriptions/cancel` - Cancel subscription
- `GET /api/subscriptions/status` - Get current subscription status
- `POST /api/subscriptions/upgrade` - Upgrade plan
- `POST /api/subscriptions/webhook` - Stripe webhook handler

### Questions
- `POST /api/sessions/:id/questions` - Add question to session
- `GET /api/sessions/:id/questions` - Get all questions for session

### Responses
- `POST /api/sessions/:id/respond` - Submit response to question
- `GET /api/sessions/:id/responses` - Get all responses (anonymized for SEMINAR)

### Analytics
- `GET /api/sessions/:id/insights` - Get comprehensive analytics and insights

---

## Socket.io Events

### Client → Server
- `join_session` - Join session with code
- `start_question` - Lecturer starts a question
- `submit_response` - Student submits answer
- `show_results` - Lecturer shows results
- `end_session` - Lecturer ends session

### Server → Client
- `student_joined` - Broadcast when student joins (participant count)
- `question_started` - Question data sent to all participants
- `timer_update` - Countdown updates (every second)
- `response_received` - Real-time response count updates
- `results_shown` - Results/insights displayed
- `session_ended` - Session has ended

---

## Mobile App Screen Structure

```
mobile/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (main)/
│   │   ├── dashboard.tsx
│   │   ├── join.tsx
│   │   └── session/
│   │       ├── [code]/
│   │       │   ├── index.tsx      # Lecturer view
│   │       │   └── student.tsx    # Student view
├── components/
│   ├── common/
│   ├── session/
│   └── analytics/
├── contexts/
│   ├── AuthContext.tsx
│   └── SocketContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useSession.ts
│   └── useSocket.ts
├── services/
│   ├── api.ts
│   └── socket.ts
└── types/
    └── index.ts
```

---

## Key Features & Requirements

### Session Modes Behavior

#### Rush Mode
- First to answer correctly wins
- Visible countdown timer
- Real-time leaderboard
- Speed-focused scoring

#### Thinking Mode
- All students can answer
- Results shown after timer expires
- Accuracy-focused
- No names shown during answering

#### Seminar Mode
- Completely anonymous responses (names hidden)
- User IDs tracked internally
- Focus on discussion and participation
- No correct/incorrect marking

### Question Types

1. **Multiple Choice**: Single correct answer from options
2. **True/False**: Boolean answer
3. **Multiple Select**: Multiple correct answers
4. **Short Answer**: Text input (single line)
5. **Long Answer**: Text area (paragraph)

### Pricing Tiers & Restrictions

#### Freemium (RM0)
- Can run unlimited live sessions
- **Cannot save session history** (sessions deleted after completion)
- No access to past analytics
- Basic real-time features only

#### ThinkTap Pro (RM20/month)
- Individual lecturer plan
- Unlimited sessions with full history
- Save and review all past sessions
- Access to analytics and insights
- Export results
- Priority support

#### Faculty Plan (RM1,000/month)
- Multiple lecturers (department/faculty wide)
- Shared question bank
- Centralized analytics
- Admin dashboard
- Bulk user management
- Custom branding

#### University License (Custom Pricing)
- Institution-wide deployment
- Unlimited users
- LMS integration
- Dedicated support
- Custom features
- SLA guarantees
- On-premise option

### Session Code
- Format: 6-digit numeric (e.g., 123456)
- Auto-generated
- Unique per session
- Easy to type on mobile

---

## Environment Variables

### Backend `.env`
```env
DATABASE_URL=postgresql://thinktap:password@postgres:5432/thinktap
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
FRONTEND_URL=https://yourdomain.com
PORT=4000
NODE_ENV=production
```

### Frontend `.env`
```env
NEXT_PUBLIC_API_BASE_URL=https://yourdomain.com/api
NEXT_PUBLIC_SOCKET_URL=https://yourdomain.com
```

### Mobile `.env`
```env
EXPO_PUBLIC_API_BASE_URL=https://yourdomain.com/api
EXPO_PUBLIC_SOCKET_URL=https://yourdomain.com
```

---

## Deployment Architecture

```
Internet
    ↓
  Nginx (SSL, Port 443)
    ↓
    ├─→ Frontend (Next.js, :3000)
    ├─→ Backend API (NestJS, :4000)
    └─→ WebSocket (Socket.io, :4000)
         ↓
         ├─→ PostgreSQL (:5432)
         └─→ Redis (:6379)

Mobile App → HTTPS → Nginx → Backend
```

---

## Technology Stack Summary

### Web Frontend
- Next.js 14+
- TypeScript
- Tailwind CSS
- shadcn/ui
- Socket.io-client
- Axios
- Recharts/Chart.js

### Mobile App
- React Native
- Expo SDK
- TypeScript
- React Navigation
- Socket.io-client
- Axios
- react-native-chart-kit

### Backend
- NestJS
- TypeScript
- Prisma ORM
- Socket.io
- JWT (jsonwebtoken)
- bcrypt
- class-validator

### Infrastructure
- PostgreSQL 16
- Redis 7+
- Docker & docker-compose
- Nginx
- Certbot (SSL)

---

## MVP Completion Criteria

- [✓] Lecturer can create sessions on web and mobile
- [✓] Students can join via 6-digit code on web and mobile
- [✓] Rush/Thinking/Seminar modes fully operational
- [✓] All question types working (MC, T/F, MS, Short, Long)
- [✓] Real-time updates working (Socket.io)
- [✓] Results and analytics viewable
- [✓] Freemium restrictions enforced (1 session for FREE users)
- [✓] Mobile app functional on iOS and Android
- [✓] Deployment stable on VPS
- [✓] Documentation complete

---

## Future Features (Post-MVP)

- Question templates & question bank
- Advanced leaderboards with historical data
- Export analytics (PDF, CSV, Excel)
- LMS integration (Moodle, Canvas, Blackboard)
- AI question generator
- Collaborative sessions (co-lecturers)
- Student progress tracking
- Push notifications for mobile
- Offline mode for mobile app
- Advanced Pro analytics

---

## Notes

- This document should be updated as development progresses
- Check off items as they are completed
- Add notes for any deviations from the plan
- Track issues and blockers
- Update timelines as needed

---

**Last Modified**: December 6, 2025  
**Next Review**: Weekly updates during development
