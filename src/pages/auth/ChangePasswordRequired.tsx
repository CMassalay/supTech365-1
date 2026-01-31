import { PasswordChangeModal } from "@/components/auth/PasswordChangeModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function ChangePasswordRequired() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  const handleSuccess = () => {
    // Redirect to role-based landing page
    const roleRoutes: Record<string, string> = {
      reporting_entity: "/reporting-entity/submissions",
      compliance_officer: "/compliance/validation/assigned",
      head_of_compliance: "/compliance/dashboards",
      analyst: "/analysis/queue/assigned",
      head_of_analysis: "/analysis/dashboards",
      director_ops: "/audit/dashboards/director-ops",
      oic: "/audit/dashboards/oic",
      tech_admin: "/admin/users",
    };
    navigate(roleRoutes[user?.role || ""] || "/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <PasswordChangeModal open={true} onSuccess={handleSuccess} />
    </div>
  );
}
