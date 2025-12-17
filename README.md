# 🎓 ThinkTap

**Interactive Real-Time Learning Platform**

ThinkTap is a full-stack application that enables lecturers to conduct interactive Q&A sessions with students in real-time, featuring multiple session modes, comprehensive analytics, and cross-platform support.

[![CI/CD](https://github.com/yourusername/thinktap/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/yourusername/thinktap/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ✨ Features

### 🎯 Core Functionality
- **Real-time Q&A Sessions** - Interactive questions with live responses
- **3 Session Modes**
  - 🏃 **Rush Mode** - Fast-paced, competitive learning
  - 🧠 **Thinking Mode** - Focus on accuracy over speed
  - 💬 **Seminar Mode** - Anonymous responses for open discussion
- **5 Question Types** - Multiple choice, True/False, Multiple select, Short answer, Long answer
- **Live Analytics** - Real-time response tracking and insights
- **Leaderboards** - Competitive rankings for Rush Mode

### 📊 Analytics Dashboard
- Session insights and statistics
- Question-by-question breakdown
- Response distribution charts
- Correctness rates
- Engagement metrics
- Participant activity tracking

### 💰 Freemium Business Model
- **FREE** - 3 sessions/month, 10 questions/session
- **BASIC** - 10 sessions/month, 20 questions/session
- **PRO** - 50 sessions/month, 50 questions/session
- **ENTERPRISE** - Unlimited sessions and questions

### 📱 Multi-Platform
- **Web Application** (Next.js)
- **Mobile Apps** (iOS & Android via React Native/Expo)
- **Real-time Sync** across all platforms

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+ (optional, for scaling)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/thinktap.git
cd ThinkTap
```

### 2. Backend Setup
```bash
cd backend
npm install

# Configure environment
cp env.example .env
# Edit .env with your database credentials

# Setup database
npx prisma generate
npx prisma migrate dev

# Start backend
npm run start:dev
```

Backend runs on `http://localhost:3001`

### 3. Web Frontend Setup
```bash
cd frontend
npm install

# Configure environment
cp env.example .env.local

# Start frontend
npm run dev
```

Frontend runs on `http://localhost:3000`

### 4. Mobile App Setup (Optional)
```bash
cd mobile
npm install

# Start Expo development server
npm start
```

Scan QR code with Expo Go app to run on your device

---

## 🏗️ Architecture

### Tech Stack

**Backend:**
- NestJS (TypeScript)
- PostgreSQL 16
- Prisma ORM
- Socket.io
- Redis
- JWT Authentication

**Web Frontend:**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts

**Mobile:**
- React Native 0.81
- Expo SDK 54
- React Navigation 7
- Socket.io Client

### System Architecture

```
┌────────────┐         ┌────────────┐
│ Web Client │         │Mobile Apps │
└─────┬──────┘         └─────┬──────┘
      │                      │
      └──────────┬───────────┘
                 │
            ┌────┴────┐
            │  Nginx  │ (Reverse Proxy + SSL)
            └────┬────┘
                 │
        ┌────────┴────────┐
        │                 │
    ┌───┴────┐      ┌─────┴─────┐
    │Next.js │      │  NestJS   │
    │Frontend│◄────►│  Backend  │
    └────────┘      └─────┬─────┘
                          │
                   ┌──────┼──────┐
                   │      │      │
              ┌────┴─┐ ┌──┴──┐ ┌─┴────┐
              │Postgres Redis Socket│
              │   DB   │Cache │ .io  │
              └────────┘└─────┘└──────┘
```

---

## 📖 Documentation

- [📘 Complete Documentation](DOCUMENTATION.md) - Full user and developer guide
- [🔌 API Reference](API_REFERENCE.md) - Complete API documentation
- [🚀 Deployment Guide](DEPLOYMENT.md) - Production deployment instructions

---

## 🎮 Usage

### For Lecturers

1. **Create a Session**
   - Login to your account
   - Click "Create Session"
   - Choose mode (Rush, Thinking, or Seminar)
   - Share the 6-digit code with students

2. **Manage Session**
   - Add questions (before or during session)
   - Start session when ready
   - Launch questions one by one
   - View real-time responses
   - Show results to students

3. **View Analytics**
   - Access session insights
   - Review question statistics
   - Check leaderboards
   - Analyze engagement metrics

### For Students

1. **Join a Session**
   - Click "Join Session"
   - Enter the 6-digit code
   - Wait for lecturer to start

2. **Participate**
   - Answer questions as they appear
   - View timer (if enabled)
   - Submit responses
   - See results when shown

---

## 🛠️ Development

### Project Structure

```
ThinkTap/
├── backend/              # NestJS backend
│   ├── src/
│   │   ├── auth/        # Authentication
│   │   ├── sessions/    # Session management
│   │   ├── questions/   # Question CRUD
│   │   ├── responses/   # Response handling
│   │   ├── analytics/   # Analytics engine
│   │   └── events/      # Socket.io gateway
│   ├── prisma/          # Database schema
│   └── test/            # Tests
│
├── frontend/            # Next.js web app
│   ├── src/
│   │   ├── app/         # Pages (App Router)
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilities
│   └── public/          # Static assets
│
├── mobile/              # React Native app
│   ├── src/
│   │   ├── screens/     # App screens
│   │   ├── components/  # Components
│   │   ├── navigation/  # React Navigation
│   │   ├── contexts/    # Contexts
│   │   └── services/    # API service
│   └── assets/          # Images & assets
│
├── nginx/               # Nginx configuration
├── docker-compose.yml   # Docker orchestration
└── .github/             # CI/CD workflows
```

### Running Tests

```bash
# Backend tests
cd backend
npm run test
npm run test:cov
npm run test:e2e

# Frontend tests
cd frontend
npm run test
npm run test:watch

# Linting
npm run lint
```

### Building for Production

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build

# Mobile
cd mobile
eas build --platform all
```

---

## 🚀 Deployment

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on:
- Production environment setup
- SSL/TLS configuration
- Database migrations
- Scaling strategies
- Monitoring and logging
- Backup procedures

---

## 📊 Database Schema

```prisma
model User {
  id                 String             @id @default(uuid())
  email              String             @unique
  password           String
  plan               Plan               @default(FREE)
  subscriptionStatus SubscriptionStatus @default(ACTIVE)
  sessions           Session[]
  responses          Response[]
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt
}

model Session {
  id          String        @id @default(uuid())
  code        String        @unique
  mode        SessionMode
  status      SessionStatus @default(PENDING)
  lecturerId  String
  lecturer    User          @relation(fields: [lecturerId], references: [id])
  questions   Question[]
  responses   Response[]
  createdAt   DateTime      @default(now())
  startedAt   DateTime?
  endedAt     DateTime?
}

model Question {
  id            String       @id @default(uuid())
  sessionId     String
  session       Session      @relation(fields: [sessionId], references: [id])
  type          QuestionType
  question      String
  options       Json?
  correctAnswer Json
  timerSeconds  Int?
  order         Int
  responses     Response[]
  createdAt     DateTime     @default(now())
}

model Response {
  id             String   @id @default(uuid())
  sessionId      String
  session        Session  @relation(fields: [sessionId], references: [id])
  questionId     String
  question       Question @relation(fields: [questionId], references: [id])
  userId         String?
  user           User?    @relation(fields: [userId], references: [id])
  response       Json
  isCorrect      Boolean?
  responseTimeMs Int
  createdAt      DateTime @default(now())
}
```

---

## 🔒 Security

- JWT-based authentication
- Bcrypt password hashing
- CORS protection
- Rate limiting
- SQL injection prevention (Prisma)
- XSS protection headers
- Secure token storage (mobile)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 Environment Variables

### Backend
```env
DATABASE_URL=postgresql://user:password@localhost:5432/thinktap
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
REDIS_URL=redis://localhost:6379
PORT=3001
NODE_ENV=development
```

### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### Mobile
```typescript
export const config = {
  API_URL: 'http://localhost:3001',
  SOCKET_URL: 'http://localhost:3001',
};
```

---

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify connection
psql -U postgres -d thinktap
```

**Socket.io Not Connecting**
- Ensure backend is running
- Check CORS configuration
- Verify WebSocket support

**Mobile App Build Errors**
```bash
# Clear cache
expo start -c

# Reinstall dependencies
rm -rf node_modules
npm install
```

---

## 📈 Roadmap

- [ ] AI-powered question generation
- [ ] Advanced analytics with ML insights
- [ ] Video/audio questions
- [ ] Collaborative whiteboards
- [ ] Integration with LMS platforms
- [ ] Mobile offline mode
- [ ] Advanced gamification

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - [GitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Charts powered by [Recharts](https://recharts.org/)
- Mobile development with [Expo](https://expo.dev/)

---

## 📞 Support

- 📧 Email: support@thinktap.com
- 💬 GitHub Issues: [Create an issue](https://github.com/yourusername/thinktap/issues)
- 📖 Documentation: [docs.thinktap.com](https://docs.thinktap.com)

---

<p align="center">Made with ❤️ by the ThinkTap Team</p>
<p align="center">
  <a href="https://thinktap.com">Website</a> •
  <a href="https://docs.thinktap.com">Documentation</a> •
  <a href="https://github.com/yourusername/thinktap">GitHub</a>
</p>
