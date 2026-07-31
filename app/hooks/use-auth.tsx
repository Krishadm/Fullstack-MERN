'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, useGetMe, setAuthTokenGetter } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem('re_token') : null
  );
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Wire up the token getter so apiFetch always has the latest token
  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem('re_token'));
  }, []);

  const { data: fetchedUser, isLoading: isFetchingMe, error } = useGetMe(!!token);

  const logout = useCallback(() => {
    localStorage.removeItem('re_token');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
    } else if (fetchedUser) {
      setUser(fetchedUser);
      setIsLoading(false);
    } else if (error) {
      logout();
      setIsLoading(false);
    } else if (isFetchingMe) {
      setIsLoading(true);
    }
  }, [token, fetchedUser, error, isFetchingMe, logout]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('re_token', newToken);
    setAuthTokenGetter(() => newToken);
    setToken(newToken);
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
