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
  onboardingCompleted: boolean;
}

interface AuthContextValue extends AuthState {
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
  completeOnboarding: () => Promise<void>;
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
    onboardingCompleted: true,
  });

  // Restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const token = await storage.getToken();
        const user = await storage.getUser<User>();
        if (token && user) {
          const onboardingStatus = await storage.getOnboardingCompleted();
          // null = key not found = existing user (skip onboarding)
          // 'false' = registered but didn't finish onboarding
          const onboardingCompleted = onboardingStatus !== false;
          setState({ user, token, isLoading: false, isAuthenticated: true, onboardingCompleted });
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
    const onboardingStatus = await storage.getOnboardingCompleted();
    const onboardingCompleted = onboardingStatus !== false;
    setState({ user, token: auth.access_token, isLoading: false, isAuthenticated: true, onboardingCompleted });
  }, []);

  const register = useCallback(async (dto: RegisterDto) => {
    const { data: auth } = await authApi.register(dto);
    await storage.setToken(auth.access_token);
    const { data: user } = await authApi.me();
    await storage.setUser(user);
    await storage.setOnboardingCompleted(false);
    setState({ user, token: auth.access_token, isLoading: false, isAuthenticated: true, onboardingCompleted: false });
  }, []);

  const logout = useCallback(async () => {
    await storage.clear();
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false, onboardingCompleted: true });
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: user } = await authApi.me();
    await storage.setUser(user);
    setState((prev) => ({ ...prev, user }));
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    setState((prev) => {
      if (!prev.user) return prev;
      const updated: User = {
        ...prev.user,
        ...patch,
        profile: patch.profile
          ? { ...prev.user.profile, ...patch.profile } as User['profile']
          : prev.user.profile,
      };
      storage.setUser(updated);
      return { ...prev, user: updated };
    });
  }, []);

  const completeOnboarding = useCallback(async () => {
    await storage.setOnboardingCompleted(true);
    await storage.setTourCompleted(false); // Show the tour on first enter to MainNavigator
    setState((prev) => ({ ...prev, onboardingCompleted: true }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser, updateUser, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}
