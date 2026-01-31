import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserRole } from "@/types/roles";
import { authApi, ApiError } from "@/lib/api";

interface Session {
  expiresAt: string;
  ipAddress: string;
  userAgent: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  setRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  login: (userData: any, sessionData: Session) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  requiresPasswordChange: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert API user data to User type
const convertToUser = (userData: any): User => ({
  id: userData.id,
  name: userData.name || userData.username,
  email: userData.email,
  role: userData.role as UserRole,
  avatar: userData.avatar,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authApi.getMe();
      const userData = convertToUser(response.user);
      setUser(userData);
      setSession(response.session);
      setIsAuthenticated(true);
      setRequiresPasswordChange(response.user.requiresPasswordChange || false);
    } catch (err) {
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      setRequiresPasswordChange(false);
    } finally {
      setIsChecking(false);
    }
  };

  const login = (userData: any, sessionData: Session) => {
    const user = convertToUser(userData);
    setUser(user);
    setSession(sessionData);
    setIsAuthenticated(true);
    setRequiresPasswordChange(userData.requiresPasswordChange || false);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Continue with logout even if API call fails
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      setRequiresPasswordChange(false);
    }
  };

  const setRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  // Show loading state while checking auth
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
        checkAuth,
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
