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
        
        // Notify others about participant count update
        this.server.to(sessionId).emit('participant_count', {
          count: participants.size,
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

      // Track participants
      if (!this.sessionParticipants.has(session.id)) {
        this.sessionParticipants.set(session.id, new Set());
      }
      this.sessionParticipants.get(session.id)!.add(client.id);
      this.userSessions.set(client.id, session.id);

      // Emit success to client
      client.emit('session_joined', {
        session: {
          id: session.id,
          code: session.code,
          mode: session.mode,
          status: session.status,
        },
      });

      // Broadcast participant count to all in session
      const participantCount = this.sessionParticipants.get(session.id)!.size;
      this.server.to(session.id).emit('participant_count', {
        count: participantCount,
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

      // Broadcast question to all participants (excluding correct answer)
      this.server.to(payload.sessionId).emit('question_started', {
        questionId: question.id,
        question: question.question,
        type: question.type,
        options: question.options,
        timerSeconds: question.timerSeconds,
        order: question.order,
      });

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
      // Broadcast session ended to all participants
      this.server.to(payload.sessionId).emit('session_ended', {
        message: 'Session has ended',
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

