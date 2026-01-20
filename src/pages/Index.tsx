import { FileText, CheckCircle, AlertTriangle, Clock, TrendingUp, Users, FolderOpen } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { KPICard } from "@/components/ui/KPICard";
import { RecentReportsTable } from "@/components/dashboard/RecentReportsTable";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { RoleSwitcher } from "@/components/dashboard/RoleSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS } from "@/types/roles";

export default function Index() {
  const { user } = useAuth();

  const breadcrumbItems = [
    { label: "Dashboard", icon: <FileText className="h-4 w-4" /> },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-foreground">{getGreeting()}, {user?.name?.split(" ")[0]}</h1>
            <p className="text-muted-foreground mt-1">
              Welcome to your {user?.role ? ROLE_LABELS[user.role] : ""} dashboard
            </p>
          </div>
          <RoleSwitcher />
        </div>

        {/* KPI Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Reports in Queue"
            value="23"
            trend={{ value: 12, direction: "up" }}
            subtitle="vs last week"
            icon={<FileText className="h-6 w-6" />}
          />
          <KPICard
            title="Validated Today"
            value="8"
            trend={{ value: 25, direction: "up" }}
            subtitle="vs yesterday"
            icon={<CheckCircle className="h-6 w-6" />}
          />
          <KPICard
            title="Active Alerts"
            value="5"
            trend={{ value: -15, direction: "down" }}
            subtitle="vs last week"
            icon={<AlertTriangle className="h-6 w-6" />}
          />
          <KPICard
            title="Avg Processing Time"
            value="4.2d"
            trend={{ value: -8, direction: "down" }}
            subtitle="improving"
            icon={<Clock className="h-6 w-6" />}
          />
        </div>

        {/* Second Row - Role-Specific KPIs */}
        {(user?.role === "head_of_compliance" || user?.role === "head_of_analysis" || user?.role === "director_ops" || user?.role === "oic") && (
          <div className="grid gap-4 md:grid-cols-3">
            <KPICard
              title="Team Members Active"
              value="12"
              subtitle="of 15 assigned"
              icon={<Users className="h-6 w-6" />}
            />
            <KPICard
              title="Escalation Rate"
              value="18%"
              trend={{ value: -3, direction: "down" }}
              subtitle="this month"
              icon={<TrendingUp className="h-6 w-6" />}
            />
            <KPICard
              title="Open Cases"
              value="7"
              trend={{ value: 2, direction: "up" }}
              subtitle="new this week"
              icon={<FolderOpen className="h-6 w-6" />}
            />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentReportsTable />
          </div>
          <div>
            <AlertsPanel />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
