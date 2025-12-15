import React, { createContext, useContext, useMemo, useState } from 'react';

type Role = 'CUSTOMER' | 'ADMIN';

interface AppContextValue {
  isAuthenticated: boolean;
  role: Role;
  login: (nextRole?: Role) => void;
  logout: () => void;
  switchRole: (nextRole: Role) => void;
}

const defaultValue: AppContextValue = {
  isAuthenticated: false,
  role: 'CUSTOMER',
  login: () => undefined,
  logout: () => undefined,
  switchRole: () => undefined,
};

const AppContext = createContext<AppContextValue>(defaultValue);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState<Role>('CUSTOMER');

  const login = (nextRole: Role = 'CUSTOMER') => {
    setAuthenticated(true);
    setRole(nextRole);
  };

  const logout = () => {
    setAuthenticated(false);
    setRole('CUSTOMER');
  };

  const switchRole = (nextRole: Role) => {
    setRole(nextRole);
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      role,
      login,
      logout,
      switchRole,
    }),
    [isAuthenticated, role],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
