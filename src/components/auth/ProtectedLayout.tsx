import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Layout that protects all child routes: unauthenticated users are redirected to /login.
 * Use this as a parent route so that unauthenticated users see the login page first.
 */
export function ProtectedLayout() {
  const { user, isAuthenticated, requiresPasswordChange } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={`/login?returnUrl=${encodeURIComponent(pathname || "/")}`}
        replace
        state={{ from: location }}
      />
    );
  }

  if (requiresPasswordChange && pathname !== "/change-password-required") {
    return <Navigate to="/change-password-required" replace />;
  }

  return <Outlet />;
}
