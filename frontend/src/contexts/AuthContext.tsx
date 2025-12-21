'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import apiClient from '@/lib/api/client';
import { User, LoginDto, RegisterDto } from '@/types/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load user from localStorage on mount
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('accessToken');

        if (storedUser && accessToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (data: LoginDto) => {
    try {
      const response = await api.auth.login(data);
      const { accessToken, refreshToken, user: userData } = response;

      // Store tokens and user data
      apiClient.setAuth(accessToken, refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: RegisterDto) => {
    try {
      const response = await api.auth.register(data);
      const { accessToken, refreshToken, user: userData } = response;

      // Store tokens and user data
      apiClient.setAuth(accessToken, refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    api.auth.logout();
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

