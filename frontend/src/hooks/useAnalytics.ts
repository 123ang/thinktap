'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { SessionInsights, DashboardStats } from '@/types/api';

export const useAnalytics = (sessionId?: string) => {
  const [insights, setInsights] = useState<SessionInsights | null>(null);
  const [dashboard, setDashboard] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadSessionInsights = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.analytics.getSessionInsights(id);
      setInsights(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.analytics.getDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      loadSessionInsights(sessionId);
    }
  }, [sessionId]);

  return {
    insights,
    dashboard,
    loading,
    error,
    loadSessionInsights,
    loadDashboard,
  };
};

export default useAnalytics;

