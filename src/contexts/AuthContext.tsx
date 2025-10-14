'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { clearStoredToken, getStoredToken, setStoredToken } from "@/utils/token";
interface AuthContextType {
  token: string | null;
  login: (jwt: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 初期値はLocalStorageから読み込む
  const [token, setToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // 初期ロード時にトークンを復元
  useEffect(() => {
    setToken(getStoredToken());
    setIsInitializing(false);
  }, []);

  const handleLogin = (jwt: string) => {
    setStoredToken(jwt);
    setToken(jwt);
  };

  const handleLogout = () => {
    clearStoredToken();
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ 
        token, 
        login: handleLogin, 
        logout: handleLogout, 
        isAuthenticated: !!token,
        isInitializing,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
