import React, { createContext, useContext, useState, ReactNode } from "react";
import { User, UserRole } from "@/types/roles";

interface AuthContextType {
  user: User | null;
  setRole: (role: UserRole) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for demo purposes
const createMockUser = (role: UserRole): User => ({
  id: "user-001",
  name: "John Kollie",
  email: "john.kollie@fia.gov.lr",
  role,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(createMockUser("compliance_officer"));

  const setRole = (role: UserRole) => {
    setUser(createMockUser(role));
  };

  return (
    <AuthContext.Provider value={{ user, setRole, isAuthenticated: !!user }}>
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
