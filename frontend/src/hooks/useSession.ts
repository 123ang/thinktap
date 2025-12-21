'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Session, CreateSessionDto } from '@/types/api';

export const useSession = (sessionId?: string) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await api.sessions.getById(sessionId);
      setSession(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (data: CreateSessionDto) => {
    setLoading(true);
    setError(null);

    try {
      const newSession = await api.sessions.create(data);
      setSession(newSession);
      return newSession;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const joinSession = async (code: string) => {
    setLoading(true);
    setError(null);

    try {
      const sessionData = await api.sessions.getByCode(code);
      setSession(sessionData);
      return sessionData;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);

    try {
      const updatedSession = await api.sessions.updateStatus(sessionId, status);
      setSession(updatedSession);
      return updatedSession;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async () => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);

    try {
      await api.sessions.delete(sessionId);
      setSession(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    session,
    loading,
    error,
    createSession,
    joinSession,
    updateStatus,
    deleteSession,
    refresh: loadSession,
  };
};

export default useSession;

