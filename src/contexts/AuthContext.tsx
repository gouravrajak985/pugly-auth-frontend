import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
}

interface AuthContextType {
  auth: AuthState;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(() => {
    const token = localStorage.getItem("authToken");
    return { isAuthenticated: !!token, token };
  });

  useEffect(() => {
    if (auth.isAuthenticated && auth.token) {
      localStorage.setItem("authToken", auth.token);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [auth]);

  const login = (token: string) => {
    setAuth({ isAuthenticated: true, token });
  };

  const logout = () => {
    setAuth({ isAuthenticated: false, token: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
