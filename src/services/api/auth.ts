import { AuthResponse, LoginDto, RegisterDto, User } from '../../types/api';
import apiClient from './client';

export const authApi = {
  register: (dto: RegisterDto) =>
    apiClient.post<AuthResponse>('/auth/register', dto),

  login: (dto: LoginDto) =>
    apiClient.post<AuthResponse>('/auth/login', dto),

  me: () =>
    apiClient.get<User>('/users/me'),

  forgotPassword: (email: string) =>
    apiClient.post<{ message: string }>('/auth/forgot-password', { email }),

  resetPassword: (email: string, code: string, newPassword: string) =>
    apiClient.post<AuthResponse>('/auth/reset-password', { email, code, newPassword }),
};
