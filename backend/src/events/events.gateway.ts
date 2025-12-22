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
import { UseGuards } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service';
import { QuestionsService } from '../questions/questions.service';
import { ResponsesService } from '../responses/responses.service';

interface JoinSessionPayload {
  sessionCode: string;
  userId?: string;
  userEmail?: string;
  role: 'lecturer' | 'student';
}

interface StartQuestionPayload {
  sessionId: string;
  questionId: string;
}

interface SubmitResponsePayload {
  sessionId: string;
  questionId: string;
  response: any;
  responseTimeMs: number;
  userId?: string;
  nickname?: string;
}

interface ShowResultsPayload {
  sessionId: string;
  questionId: string;
}

interface EndSessionPayload {
  sessionId: string;
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

  private sessionParticipants: Map<string, Set<string>> = new Map();
  private participantNames: Map<string, string> = new Map();
  private userSessions: Map<string, string> = new Map();

  constructor(
    private sessionsService: SessionsService,
    private questionsService: QuestionsService,
    private responsesService: ResponsesService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    
    // Remove client from session
    const sessionId = this.userSessions.get(client.id);
    if (sessionId) {
      const participants = this.sessionParticipants.get(sessionId);
      if (participants) {
        participants.delete(client.id);
        this.participantNames.delete(client.id);
        
        // Notify others about participant count update
        const names = Array.from(participants)
          .map((id) => this.participantNames.get(id))
          .filter((n): n is string => !!n);

        this.server.to(sessionId).emit('participant_count', {
          count: participants.size,
          names,
        });
      }
      this.userSessions.delete(client.id);
    }
  }

  @SubscribeMessage('join_session')
  async handleJoinSession(
    @MessageBody() payload: JoinSessionPayload,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Get session by code
      const session = await this.sessionsService.findByCode(payload.sessionCode);

      // Join socket room
      await client.join(session.id);
      console.log(`[Backend] Client ${client.id} joined session room ${session.id} (code: ${session.code}, role: ${payload.role})`);

      // Track participants - only count students as participants
      if (payload.role === 'student') {
        if (!this.sessionParticipants.has(session.id)) {
          this.sessionParticipants.set(session.id, new Set());
        }
        const participants = this.sessionParticipants.get(session.id)!;

        // Prevent duplicate nicknames in the same session
        if (payload.userEmail) {
          const namesInSession = Array.from(participants)
            .map((id) => this.participantNames.get(id))
            .filter((n): n is string => !!n);
          if (namesInSession.includes(payload.userEmail)) {
            client.emit('join_rejected', {
              reason: 'duplicate_nickname',
              message:
                'This nickname is already taken in this session. Please choose another one.',
            });
            return { success: false, error: 'Duplicate nickname' };
          }
        }

        participants.add(client.id);
        this.userSessions.set(client.id, session.id);
        if (payload.userEmail) {
          this.participantNames.set(client.id, payload.userEmail);
        }
      }

      // Emit success to client
      client.emit('session_joined', {
        session: {
          id: session.id,
          code: session.code,
          mode: session.mode,
          status: session.status,
        },
      });

      // Broadcast participant count and names to all in session
      const participants = this.sessionParticipants.get(session.id) || new Set<string>();
      const participantCount = participants.size;
      const names = Array.from(participants)
        .map((id) => this.participantNames.get(id))
        .filter((n): n is string => !!n);

      this.server.to(session.id).emit('participant_count', {
        count: participantCount,
        names,
      });

      return { success: true, sessionId: session.id };
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
      
      // Get all sockets in the session room to verify who's listening
      const room = this.server.sockets.adapter.rooms.get(payload.sessionId);
      const socketCount = room ? room.size : 0;
      console.log(`[Backend] Room ${payload.sessionId} has ${socketCount} socket(s)`);

      // Broadcast question to ALL in session (including lecturer) - this ensures sync
      // Prisma JSONB fields need to be properly serialized for Socket.IO
      // Convert to plain JavaScript value to ensure proper serialization
      let correctAnswerValue: any = null;
      if (question.correctAnswer !== null && question.correctAnswer !== undefined) {
        // Prisma JSONB can be number, string, array, object, or boolean
        // For Socket.IO, we need plain JavaScript values
        if (typeof question.correctAnswer === 'number') {
          correctAnswerValue = Number(question.correctAnswer); // Ensure it's a plain number
        } else if (Array.isArray(question.correctAnswer)) {
          correctAnswerValue = [...question.correctAnswer]; // Create a new array
        } else if (typeof question.correctAnswer === 'object') {
          // If it's an object, stringify and parse to get plain object
          correctAnswerValue = JSON.parse(JSON.stringify(question.correctAnswer));
        } else {
          correctAnswerValue = question.correctAnswer; // string, boolean, etc.
        }
      }
      
      const questionData = {
        questionId: question.id,
        question: question.question,
        type: question.type,
        options: question.options,
        correctAnswer: correctAnswerValue, // Use the properly serialized value
        timerSeconds: question.timerSeconds,
        order: question.order,
      };
      
      console.log(`[Backend] Broadcasting question_started to room ${payload.sessionId}:`, {
        questionId: questionData.questionId,
        correctAnswer: questionData.correctAnswer,
        correctAnswerType: typeof questionData.correctAnswer,
        correctAnswerValue: JSON.stringify(questionData.correctAnswer),
        rawCorrectAnswer: question.correctAnswer,
        rawCorrectAnswerType: typeof question.correctAnswer,
      });
      
      // Warn if correctAnswer is null
      if (questionData.correctAnswer === null || questionData.correctAnswer === undefined) {
        console.warn(`[Backend] WARNING: Question ${question.id} has no correctAnswer! Raw value:`, question.correctAnswer);
      }
      
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

  @SubscribeMessage('submit_response')
  async handleSubmitResponse(
    @MessageBody() payload: SubmitResponsePayload,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.responsesService.submit(payload.sessionId, {
        questionId: payload.questionId,
        response: payload.response,
        responseTimeMs: payload.responseTimeMs,
        userId: payload.userId,
        nickname: payload.nickname,
      });

      // Get current response count
      const responses = await this.responsesService.findAllByQuestion(
        payload.questionId,
      );

      // Broadcast response count update
      this.server.to(payload.sessionId).emit('response_received', {
        questionId: payload.questionId,
        responseCount: responses.length,
      });

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

      // Broadcast results to all participants
      this.server.to(payload.sessionId).emit('results_shown', {
        questionId: payload.questionId,
        insights: questionInsights,
        leaderboard: insights['leaderboard'] || null,
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
      
      // Broadcast session ended to all participants with leaderboard data
      this.server.to(payload.sessionId).emit('session_ended', {
        message: 'Session has ended',
        leaderboard: insights['leaderboard'] || null,
      });

      // Clean up
      this.sessionParticipants.delete(payload.sessionId);

      return { success: true };
    } catch (error) {
      client.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  private startTimer(sessionId: string, seconds: number) {
    let remaining = seconds;

    const interval = setInterval(() => {
      remaining--;
      
      this.server.to(sessionId).emit('timer_update', {
        remaining,
      });

      if (remaining <= 0) {
        clearInterval(interval);
        this.server.to(sessionId).emit('timer_ended');
      }
    }, 1000);
  }
}

