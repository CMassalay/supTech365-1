import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserRole, mapBackendRole } from "@/types/roles";
import { authApi, ApiError, setStoredToken, getStoredToken, clearStoredToken } from "@/lib/api";

interface Session {
  sessionId: string;
  expiresAt?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  setRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  login: (userData: any, accessToken: string, sessionId: string, rememberMe: boolean, passwordChangeRequired: boolean) => void;
  logout: () => Promise<void>;
  extendSession: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearPasswordChangeRequired: () => void;
  requiresPasswordChange: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function convertToUser(userData: {
  id: string;
  username: string;
  email: string;
  role: string;
  entity_id?: string | null;
  entity_name?: string | null;
}): User {
  return {
    id: userData.id,
    name: userData.username,
    email: userData.email,
    role: mapBackendRole(userData.role),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkAuth = async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      setRequiresPasswordChange(false);
      setIsChecking(false);
      return;
    }
    try {
      const profile = await authApi.getProfile();
      setUser(convertToUser(profile as any));
      setSession({ sessionId: (profile as any).id ?? "" });
      setIsAuthenticated(true);
      setRequiresPasswordChange(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearStoredToken();
      }
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      setRequiresPasswordChange(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (
    userData: any,
    accessToken: string,
    sessionId: string,
    rememberMe: boolean,
    passwordChangeRequired: boolean
  ) => {
    setStoredToken(accessToken, rememberMe);
    setUser(convertToUser(userData));
    setSession({ sessionId });
    setIsAuthenticated(true);
    setRequiresPasswordChange(passwordChangeRequired);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      clearStoredToken();
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      setRequiresPasswordChange(false);
    }
  };

  const extendSession = async () => {
    const data = await authApi.extendSession();
    const rememberMe = typeof localStorage !== "undefined" && localStorage.getItem("suptech_remember_me") === "true";
    setStoredToken(data.access_token, rememberMe);
    setUser(convertToUser(data.user));
    setSession({ sessionId: data.session_id });
    setRequiresPasswordChange(data.password_change_required);
  };

  const setRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  const clearPasswordChangeRequired = () => {
    setRequiresPasswordChange(false);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        setRole,
        isAuthenticated,
        login,
        logout,
        extendSession,
        checkAuth,
        clearPasswordChangeRequired,
        requiresPasswordChange,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
