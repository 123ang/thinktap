import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SessionsService } from '../sessions/sessions.service';
import { QuestionsService } from '../questions/questions.service';
import { ResponsesService } from '../responses/responses.service';
import { SessionStateService } from '../session-state/session-state.service';

interface StartQuestionPayload {
  sessionId: string;
  questionId: string;
}

interface ShowResultsPayload {
  sessionId: string;
  questionId: string;
}

interface EndSessionPayload {
  sessionId: string;
}

interface PreCountdownPayload {
  sessionId: string;
  duration: number;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track socket to session mapping for disconnect cleanup
  private socketToSession: Map<string, string> = new Map();

  constructor(
    private sessionsService: SessionsService,
    private questionsService: QuestionsService,
    private responsesService: ResponsesService,
    private sessionStateService: SessionStateService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`[Socket.IO] Client connected: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody() payload: { sessionId: string; userId?: string; nickname?: string; role?: 'lecturer' | 'student' },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Verify session exists
      const session = await this.sessionsService.findOne(payload.sessionId, undefined);
      
      // Join socket room for broadcasts
      await client.join(payload.sessionId);
      this.socketToSession.set(client.id, payload.sessionId);

      // Add to Redis session state ONLY for students (exclude lecturer from participant count)
      if (payload.role === 'student') {
        // Clean up any old entries for this nickname (from page refreshes)
        if (payload.nickname) {
          const existingParticipants = await this.sessionStateService.getParticipants(payload.sessionId);
          for (const socketId of existingParticipants) {
            const info = await this.sessionStateService.getParticipant(payload.sessionId, socketId);
            // Remove if same nickname (user refreshed) or if socket is dead
            const socket = this.server.sockets.sockets.get(socketId);
            if ((info?.nickname === payload.nickname && info?.role === 'student') || !socket) {
              await this.sessionStateService.removeParticipant(payload.sessionId, socketId);
            }
          }
        }
        
        await this.sessionStateService.addParticipant(payload.sessionId, client.id, {
          socketId: client.id,
          userId: payload.userId,
          nickname: payload.nickname,
          role: 'student',
          joinedAt: Date.now(),
        });
      } else if (payload.role === 'lecturer') {
        // Clean up any existing lecturer entries in Redis (from before the fix)
        // Also remove this lecturer's socket if it was added previously
        const participants = await this.sessionStateService.getParticipants(payload.sessionId);
        for (const socketId of participants) {
          const info = await this.sessionStateService.getParticipant(payload.sessionId, socketId);
          // Remove if it's a lecturer OR if it matches this client's ID (to prevent duplicate)
          if (info?.role === 'lecturer' || socketId === client.id) {
            await this.sessionStateService.removeParticipant(payload.sessionId, socketId);
          }
        }
        // Ensure this lecturer is NOT added to Redis
        console.log(`[Socket.IO] Lecturer ${client.id} joined room but NOT added to participant count`);
      }
      
      // Always broadcast updated participant count (after cleanup if lecturer)
      await this.broadcastParticipantCount(payload.sessionId);
      
      console.log(`[Socket.IO] Client ${client.id} joined room ${payload.sessionId} as ${payload.role || 'unknown'}`);
      
      return { success: true };
    } catch (error) {
      client.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`[Socket.IO] Client disconnected: ${client.id}`);
    
    // Remove client from session state in Redis
    const sessionId = this.socketToSession.get(client.id);
    if (sessionId) {
      this.sessionStateService.removeParticipant(sessionId, client.id).then(() => {
        // Broadcast updated participant count
        this.broadcastParticipantCount(sessionId);
      }).catch(err => {
        console.error('[Socket.IO] Error removing participant:', err);
      });
      this.socketToSession.delete(client.id);
    }
  }

  // Helper method to broadcast participant count
  private async broadcastParticipantCount(sessionId: string) {
    // Clean up any stale or invalid participants
    const participants = await this.sessionStateService.getParticipants(sessionId);
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    console.log(`[Socket.IO] Cleaning up participants for session ${sessionId}, found ${participants.length} in Redis`);

    for (const socketId of participants) {
      const socket = this.server.sockets.sockets.get(socketId);
      const info = await this.sessionStateService.getParticipant(sessionId, socketId);

      // Remove if:
      // - socket no longer exists (browser closed or backend restarted)
      // - it's a lecturer
      // - userId or nickname looks like an internal UUID (lecturer or system)
      if (
        !socket ||
        info?.role === 'lecturer' ||
        (info?.userId && uuidRegex.test(info.userId)) ||
        (info?.nickname && uuidRegex.test(info.nickname))
      ) {
        console.log(`[Socket.IO] Removing participant: socketId=${socketId}, role=${info?.role}, nickname=${info?.nickname}, socketExists=${!!socket}`);
        await this.sessionStateService.removeParticipant(sessionId, socketId);
      }
    }

    // Re-fetch remaining participants after cleanup
    const remainingParticipants = await this.sessionStateService.getParticipants(sessionId);

    // Build student-only names (deduplicate by nickname)
    const studentNamesMap = new Map<string, string>(); // nickname -> socketId (keep only one per nickname)
    for (const socketId of remainingParticipants) {
      const info = await this.sessionStateService.getParticipant(sessionId, socketId);
      if (info?.role === 'student' && info.nickname && !uuidRegex.test(info.nickname)) {
        // If we already have this nickname, remove the old socket (keep the newest one)
        if (studentNamesMap.has(info.nickname)) {
          const oldSocketId = studentNamesMap.get(info.nickname);
          const oldSocket = this.server.sockets.sockets.get(oldSocketId!);
          const newSocket = this.server.sockets.sockets.get(socketId);
          // Keep the one with an active socket, or the newer one if both are active
          if (!oldSocket || (newSocket && socketId > oldSocketId!)) {
            // Remove old entry
            await this.sessionStateService.removeParticipant(sessionId, oldSocketId!);
            studentNamesMap.set(info.nickname, socketId);
          } else {
            // Remove this duplicate
            await this.sessionStateService.removeParticipant(sessionId, socketId);
          }
        } else {
          studentNamesMap.set(info.nickname, socketId);
        }
      }
    }

    // Convert map to array of unique nicknames
    const studentNames = Array.from(studentNamesMap.keys());
    const studentCount = studentNames.length;

    // Update state with correct count and names
    await this.sessionStateService.updateSessionState(sessionId, {
      participantCount: studentCount,
      participantNames: studentNames,
    });

    // Broadcast updated count
    this.server.to(sessionId).emit('participant_count', {
      count: studentCount,
      names: studentNames,
    });

    console.log(
      `[Socket.IO] Broadcast participant count after cleanup: ${studentCount}, names: ${JSON.stringify(
        studentNames,
      )}`,
    );
  }

  // Method to join a session room (called after HTTP join)
  async joinSessionRoom(sessionId: string, socketId: string, participantInfo: {
    userId?: string;
    nickname?: string;
    role: 'lecturer' | 'student';
  }) {
    const socket = this.server.sockets.sockets.get(socketId);
    if (!socket) {
      throw new Error('Socket not found');
    }

    // Join socket room
    await socket.join(sessionId);
    this.socketToSession.set(socketId, sessionId);

    // Add to Redis session state ONLY for students (exclude lecturer)
    if (participantInfo.role === 'student') {
      await this.sessionStateService.addParticipant(sessionId, socketId, {
        socketId,
        userId: participantInfo.userId,
        nickname: participantInfo.nickname,
        role: 'student',
        joinedAt: Date.now(),
      });
    } else if (participantInfo.role === 'lecturer') {
      // Clean up any existing lecturer entries in Redis
      const participants = await this.sessionStateService.getParticipants(sessionId);
      for (const pid of participants) {
        const info = await this.sessionStateService.getParticipant(sessionId, pid);
        if (info?.role === 'lecturer') {
          await this.sessionStateService.removeParticipant(sessionId, pid);
        }
      }
    }

    // Broadcast updated participant count
    await this.broadcastParticipantCount(sessionId);

    // Emit session joined confirmation
    socket.emit('session_joined', {
      session: { id: sessionId },
    });

    console.log(`[Socket.IO] Client ${socketId} joined session room ${sessionId} as ${participantInfo.role}`);
  }

  @SubscribeMessage('pre_countdown')
  async handlePreCountdown(
    @MessageBody() payload: PreCountdownPayload,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      console.log(`[Socket.IO] Pre-countdown started for session ${payload.sessionId}, duration: ${payload.duration}s`);
      
      // Broadcast to all in session room (including sender)
      this.server.to(payload.sessionId).emit('pre_countdown', {
        duration: payload.duration,
        startedAt: Date.now(),
      });

      return { success: true };
    } catch (error) {
      client.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('start_question')
  async handleStartQuestion(
    @MessageBody() payload: StartQuestionPayload,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const question = await this.questionsService.findOne(payload.questionId);

      console.log(`[Backend] Starting question ${payload.questionId} for session ${payload.sessionId}`);
      console.log(`[Backend] Question from DB:`, {
        id: question.id,
        correctAnswer: question.correctAnswer,
        correctAnswerType: typeof question.correctAnswer,
        correctAnswerValue: JSON.stringify(question.correctAnswer),
      });
      
      // Update session state in Redis
      if (question.timerSeconds) {
        await this.sessionStateService.startQuestion(
          payload.sessionId,
          payload.questionId,
          question.timerSeconds,
        );
      }

      // Serialize correctAnswer for Socket.IO
      let correctAnswerValue: any = null;
      if (question.correctAnswer !== null && question.correctAnswer !== undefined) {
        if (typeof question.correctAnswer === 'number') {
          correctAnswerValue = Number(question.correctAnswer);
        } else if (Array.isArray(question.correctAnswer)) {
          correctAnswerValue = [...question.correctAnswer];
        } else if (typeof question.correctAnswer === 'object') {
          correctAnswerValue = JSON.parse(JSON.stringify(question.correctAnswer));
        } else {
          correctAnswerValue = question.correctAnswer;
        }
      }
      
      const questionData = {
        questionId: question.id,
        question: question.question,
        type: question.type,
        options: question.options,
        correctAnswer: correctAnswerValue,
        timerSeconds: question.timerSeconds,
        order: question.order,
      };
      
      console.log(`[Backend] Broadcasting question_started to room ${payload.sessionId}:`, {
        questionId: questionData.questionId,
        correctAnswer: questionData.correctAnswer,
        correctAnswerType: typeof questionData.correctAnswer,
      });
      
      if (questionData.correctAnswer === null || questionData.correctAnswer === undefined) {
        console.warn(`[Backend] WARNING: Question ${question.id} has no correctAnswer!`);
      }
      
      // Broadcast to all in session room
      this.server.to(payload.sessionId).emit('question_started', questionData);

      // Start timer if specified
      if (question.timerSeconds) {
        this.startTimer(payload.sessionId, question.timerSeconds);
      }

      return { success: true };
    } catch (error) {
      client.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('show_results')
  async handleShowResults(
    @MessageBody() payload: ShowResultsPayload,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const insights = await this.responsesService.getInsights(payload.sessionId);

      // Find the specific question insights
      const questionInsights = insights.questions.find(
        (q) => q.questionId === payload.questionId,
      );

      // Get rankings for this question
      const rankings = await this.responsesService.getQuestionRankings(payload.questionId);

      // Update session state
      await this.sessionStateService.showResults(payload.sessionId);

      // Broadcast results to all participants
      this.server.to(payload.sessionId).emit('results_shown', {
        questionId: payload.questionId,
        insights: questionInsights,
        leaderboard: insights['leaderboard'] || null,
        rankings: rankings,
      });

      return { success: true };
    } catch (error) {
      client.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('end_session')
  async handleEndSession(
    @MessageBody() payload: EndSessionPayload,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Get insights with leaderboard
      const insights = await this.responsesService.getInsights(payload.sessionId);
      
      // Update session state
      await this.sessionStateService.endSession(payload.sessionId);
      
      // Broadcast session ended to all participants with leaderboard data
      this.server.to(payload.sessionId).emit('session_ended', {
        message: 'Session has ended',
        leaderboard: insights['leaderboard'] || null,
      });

      return { success: true };
    } catch (error) {
      client.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  private startTimer(sessionId: string, seconds: number) {
    let remaining = seconds;

    const interval = setInterval(async () => {
      remaining--;
      
      // Update Redis state
      await this.sessionStateService.updateTimer(sessionId, remaining);
      
      // Broadcast timer update
      this.server.to(sessionId).emit('timer_update', {
        remaining,
      });

      if (remaining <= 0) {
        clearInterval(interval);
        this.server.to(sessionId).emit('timer_ended');
      }
    }, 1000);
  }

  // Method to broadcast response submitted (called from responses service)
  async broadcastResponseSubmitted(sessionId: string, questionId: string, responseCount: number) {
    this.server.to(sessionId).emit('response_submitted', {
      questionId,
      responseCount,
    });
  }
}
