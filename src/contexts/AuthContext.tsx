import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAsyncTokenGetter, setOnUnauthorized } from '../lib/api/http';
import { api } from '../lib/api';
import { getAuthToken, setAuthToken } from '../lib/authToken';
import { AuthProfileResponse, AuthUser } from '../lib/types/auth';

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  localLogin: (token: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  syncUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'smart_driver_pay_auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuth = useCallback(async () => {
    setUser(null);
    setToken(null);
    await setAuthToken(null);
    localStorage.removeItem(USER_KEY);
  }, []);

  // Bootstrap: token + user din storage
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await getAuthToken();
        const storedUserRaw = localStorage.getItem(USER_KEY);

        if (storedToken) setToken(storedToken);

        if (storedUserRaw) {
          try {
            setUser(JSON.parse(storedUserRaw));
          } catch {
            setUser(null);
          }
        }

        // IMPORTANT: token getter pt request-uri authed
        setAsyncTokenGetter(async () => await getAuthToken());
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Global 401 handler
  useEffect(() => {
    setOnUnauthorized(() => {
      void (async () => {
        await clearAuth();
        navigate('/sign-in', { replace: true });
      })();
    });
  }, [clearAuth, navigate]);

  const localLogin = useCallback(async (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);

    await setAuthToken(newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      try {
        await api.authed.post('/auth/logout');
      } catch {
        // Local cleanup remains the source of truth for sign-out in web app.
      }
    }

    await clearAuth();
    navigate('/sign-in', { replace: true });
  }, [clearAuth, navigate, token]);

  const syncUser = useCallback(async () => {
    if (!token) return;

    try {
      const data = await api.authed.get<AuthProfileResponse>('/users/profile');
      const u = data?.user ?? data;

      setUser(u);
      localStorage.setItem(USER_KEY, JSON.stringify(u));
    } catch {
      // Unauthorized is handled globally.
    }
  }, [token]);

  const value: AuthContextType = useMemo(() => ({
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    localLogin,
    logout,
    syncUser,
  }), [user, token, isLoading, localLogin, logout, syncUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
