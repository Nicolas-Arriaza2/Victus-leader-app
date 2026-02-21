import React, { createContext, useCallback, useEffect, useState } from 'react';
import { authApi } from '../services/api/auth';
import { LoginDto, RegisterDto, User } from '../types/api';
import { storage } from '../utils/storage';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const token = await storage.getToken();
        const user = await storage.getUser<User>();
        if (token && user) {
          setState({ user, token, isLoading: false, isAuthenticated: true });
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    })();
  }, []);

  const login = useCallback(async (dto: LoginDto) => {
    const { data: auth } = await authApi.login(dto);
    await storage.setToken(auth.access_token);
    const { data: user } = await authApi.me();
    await storage.setUser(user);
    setState({ user, token: auth.access_token, isLoading: false, isAuthenticated: true });
  }, []);

  const register = useCallback(async (dto: RegisterDto) => {
    const { data: auth } = await authApi.register(dto);
    await storage.setToken(auth.access_token);
    const { data: user } = await authApi.me();
    await storage.setUser(user);
    setState({ user, token: auth.access_token, isLoading: false, isAuthenticated: true });
  }, []);

  const logout = useCallback(async () => {
    await storage.clear();
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: user } = await authApi.me();
    await storage.setUser(user);
    setState((prev) => ({ ...prev, user }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
