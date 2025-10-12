import { createContext, ReactNode, useContext, useEffect, useState } from "react";


interface AuthContextType {
  token: string | null;
  login: (jwt: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'ashiato_jwt';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 初期値はLocalStorageから読み込む
  const [token, setToken] = useState<string | null>(null);

  // 初期ロード時にトークンを復元
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    setToken(storedToken);
  }, []);

  const handleLogin = (jwt: string) => {
    localStorage.setItem(TOKEN_KEY, jwt);
    setToken(jwt);
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ 
        token, 
        login: handleLogin, 
        logout: handleLogout, 
        isAuthenticated: !!token 
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