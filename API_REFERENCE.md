# ThinkTap API Reference

## Base URL
```
Production: https://api.thinktap.com
Development: http://localhost:3001
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

**Response:** `201 Created`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "plan": "FREE",
    "subscriptionStatus": "ACTIVE",
    "createdAt": "2025-12-07T10:00:00.000Z"
  }
}
```

**Errors:**
- `400` - Validation error (passwords don't match, invalid email)
- `409` - Email already registered

---

### Login
**POST** `/auth/login`

Authenticate an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "plan": "FREE",
    "subscriptionStatus": "ACTIVE"
  }
}
```

**Errors:**
- `401` - Invalid credentials

---

### Refresh Token
**POST** `/auth/refresh`

Get a new access token using a refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## Session Endpoints

### Create Session
**POST** `/sessions` 🔒

Create a new interactive session.

**Request Body:**
```json
{
  "mode": "RUSH"
}
```

**Modes:**
- `RUSH` - Fast-paced, competitive mode
- `THINKING` - Focus on accuracy, longer time
- `SEMINAR` - Anonymous responses, discussion-focused

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "code": "ABC123",
  "mode": "RUSH",
  "status": "PENDING",
  "lecturerId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-12-07T10:00:00.000Z",
  "startedAt": null,
  "endedAt": null,
  "participants": []
}
```

**Errors:**
- `403` - Plan limit reached

---

### Get All Sessions
**GET** `/sessions` 🔒

Get all sessions created by the authenticated user.

**Query Parameters:**
- `status` (optional): Filter by status (`PENDING`, `ACTIVE`, `ENDED`)
- `mode` (optional): Filter by mode

**Response:** `200 OK`
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "code": "ABC123",
    "mode": "RUSH",
    "status": "ACTIVE",
    "createdAt": "2025-12-07T10:00:00.000Z",
    "_count": {
      "questions": 5,
      "responses": 23
    }
  }
]
```

---

### Get Session by ID
**GET** `/sessions/:id` 🔒

Get detailed information about a specific session.

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "code": "ABC123",
  "mode": "RUSH",
  "status": "ACTIVE",
  "lecturerId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-12-07T10:00:00.000Z",
  "questions": [
    {
      "id": "question-id",
      "type": "MULTIPLE_CHOICE",
      "question": "What is 2+2?",
      "options": ["3", "4", "5"],
      "order": 1
    }
  ],
  "participants": [
    {
      "id": "user-id",
      "email": "student@example.com"
    }
  ]
}
```

---

### Join Session
**GET** `/sessions/join/:code`

Join a session using its 6-digit code.

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "code": "ABC123",
  "mode": "RUSH",
  "status": "ACTIVE",
  "questions": []
}
```

**Errors:**
- `404` - Session not found or not active

---

### Update Session Status
**PATCH** `/sessions/:id/status` 🔒

Update the status of a session (start or end).

**Request Body:**
```json
{
  "status": "ACTIVE"
}
```

**Response:** `200 OK`

---

## Question Endpoints

### Create Question
**POST** `/sessions/:sessionId/questions` 🔒

Add a question to a session.

**Request Body:**
```json
{
  "type": "MULTIPLE_CHOICE",
  "question": "What is the capital of France?",
  "options": ["London", "Paris", "Berlin", "Madrid"],
  "correctAnswer": "Paris",
  "timerSeconds": 30,
  "order": 1
}
```

**Question Types:**
- `MULTIPLE_CHOICE` - Single correct answer from options
- `TRUE_FALSE` - Boolean answer
- `MULTIPLE_SELECT` - Multiple correct answers
- `SHORT_ANSWER` - Text input (manual grading)
- `LONG_ANSWER` - Extended text (manual grading)

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "sessionId": "session-id",
  "type": "MULTIPLE_CHOICE",
  "question": "What is the capital of France?",
  "options": ["London", "Paris", "Berlin", "Madrid"],
  "correctAnswer": "Paris",
  "timerSeconds": 30,
  "order": 1
}
```

---

### Get Session Questions
**GET** `/sessions/:sessionId/questions` 🔒

Get all questions for a session.

**Response:** `200 OK`
```json
[
  {
    "id": "question-id",
    "type": "MULTIPLE_CHOICE",
    "question": "What is the capital of France?",
    "options": ["London", "Paris", "Berlin", "Madrid"],
    "order": 1,
    "_count": {
      "responses": 15
    }
  }
]
```

---

## Response Endpoints

### Submit Response
**POST** `/sessions/:sessionId/responses`

Submit an answer to a question.

**Request Body:**
```json
{
  "questionId": "550e8400-e29b-41d4-a716-446655440000",
  "response": "Paris",
  "responseTimeMs": 5000
}
```

**Response:** `201 Created`
```json
{
  "id": "response-id",
  "questionId": "question-id",
  "sessionId": "session-id",
  "userId": "user-id",
  "response": "Paris",
  "isCorrect": true,
  "responseTimeMs": 5000,
  "createdAt": "2025-12-07T10:00:00.000Z"
}
```

---

## Analytics Endpoints

### Dashboard Statistics
**GET** `/analytics/dashboard` 🔒

Get overview statistics for the lecturer.

**Response:** `200 OK`
```json
{
  "totalSessions": 15,
  "activeSessions": 2,
  "totalQuestions": 75,
  "totalResponses": 450,
  "averageResponseRate": 0.85,
  "recentSessions": [
    {
      "id": "session-id",
      "code": "ABC123",
      "mode": "RUSH",
      "status": "ACTIVE",
      "createdAt": "2025-12-07T10:00:00.000Z"
    }
  ]
}
```

---

### Session Insights
**GET** `/analytics/sessions/:sessionId` 🔒

Get detailed analytics for a specific session.

**Response:** `200 OK`
```json
{
  "sessionId": "session-id",
  "mode": "RUSH",
  "totalQuestions": 10,
  "totalResponses": 50,
  "participantCount": 5,
  "averageCorrectness": 0.75,
  "averageResponseTime": 8500,
  "questionAnalytics": [
    {
      "questionId": "question-id",
      "question": "What is 2+2?",
      "type": "MULTIPLE_CHOICE",
      "responseCount": 5,
      "correctCount": 4,
      "correctnessRate": 0.8,
      "averageResponseTime": 5000,
      "responseDistribution": {
        "3": 1,
        "4": 4
      }
    }
  ]
}
```

---

### Leaderboard
**GET** `/analytics/sessions/:sessionId/leaderboard` 🔒

Get leaderboard for Rush Mode sessions.

**Response:** `200 OK`
```json
[
  {
    "userId": "user-id",
    "email": "student@example.com",
    "correctCount": 8,
    "totalQuestions": 10,
    "averageResponseTime": 4500,
    "rank": 1
  }
]
```

---

### Engagement Metrics
**GET** `/analytics/sessions/:sessionId/engagement` 🔒

Get engagement metrics for a session.

**Response:** `200 OK`
```json
{
  "participationRate": 0.9,
  "responseRate": 0.85,
  "averageTimePerQuestion": 12000,
  "completionRate": 0.95,
  "participantActivity": [
    {
      "userId": "user-id",
      "email": "student@example.com",
      "responsesSubmitted": 9,
      "questionsAnswered": 10,
      "engagementScore": 0.9
    }
  ]
}
```

---

## WebSocket Events (Socket.io)

### Client Events

#### Join Session
```javascript
socket.emit('join_session', 'ABC123');
```

#### Start Question (Lecturer)
```javascript
socket.emit('start_question', {
  sessionId: 'session-id',
  questionId: 'question-id'
});
```

#### Submit Response
```javascript
socket.emit('submit_response', {
  sessionId: 'session-id',
  questionId: 'question-id',
  response: 'Paris',
  responseTimeMs: 5000
});
```

#### Show Results (Lecturer)
```javascript
socket.emit('show_results', {
  sessionId: 'session-id',
  questionId: 'question-id'
});
```

#### End Session (Lecturer)
```javascript
socket.emit('end_session', 'session-id');
```

### Server Events

#### Student Joined
```javascript
socket.on('student_joined', ({ userId, email }) => {
  // Handle new participant
});
```

#### Question Started
```javascript
socket.on('question_started', (question) => {
  // Display question to participants
});
```

#### Timer Update
```javascript
socket.on('timer_update', ({ timeRemaining }) => {
  // Update timer display
});
```

#### Response Submitted
```javascript
socket.on('response_submitted', ({ responseCount }) => {
  // Update response counter
});
```

#### Results Shown
```javascript
socket.on('results_shown', (insights) => {
  // Display results and analytics
});
```

#### Session Ended
```javascript
socket.on('session_ended', () => {
  // Handle session end
});
```

---

## Rate Limits

- API requests: 10/second
- Login attempts: 5/minute
- Session creation: Based on plan

## Error Responses

All errors follow this format:
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

Common status codes:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

---

🔒 = Requires authentication

