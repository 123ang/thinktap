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

  // Initialize socket connection once
  useEffect(() => {
    if (!autoConnect) return;

    // Only create socket if it doesn't exist
    if (!socketRef.current) {
      const socket = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true,
      });

      socketRef.current = socket;

      // Connection events
      socket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
      });

      // Listen for session joined confirmation
      socket.on('session_joined', (data: any) => {
        console.log('Session joined:', data);
        // Emit custom event to notify components that session is ready
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('session_ready', { detail: data }));
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

      const handleQuestionStarted = (data: any) => {
        console.log('[useSocket] Question started event received:', data);
        console.log('[useSocket] Current role:', role);
        console.log('[useSocket] Current sessionCode:', sessionCode);
        console.log('[useSocket] correctAnswer from backend:', data.correctAnswer, 'type:', typeof data.correctAnswer);
        
        // Warn if correctAnswer is missing
        if (data.correctAnswer === null || data.correctAnswer === undefined) {
          console.warn('[useSocket] WARNING: Question has no correctAnswer! The question needs to be edited and saved with a correct answer.');
        }
        
        const question: Question = {
          id: data.questionId,
          sessionId: '', // not needed on client for now
          question: data.question,
          type: data.type,
          options: data.options,
          correctAnswer: data.correctAnswer !== undefined && data.correctAnswer !== null 
            ? data.correctAnswer 
            : null, // Explicitly null if missing
          timerSeconds: data.timerSeconds,
          order: data.order,
          responses: [],
          createdAt: new Date().toISOString(),
        };
        console.log('[useSocket] Setting currentQuestion with correctAnswer:', question.correctAnswer);
        setCurrentQuestion(question);
        setTimeRemaining(data.timerSeconds || null);
        setResults(null);
        console.log('[useSocket] State updated - question set');
      };
      
      socket.on('question_started', handleQuestionStarted);
      console.log('[useSocket] question_started listener attached for role:', role);
      
      // Also log all socket events for debugging
      socket.onAny((eventName, ...args) => {
        if (eventName === 'question_started') {
          console.log('[useSocket] Received question_started via onAny:', args);
        }
      });

      socket.on('timer_update', (data: { remaining: number }) => {
        setTimeRemaining(data.remaining);
      });

      socket.on('timer_ended', () => {
        console.log('Timer ended');
        setTimeRemaining(0);
      });

      socket.on('response_submitted', (data: { responseCount: number }) => {
        console.log('Response count:', data.responseCount);
      });

      socket.on('results_shown', (data: any) => {
        console.log('[useSocket] Results shown event received:', data);
        // Backend sends { questionId, insights, leaderboard }
        // Extract the insights object which contains the QuestionInsight data
        if (data.insights) {
          console.log('[useSocket] Setting results from insights:', data.insights);
          setResults(data.insights);
        } else {
          // Fallback: if data is already the insight object
          console.log('[useSocket] Setting results directly from data:', data);
          setResults(data);
        }
      });

      socket.on('session_ended', (data: { message: string; leaderboard?: any }) => {
        console.log('Session ended:', data);
        setCurrentQuestion(null);
        setTimeRemaining(null);
        setResults(null);
        // Store leaderboard data for dashboard
        if (data.leaderboard) {
          // Store in a way that can be accessed by the component
          (socket as any).lastLeaderboard = data.leaderboard;
        }
      });
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [autoConnect]);

  // Join session when sessionCode becomes available (only if no explicit joinSession call is made)
  // Note: This auto-join doesn't include nickname, so components should use joinSession() for students
  useEffect(() => {
    const socket = socketRef.current;
    if (socket && connected && sessionCode && role === 'lecturer') {
      // Only auto-join for lecturers; students should use explicit joinSession() with nickname
      socket.emit('join_session', {
        sessionCode,
        role,
      });
      console.log(`Auto-joining session as ${role}:`, sessionCode);
    }
  }, [sessionCode, connected, role]);

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

  const endSession = useCallback((sessionId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('end_session', { sessionId });
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

