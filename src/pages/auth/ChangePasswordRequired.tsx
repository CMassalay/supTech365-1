import { PasswordChangeModal } from "@/components/auth/PasswordChangeModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const ROLE_DEFAULT_ROUTES: Record<string, string> = {
  reporting_entity: "/submissions",
  compliance_officer: "/compliance/validation",
  head_of_compliance: "/compliance/dashboards/processing",
  analyst: "/analysis-queue",
  head_of_analysis: "/analysis-queue",
  director_ops: "/",
  oic: "/",
  tech_admin: "/",
  super_admin: "/",
};

export default function ChangePasswordRequired() {
  const navigate = useNavigate();
  const { user, isAuthenticated, clearPasswordChangeRequired } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  const handleSuccess = () => {
    clearPasswordChangeRequired();
    const route = user ? ROLE_DEFAULT_ROUTES[user.role] ?? "/" : "/";
    navigate(route, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <PasswordChangeModal open={true} onSuccess={handleSuccess} />
    </div>
  );
}
