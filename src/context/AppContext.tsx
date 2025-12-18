import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Role = 'CUSTOMER' | 'ADMIN';

interface AppContextValue {
  isAuthenticated: boolean;
  token?: string;
  user?: User;
  role: Role;
  login: (nextRole?: Role) => void;
  loginWithToken: (payload: { token: string; role: Role; user?: User }) => Promise<void>;
  logout: () => void;
  switchRole: (nextRole: Role) => void;
}

const defaultValue: AppContextValue = {
  isAuthenticated: false,
  role: 'CUSTOMER',
  token: undefined,
  user: undefined,
  login: () => undefined,
  loginWithToken: async () => undefined,
  logout: () => undefined,
  switchRole: () => undefined,
};

export type User = {
  id: string;
  name: string;
  phone: string;
  description?: string | null;
};

type Session = {
  token?: string;
  role: Role;
  user?: User;
  expiresAt: number;
};

export const SESSION_STORAGE_KEY = 'dabbatrack.session';

const AppContext = createContext<AppContextValue>(defaultValue);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState<Role>('CUSTOMER');
  const [token, setToken] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<User | undefined>(undefined);

  const applySession = (session: Session | null) => {
    setAuthenticated(!!session);
    setRole(session?.role ?? 'CUSTOMER');
    setToken(session?.token);
    setUser(session?.user);
  };

  const loadSession = async () => {
    try {
      const raw = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Session;
      if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
        applySession(parsed);
      } else {
        await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // ignore corrupted storage
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  const login = (nextRole: Role = 'CUSTOMER') => {
    setAuthenticated(true);
    setRole(nextRole);
    setToken(undefined);
    setUser(undefined);
  };

  const loginWithToken = async (payload: { token: string; role: Role; user?: User }) => {
    const session: Session = {
      token: payload.token,
      role: payload.role,
      user: payload.user,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    };
    applySession(session);
    await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  };

  const logout = async () => {
    applySession(null);
    await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
  };

  const switchRole = (nextRole: Role) => {
    setRole(nextRole);
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      token,
      user,
      role,
      login,
      loginWithToken,
      logout,
      switchRole,
    }),
    [isAuthenticated, role, token, user],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
