import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string | string[];
  requirePasswordChange?: boolean;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requirePasswordChange = false,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, checkAuth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Check authentication status on mount
    if (!isAuthenticated) {
      checkAuth();
    }
  }, [isAuthenticated, checkAuth]);

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated || !user) {
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // If password change is required, redirect to password change page
  if (requirePasswordChange && user.requiresPasswordChange) {
    return <Navigate to="/change-password-required" replace />;
  }

  // Check role-based access
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
