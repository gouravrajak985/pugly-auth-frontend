import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  sourceDomain: string | null;
  role: string | null;
  redirectUrl: string | null;
  state: string | null;
}

interface AuthContextType {
  auth: AuthState;
  login: (token: string) => void;
  logout: () => void;
  setSourceDomain: (domain: string | null) => void;
  setRedirectInfo: (redirectUrl: string | null, state: string | null) => void;
  getRoleFromDomain: (domain: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Domain to role mapping function
const getRoleFromDomain = (domain: string): string => {
  if (!domain) return "user";
  
  const domainLower = domain.toLowerCase();
  
  // Map specific domains to roles
  if (domainLower.includes("admin")) {
    return "admin";
  }
  
  // Add more domain-to-role mappings as needed
  // Example: if (domainLower.includes("manager")) return "manager";
  
  // Default role for other domains
  return "user";
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(() => {
    const token = localStorage.getItem("authToken");
    const sourceDomain = sessionStorage.getItem("sourceDomain");
    const redirectUrl = sessionStorage.getItem("redirectUrl");
    const state = sessionStorage.getItem("state");
    const role = sourceDomain ? getRoleFromDomain(sourceDomain) : null;
    
    return { 
      isAuthenticated: !!token, 
      token,
      sourceDomain: sourceDomain || null,
      role: role || null,
      redirectUrl: redirectUrl || null,
      state: state || null
    };
  });

  useEffect(() => {
    if (auth.isAuthenticated && auth.token) {
      localStorage.setItem("authToken", auth.token);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [auth.isAuthenticated, auth.token]);

  useEffect(() => {
    if (auth.sourceDomain) {
      sessionStorage.setItem("sourceDomain", auth.sourceDomain);
      const role = getRoleFromDomain(auth.sourceDomain);
      setAuth(prev => ({ ...prev, role }));
    } else {
      sessionStorage.removeItem("sourceDomain");
    }
  }, [auth.sourceDomain]);

  useEffect(() => {
    if (auth.redirectUrl) {
      sessionStorage.setItem("redirectUrl", auth.redirectUrl);
    } else {
      sessionStorage.removeItem("redirectUrl");
    }
  }, [auth.redirectUrl]);

  useEffect(() => {
    if (auth.state) {
      sessionStorage.setItem("state", auth.state);
    } else {
      sessionStorage.removeItem("state");
    }
  }, [auth.state]);

  const login = (token: string) => {
    setAuth(prev => ({ ...prev, isAuthenticated: true, token }));
  };

  const logout = () => {
    setAuth({ 
      isAuthenticated: false, 
      token: null, 
      sourceDomain: null, 
      role: null,
      redirectUrl: null,
      state: null
    });
    sessionStorage.removeItem("sourceDomain");
    sessionStorage.removeItem("redirectUrl");
    sessionStorage.removeItem("state");
  };

  const setSourceDomain = (domain: string | null) => {
    if (domain) {
      const role = getRoleFromDomain(domain);
      setAuth(prev => ({ ...prev, sourceDomain: domain, role }));
    } else {
      setAuth(prev => ({ ...prev, sourceDomain: null, role: null }));
    }
  };

  const setRedirectInfo = (redirectUrl: string | null, state: string | null) => {
    setAuth(prev => ({ ...prev, redirectUrl, state }));
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, setSourceDomain, setRedirectInfo, getRoleFromDomain }}>
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
