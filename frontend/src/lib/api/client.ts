import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private client: AxiosInstance;
  private refreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor - Handle errors and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.refreshing) {
            // Wait for the refresh to complete
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.refreshing = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await axios.post<AuthResponse>(
              `${API_BASE_URL}/auth/refresh`,
              { refreshToken },
            );

            const { accessToken, refreshToken: newRefreshToken } = response.data;
            this.setTokens(accessToken, newRefreshToken);

            // Retry all queued requests
            this.refreshSubscribers.forEach((callback) => callback(accessToken));
            this.refreshSubscribers = [];

            // Retry the original request
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            this.clearTokens();
            // Redirect to login
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          } finally {
            this.refreshing = false;
          }
        }

        return Promise.reject(error);
      },
    );
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  private setTokens(accessToken: string, refreshToken: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private clearTokens() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // Public method to get the axios instance
  getInstance(): AxiosInstance {
    return this.client;
  }

  // Helper methods for common HTTP operations
  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Auth helper methods
  setAuth(accessToken: string, refreshToken: string) {
    this.setTokens(accessToken, refreshToken);
  }

  clearAuth() {
    this.clearTokens();
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

// Create a singleton instance
const apiClient = new ApiClient();

export default apiClient;

