import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

export interface SessionState {
  sessionId: string;
  currentQuestionId: string | null;
  timeRemaining: number | null;
  timerStartTime: number | null;
  status: 'waiting' | 'question_active' | 'results_shown' | 'ended';
  participantCount: number;
  participantNames: string[];
}

export interface ParticipantInfo {
  socketId: string;
  userId?: string;
  nickname?: string;
  role: 'lecturer' | 'student';
  joinedAt: number;
}

@Injectable()
export class SessionStateService {
  constructor(private redis: RedisService) {}

  // Session state keys
  private getSessionStateKey(sessionId: string): string {
    return `session:${sessionId}:state`;
  }

  private getParticipantsKey(sessionId: string): string {
    return `session:${sessionId}:participants`;
  }

  private getParticipantKey(sessionId: string, socketId: string): string {
    return `session:${sessionId}:participant:${socketId}`;
  }

  // Session State Management
  async createSessionState(
    sessionId: string,
    initialState: Partial<SessionState>,
  ): Promise<void> {
    const state: SessionState = {
      sessionId,
      currentQuestionId: null,
      timeRemaining: null,
      timerStartTime: null,
      status: 'waiting',
      participantCount: 0,
      participantNames: [],
      ...initialState,
    };

    await this.redis.set(
      this.getSessionStateKey(sessionId),
      JSON.stringify(state),
      3600, // 1 hour TTL
    );
  }

  async getSessionState(sessionId: string): Promise<SessionState | null> {
    const data = await this.redis.get(this.getSessionStateKey(sessionId));
    if (!data) return null;
    return JSON.parse(data);
  }

  async updateSessionState(
    sessionId: string,
    updates: Partial<SessionState>,
  ): Promise<void> {
    const current = await this.getSessionState(sessionId);
    if (!current) {
      await this.createSessionState(sessionId, updates);
      return;
    }

    const updated = { ...current, ...updates };
    await this.redis.set(
      this.getSessionStateKey(sessionId),
      JSON.stringify(updated),
      3600,
    );
  }

  async deleteSessionState(sessionId: string): Promise<void> {
    await this.redis.del(this.getSessionStateKey(sessionId));
    await this.redis.del(this.getParticipantsKey(sessionId));
    // Delete all participant keys
    const participants = await this.getParticipants(sessionId);
    for (const socketId of participants) {
      await this.redis.del(this.getParticipantKey(sessionId, socketId));
    }
  }

  // Participant Management
  async addParticipant(
    sessionId: string,
    socketId: string,
    participant: ParticipantInfo,
  ): Promise<void> {
    // Add to participants set
    await this.redis.sadd(this.getParticipantsKey(sessionId), socketId);

    // Store participant info
    await this.redis.set(
      this.getParticipantKey(sessionId, socketId),
      JSON.stringify(participant),
      3600,
    );

    // Update participant count (only count students, exclude lecturers)
    const participants = await this.getParticipants(sessionId);
    const studentCount = await this.getStudentCount(sessionId);
    const state = await this.getSessionState(sessionId);
    if (state) {
      // Get all participant names (only students, exclude UUIDs, deduplicate by nickname)
      const namesSet = new Set<string>(); // Use Set to automatically deduplicate
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      for (const pid of participants) {
        const info = await this.getParticipant(sessionId, pid);
        // Only include students in names, and exclude UUIDs
        if (info?.role === 'student') {
          if (info?.nickname && !uuidRegex.test(info.nickname)) {
            namesSet.add(info.nickname); // Set automatically handles duplicates
          } else if (info?.userId && !uuidRegex.test(info.userId)) {
            // Only add userId if it's not a UUID (shouldn't happen for students with nicknames)
            namesSet.add(info.userId);
          }
        }
      }

      // Convert Set to array for storage
      const names = Array.from(namesSet);

      await this.updateSessionState(sessionId, {
        participantCount: names.length, // Use unique names count instead of studentCount
        participantNames: names,
      });
    }
  }

  async removeParticipant(sessionId: string, socketId: string): Promise<void> {
    await this.redis.srem(this.getParticipantsKey(sessionId), socketId);
    await this.redis.del(this.getParticipantKey(sessionId, socketId));

    // Update participant count (only count students, exclude lecturers)
    const studentCount = await this.getStudentCount(sessionId);
    const state = await this.getSessionState(sessionId);
    if (state) {
      const participants = await this.getParticipants(sessionId);
      const names: string[] = [];
      for (const pid of participants) {
        const info = await this.getParticipant(sessionId, pid);
        // Only include students in names
        if (info?.role === 'student') {
          if (info?.nickname) {
            names.push(info.nickname);
          } else if (info?.userId) {
            names.push(info.userId);
          }
        }
      }

      await this.updateSessionState(sessionId, {
        participantCount: studentCount,
        participantNames: names,
      });
    }
  }

  async getParticipant(
    sessionId: string,
    socketId: string,
  ): Promise<ParticipantInfo | null> {
    const data = await this.redis.get(
      this.getParticipantKey(sessionId, socketId),
    );
    if (!data) return null;
    return JSON.parse(data);
  }

  async getParticipants(sessionId: string): Promise<string[]> {
    return this.redis.smembers(this.getParticipantsKey(sessionId));
  }

  async getParticipantCount(sessionId: string): Promise<number> {
    return this.getStudentCount(sessionId);
  }

  // Get count of students only (exclude lecturers)
  async getStudentCount(sessionId: string): Promise<number> {
    const participants = await this.getParticipants(sessionId);
    let studentCount = 0;
    for (const pid of participants) {
      const info = await this.getParticipant(sessionId, pid);
      if (info?.role === 'student') {
        studentCount++;
      }
    }
    return studentCount;
  }

  // Question/Timer Management
  async startQuestion(
    sessionId: string,
    questionId: string,
    timerSeconds: number,
  ): Promise<void> {
    await this.updateSessionState(sessionId, {
      currentQuestionId: questionId,
      timeRemaining: timerSeconds,
      timerStartTime: Date.now(),
      status: 'question_active',
    });
  }

  async updateTimer(sessionId: string, timeRemaining: number): Promise<void> {
    await this.updateSessionState(sessionId, {
      timeRemaining,
    });
  }

  async showResults(sessionId: string): Promise<void> {
    await this.updateSessionState(sessionId, {
      status: 'results_shown',
    });
  }

  async endSession(sessionId: string): Promise<void> {
    await this.updateSessionState(sessionId, {
      status: 'ended',
      currentQuestionId: null,
      timeRemaining: null,
    });
  }
}
