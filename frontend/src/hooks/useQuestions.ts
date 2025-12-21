'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Question, CreateQuestionDto } from '@/types/api';

export const useQuestions = (sessionId?: string) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadQuestions();
    }
  }, [sessionId]);

  const loadQuestions = async () => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await api.questions.getAll(sessionId);
      setQuestions(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createQuestion = async (data: CreateQuestionDto) => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);

    try {
      const newQuestion = await api.questions.create(sessionId, data);
      setQuestions((prev) => [...prev, newQuestion]);
      return newQuestion;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createBulk = async (questionData: CreateQuestionDto[]) => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);

    try {
      const newQuestions = await api.questions.createBulk(sessionId, questionData);
      setQuestions((prev) => [...prev, ...newQuestions]);
      return newQuestions;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (questionId: string) => {
    setLoading(true);
    setError(null);

    try {
      await api.questions.delete(questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    questions,
    loading,
    error,
    createQuestion,
    createBulk,
    deleteQuestion,
    refresh: loadQuestions,
  };
};

export default useQuestions;

