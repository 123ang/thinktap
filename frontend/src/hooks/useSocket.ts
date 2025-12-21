'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Question, SubmitResponseDto, QuestionInsight } from '@/types/api';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

interface UseSocketOptions {
  sessionCode?: string;
  autoConnect?: boolean;
  role?: 'lecturer' | 'student';
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { sessionCode, autoConnect = true, role = 'student' } = options;
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [participantNames, setParticipantNames] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [results, setResults] = useState<QuestionInsight | null>(null);

  useEffect(() => {
    if (!autoConnect) return;

    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);

      // Auto-join session if code is provided
      if (sessionCode) {
        socket.emit('join_session', {
          sessionCode,
          role,
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    // Session events
    // Backend sends aggregate participant counts and names via "participant_count"
    socket.on('participant_count', (data: { count: number; names?: string[] }) => {
      console.log('Participant count updated:', data.count, data.names);
      setParticipantCount(data.count);
      setParticipantNames(data.names || []);
    });

    socket.on('question_started', (data: any) => {
      console.log('Question started:', data);
      const question: Question = {
        id: data.questionId,
        sessionId: '', // not needed on client for now
        question: data.question,
        type: data.type,
        options: data.options,
        correctAnswer: null,
        timerSeconds: data.timerSeconds,
        order: data.order,
        responses: [],
        createdAt: new Date().toISOString(),
      };
      setCurrentQuestion(question);
      setTimeRemaining(data.timerSeconds || null);
      setResults(null);
    });

    socket.on('timer_update', (data: { remaining: number }) => {
      setTimeRemaining(data.remaining);
    });

    socket.on('response_submitted', (data: { responseCount: number }) => {
      console.log('Response count:', data.responseCount);
    });

    socket.on('results_shown', (data: QuestionInsight) => {
      console.log('Results:', data);
      setResults(data);
    });

    socket.on('session_ended', () => {
      console.log('Session ended');
      setCurrentQuestion(null);
      setTimeRemaining(null);
      setResults(null);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [sessionCode, autoConnect]);

  // Socket methods
  const joinSession = useCallback(
    (code: string, nickname?: string) => {
      if (socketRef.current) {
        socketRef.current.emit('join_session', {
          sessionCode: code,
          role: 'student',
          userEmail: nickname,
        });
      }
    },
    [],
  );

  const startQuestion = useCallback((sessionId: string, questionId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('start_question', { sessionId, questionId });
    }
  }, []);

  const submitResponse = useCallback((data: SubmitResponseDto & { sessionId: string }) => {
    if (socketRef.current) {
      socketRef.current.emit('submit_response', data);
    }
  }, []);

  const showResults = useCallback((sessionId: string, questionId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('show_results', { sessionId, questionId });
    }
  }, []);

  const endSession = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('end_session');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  }, []);

  return {
    socket: socketRef.current,
    connected,
    participantCount,
    participantNames,
    currentQuestion,
    timeRemaining,
    results,
    joinSession,
    startQuestion,
    submitResponse,
    showResults,
    endSession,
    disconnect,
  };
};

export default useSocket;

