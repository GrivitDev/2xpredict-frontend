'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import api from '@/lib/axios';
import type { AuthContextType, AuthUser, User } from '@/types/auth';

interface JwtUser extends AuthUser {
  userId?: string;
  exp?: number;
  iat?: number;
}

const AuthContext = createContext<AuthContextType | null>(null);
const TOKEN_COOKIE = 'token';
const TOKEN_MAX_AGE_DAYS = 7;

function readTokenUser(token: string): AuthUser | null {
  try {
    const payload = jwtDecode<JwtUser>(token);
    if (payload.exp && payload.exp * 1000 <= Date.now()) return null;
    const userId = payload.userId ?? payload.id ?? payload.sub ?? payload._id;
    if (!payload.email || !userId) return null;
    return {
      ...payload,
      id: userId,
      userId,
    };
  } catch {
    return null;
  }
}

function mergeUser(decoded: AuthUser | null, serverUser: unknown): AuthUser | null {
  if (!serverUser || typeof serverUser !== 'object') return decoded;
  const source = serverUser as Partial<AuthUser>;
  if (!source.email) return decoded;
  return {
    ...(decoded ?? {} as AuthUser),
    ...source,
    id: source.id ?? source._id ?? source.userId ?? decoded?.id ?? decoded?.userId,
    userId: source.userId ?? source._id ?? source.id ?? decoded?.userId ?? decoded?.id,
  } as AuthUser;
}

function toContextUser(value: AuthUser | null): User | null {
  if (!value?.email) return null;
  const userId = value.userId ?? value.id ?? value.sub ?? value._id;
  if (!userId) return null;

  return {
    ...value,
    userId,
    email: value.email,
    role: value.role ?? 'user',
    sessionId: value.sessionId ?? '',
    country: value.country ?? '',
    countryCode: value.countryCode ?? '',
    currency: value.currency === 'USD' ? 'USD' : 'NGN',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async (requestTimeoutMs = 30_000) => {
    const currentToken = Cookies.get(TOKEN_COOKIE);
    if (!currentToken) {
      setUser(null);
      setToken(null);
      return;
    }

    const decoded = readTokenUser(currentToken);
    if (!decoded) {
      Cookies.remove(TOKEN_COOKIE);
      setUser(null);
      setToken(null);
      return;
    }

    setToken(currentToken);
    setUser((current) => mergeUser(decoded, current));
    try {
      // /users/me returns persisted fields such as isVerified/status. The
      // initial bootstrap uses a shorter timeout; later explicit refreshes keep
      // the normal API timeout. On failure, the decoded identity is preserved.
      const response = await api.get('/users/me', { timeout: requestTimeoutMs });
      setUser(mergeUser(decoded, response.data));
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      // Preserve the decoded identity on network/server errors; only discard an
      // invalid session when the backend explicitly rejects it.
      if (status === 401 || status === 403) {
        Cookies.remove(TOKEN_COOKIE);
        setUser(null);
        setToken(null);
      }
    }
  }, []);

  useEffect(() => {
    let alive = true;
    const initialize = async () => {
      try {
        if (Cookies.get(TOKEN_COOKIE)) await refreshUser(8_000);
      } finally {
        if (alive) setLoading(false);
      }
    };
    void initialize();
    return () => { alive = false; };
  }, [refreshUser]);

  const login = useCallback((newToken: string, responseUser?: Partial<AuthUser>) => {
    const decoded = readTokenUser(newToken);
    if (!decoded) throw new Error('The server returned an invalid or expired JWT.');
    Cookies.set(TOKEN_COOKIE, newToken, { expires: TOKEN_MAX_AGE_DAYS, sameSite: 'lax', secure: typeof window !== 'undefined' && window.location.protocol === 'https:' });
    setToken(newToken);
    setUser(mergeUser(decoded, responseUser));
  }, []);

  const logout = useCallback(() => {
    Cookies.remove(TOKEN_COOKIE);
    setUser(null);
    setToken(null);
  }, []);

  const contextUser = useMemo(() => toContextUser(user), [user]);
  const value = useMemo<AuthContextType>(() => ({ user: contextUser, token, loading, login, logout, refreshUser }), [contextUser, token, loading, login, logout, refreshUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}


