# Redis-Based Session State Architecture

## Overview

This architecture separates concerns:
- **Socket.IO**: Only for broadcasting real-time events
- **HTTP Endpoints**: For joining sessions and submitting answers
- **Redis**: For session state management (participants, current question, timer, etc.)
- **PostgreSQL**: Only stores quiz content and final results

## Architecture Components

### 1. Redis Service (`src/redis/redis.service.ts`)
- Manages Redis connection
- Provides helper methods for common Redis operations
- Handles connection lifecycle

### 2. Session State Service (`src/session-state/session-state.service.ts`)
- Manages session state in Redis:
  - Current question ID
  - Timer state
  - Participant list
  - Session status
- Key structure:
  - `session:{sessionId}:state` - Session state (JSON)
  - `session:{sessionId}:participants` - Set of participant socket IDs
  - `session:{sessionId}:participant:{socketId}` - Participant info (JSON)

### 3. HTTP Endpoints

#### Join Session
```
POST /sessions/:id/join
Body: { nickname?: string, role: 'lecturer' | 'student' }
```
- Validates session exists
- Initializes session state in Redis if needed
- Returns session info

#### Submit Answer
```
POST /sessions/:sessionId/responses
Body: { questionId, response, responseTimeMs, userId?, nickname? }
```
- Validates session and question
- Calculates correctness
- Stores final result in PostgreSQL
- Triggers broadcast via Socket.IO (if needed)

### 4. Socket.IO Gateway (Broadcast Only)

The gateway now only broadcasts events:
- `question_started` - When a question begins
- `timer_update` - Timer countdown updates
- `timer_ended` - When timer reaches 0
- `results_shown` - When results are displayed
- `session_ended` - When session ends
- `participant_count` - Participant count updates

**Removed:**
- `join_session` handler (now HTTP endpoint)
- `submit_response` handler (now HTTP endpoint)

## Data Flow

### Joining a Session
1. Client calls `POST /sessions/:id/join`
2. Backend validates session, initializes Redis state
3. Client connects to Socket.IO and joins room
4. Backend broadcasts `participant_count` update

### Starting a Question
1. Lecturer calls HTTP endpoint or Socket.IO event
2. Backend updates Redis state (current question, timer)
3. Backend broadcasts `question_started` to all in room
4. Backend starts timer, broadcasts `timer_update` events

### Submitting an Answer
1. Client calls `POST /sessions/:sessionId/responses`
2. Backend validates and calculates correctness
3. Backend stores final result in PostgreSQL
4. Backend broadcasts `response_submitted` (if needed)

### Showing Results
1. Lecturer triggers show results
2. Backend calculates insights from PostgreSQL
3. Backend broadcasts `results_shown` to all in room

## Environment Variables

Add to `.env`:
```
REDIS_URL=redis://localhost:6379
```

## Benefits

1. **Scalability**: Redis allows horizontal scaling of session state
2. **Separation of Concerns**: HTTP for actions, WebSocket for broadcasts
3. **Persistence**: Only final results stored in DB, not live state
4. **Performance**: Redis is faster for session state operations
5. **Reliability**: Session state survives server restarts (with TTL)

## Migration Notes

- Old in-memory Maps replaced with Redis
- Socket.IO handlers for join/answer removed
- Frontend needs to use HTTP endpoints for join/answer
- Frontend still uses Socket.IO for receiving broadcasts

