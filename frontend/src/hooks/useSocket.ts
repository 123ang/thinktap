'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Question, SubmitResponseDto, QuestionInsight } from '@/types/api';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

// Module-level singleton socket instance - persists across page navigations
let globalSocket: Socket | null = null;
let globalConnected = false;
let globalParticipantCount = 0;
let globalParticipantNames: string[] = [];
let globalCurrentQuestion: Question | null = null;
let globalTimeRemaining: number | null = null;
let globalResults: QuestionInsight | null = null;
let globalPreCountdown: number | null = null;
let preCountdownInterval: NodeJS.Timeout | null = null;

// Listeners for state updates
const stateListeners = new Set<() => void>();

const notifyListeners = () => {
  stateListeners.forEach(listener => listener());
};

// Initialize socket once (module level)
const initSocket = () => {
  if (globalSocket) return globalSocket;

  console.log('[useSocket] Creating global socket connection');
  const socket = io(SOCKET_URL, {
    transports: ['websocket'],
    autoConnect: true,
  });

  globalSocket = socket;

  // Connection events
  socket.on('connect', () => {
    console.log('[useSocket] Socket connected');
    globalConnected = true;
    notifyListeners();
  });

  socket.on('disconnect', () => {
    console.log('[useSocket] Socket disconnected');
    globalConnected = false;
    notifyListeners();
  });

  // Session events
  socket.on('participant_count', (data: { count: number; names?: string[] }) => {
    const allNames = data.names || [];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const filteredNames = allNames.filter((name) => !uuidRegex.test(name));
    console.log('[useSocket] Participant count updated:', filteredNames.length, filteredNames);
    globalParticipantCount = filteredNames.length;
    globalParticipantNames = filteredNames;
    notifyListeners();
  });

  socket.on('session_joined', (data: any) => {
    console.log('[useSocket] Session joined:', data);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('session_ready', { detail: data }));
    }
  });

  socket.on('question_started', (data: any) => {
    console.log('[useSocket] Question started event received:', data);
    console.log('[useSocket] correctAnswer from backend:', data.correctAnswer, 'type:', typeof data.correctAnswer);
    
    if (data.correctAnswer === null || data.correctAnswer === undefined) {
      console.warn('[useSocket] WARNING: Question has no correctAnswer!');
    }
    
    const question: Question = {
      id: data.questionId,
      sessionId: '',
      question: data.question,
      type: data.type,
      options: data.options,
      correctAnswer: data.correctAnswer !== undefined && data.correctAnswer !== null 
        ? data.correctAnswer 
        : null,
      timerSeconds: data.timerSeconds,
      order: data.order,
      responses: [],
      createdAt: new Date().toISOString(),
    };
    console.log('[useSocket] Setting currentQuestion with correctAnswer:', question.correctAnswer);
    globalCurrentQuestion = question;
    globalTimeRemaining = data.timerSeconds || null;
    globalResults = null;
    globalPreCountdown = null; // Clear pre-countdown when question starts
    if (preCountdownInterval) {
      clearInterval(preCountdownInterval);
      preCountdownInterval = null;
    }
    notifyListeners();
  });

  socket.on('timer_update', (data: { remaining: number }) => {
    globalTimeRemaining = data.remaining;
    notifyListeners();
  });

  socket.on('timer_ended', () => {
    console.log('[useSocket] Timer ended');
    globalTimeRemaining = 0;
    notifyListeners();
  });

  socket.on('pre_countdown', (data: { duration: number; startedAt: number }) => {
    console.log('[useSocket] Pre-countdown received:', data);
    
    if (preCountdownInterval) {
      clearInterval(preCountdownInterval);
    }
    
    const elapsed = Math.floor((Date.now() - data.startedAt) / 1000);
    let remaining = Math.max(0, data.duration - elapsed);
    
    globalPreCountdown = remaining;
    notifyListeners();
    
    preCountdownInterval = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(preCountdownInterval!);
        preCountdownInterval = null;
        globalPreCountdown = null;
      } else {
        globalPreCountdown = remaining;
      }
      notifyListeners();
    }, 1000);
  });

  socket.on('response_submitted', (data: { responseCount: number }) => {
    console.log('[useSocket] Response count:', data.responseCount);
  });

  socket.on('results_shown', (data: any) => {
    console.log('[useSocket] Results shown event received:', data);
    if (data.insights) {
      globalResults = data.insights;
    } else {
      globalResults = data;
    }
    notifyListeners();
  });

  socket.on('session_ended', (data: { message: string; leaderboard?: any }) => {
    console.log('[useSocket] Session ended:', data);
    globalCurrentQuestion = null;
    globalTimeRemaining = null;
    globalResults = null;
    if (data.leaderboard) {
      (socket as any).lastLeaderboard = data.leaderboard;
    }
    notifyListeners();
  });

  // Debug: log all events
  socket.onAny((eventName, ...args) => {
    if (eventName === 'question_started' || eventName === 'pre_countdown') {
      console.log(`[useSocket] Received ${eventName} via onAny:`, args);
    }
  });

  return socket;
};

interface UseSocketOptions {
  sessionCode?: string;
  autoConnect?: boolean;
  role?: 'lecturer' | 'student';
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { autoConnect = true } = options;
  
  // Local state that syncs with global state
  const [connected, setConnected] = useState(globalConnected);
  const [participantCount, setParticipantCount] = useState(globalParticipantCount);
  const [participantNames, setParticipantNames] = useState<string[]>(globalParticipantNames);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(globalCurrentQuestion);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(globalTimeRemaining);
  const [results, setResults] = useState<QuestionInsight | null>(globalResults);
  const [preCountdown, setPreCountdown] = useState<number | null>(globalPreCountdown);

  // Initialize socket and subscribe to state changes
  useEffect(() => {
    if (!autoConnect) return;

    // Initialize socket if not exists
    initSocket();

    // Subscribe to state changes
    const updateLocalState = () => {
      setConnected(globalConnected);
      setParticipantCount(globalParticipantCount);
      setParticipantNames(globalParticipantNames);
      setCurrentQuestion(globalCurrentQuestion);
      setTimeRemaining(globalTimeRemaining);
      setResults(globalResults);
      setPreCountdown(globalPreCountdown);
    };

    stateListeners.add(updateLocalState);
    
    // Sync initial state
    updateLocalState();

    // Cleanup: remove listener but DON'T disconnect socket
    return () => {
      stateListeners.delete(updateLocalState);
    };
  }, [autoConnect]);

  // Note: joinSession and submitResponse are now HTTP endpoints, not Socket.IO
  // Socket.IO is only used for receiving broadcasts
  // Components should use api.sessions.join() and api.responses.submit() instead

  const emitPreCountdown = useCallback((sessionId: string, duration: number) => {
    if (globalSocket) {
      console.log('[useSocket] Emitting pre_countdown:', { sessionId, duration });
      globalSocket.emit('pre_countdown', { sessionId, duration });
    }
  }, []);

  const startQuestion = useCallback((sessionId: string, questionId: string) => {
    if (globalSocket) {
      globalSocket.emit('start_question', { sessionId, questionId });
    }
  }, []);

  const showResults = useCallback((sessionId: string, questionId: string) => {
    if (globalSocket) {
      globalSocket.emit('show_results', { sessionId, questionId });
    }
  }, []);

  const endSession = useCallback((sessionId: string) => {
    if (globalSocket) {
      globalSocket.emit('end_session', { sessionId });
    }
  }, []);

  const clearQuestion = useCallback(() => {
    console.log('[useSocket] Clearing question state');
    globalCurrentQuestion = null;
    globalTimeRemaining = null;
    globalResults = null;
    globalPreCountdown = null;
    if (preCountdownInterval) {
      clearInterval(preCountdownInterval);
      preCountdownInterval = null;
    }
    notifyListeners();
  }, []);

  const disconnect = useCallback(() => {
    // Note: We don't actually disconnect the singleton socket
    // This is intentional to maintain connection across page navigations
    console.log('[useSocket] Disconnect called (no-op for singleton)');
  }, []);

  return {
    socket: globalSocket,
    connected,
    participantCount,
    participantNames,
    currentQuestion,
    timeRemaining,
    results,
    preCountdown,
    emitPreCountdown,
    startQuestion,
    showResults,
    endSession,
    clearQuestion,
    disconnect,
  };
};

export default useSocket;

