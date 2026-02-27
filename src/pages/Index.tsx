import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, CheckCircle, AlertTriangle, Clock, TrendingUp, Users, FolderOpen, ShieldCheck, Timer, ListChecks } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { KPICard } from "@/components/ui/KPICard";
import { RecentReportsTable } from "@/components/dashboard/RecentReportsTable";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { RoleSwitcher } from "@/components/dashboard/RoleSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS } from "@/types/roles";
import { useAuditLogs, useValidationQueue } from "@/hooks/useManualValidation";
import { Button } from "@/components/ui/button";
import type { QueueItem } from "@/types/manualValidation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isComplianceOfficer = user?.role === "compliance_officer";
  const { data: assignedQueue } = useValidationQueue(
    { assignedToMe: true, reportType: "CTR" },
    1,
    100
  );
  const { data: auditLogs } = useAuditLogs({}, 1, 100);

  const breadcrumbItems = [
    { label: "Dashboard", icon: <FileText className="h-4 w-4" /> },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getDueDate = (item: QueueItem) => {
    if (item.due_at) {
      return new Date(item.due_at);
    }
    const baseDate = new Date(item.entered_queue_at || item.submitted_at);
    return new Date(baseDate.getTime() + 48 * 60 * 60 * 1000);
  };

  const queueStats = useMemo(() => {
    const now = Date.now();
    const items = assignedQueue?.items ?? [];
    let nearingOverdue = 0;
    let overdue = 0;
    for (const item of items) {
      const dueAt = getDueDate(item).getTime();
      const remainingHours = (dueAt - now) / (1000 * 60 * 60);
      if (remainingHours < 0) {
        overdue += 1;
      } else if (remainingHours <= 24) {
        nearingOverdue += 1;
      }
    }
    return {
      assigned: items.length,
      nearingOverdue,
      overdue,
    };
  }, [assignedQueue?.items]);

  const auditStats = useMemo(() => {
    const items = auditLogs?.items ?? [];
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayTimestamp = startOfToday.getTime();
    const accepted = items.filter((item) => item.decision === "ACCEPT").length;
    const returned = items.filter((item) => item.decision === "RETURN").length;
    const rejected = items.filter((item) => item.decision === "REJECT").length;
    const validatedToday = items.filter((item) => {
      const decidedAt = new Date(item.decided_at).getTime();
      return !Number.isNaN(decidedAt) && decidedAt >= todayTimestamp;
    }).length;
    return {
      accepted,
      returned,
      rejected,
      validatedToday,
      total: items.length,
    };
  }, [auditLogs?.items]);

  const weeklyProductivity = useMemo(() => {
    const items = auditLogs?.items ?? [];
    const points: { day: string; count: number }[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const start = d.getTime();
      const end = start + 24 * 60 * 60 * 1000;
      const count = items.filter((item) => {
        const ts = new Date(item.decided_at).getTime();
        return !Number.isNaN(ts) && ts >= start && ts < end;
      }).length;
      points.push({
        day: d.toLocaleDateString(undefined, { weekday: "short" }),
        count,
      });
    }
    return points;
  }, [auditLogs?.items]);

  const maxWeeklyCount = Math.max(1, ...weeklyProductivity.map((p) => p.count));

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
        {isComplianceOfficer ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Assigned to Me"
              value={queueStats.assigned}
              subtitle="CTR validations"
              icon={<ListChecks className="h-6 w-6" />}
            />
            <KPICard
              title="Validated Today"
              value={auditStats.validatedToday}
              subtitle="manual decisions"
              icon={<ShieldCheck className="h-6 w-6" />}
            />
            <KPICard
              title="Nearing Overdue"
              value={queueStats.nearingOverdue}
              subtitle="due in 24 hours"
              icon={<Timer className="h-6 w-6" />}
            />
            <KPICard
              title="Overdue"
              value={queueStats.overdue}
              subtitle="needs immediate action"
              icon={<AlertTriangle className="h-6 w-6" />}
            />
          </div>
        ) : (
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
        )}

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

        {isComplianceOfficer && (
          <>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate("/compliance/validation-queue")}>Go to My Assigned Validations</Button>
              <Button variant="outline" onClick={() => navigate("/compliance/validation-audit-logs")}>
                View Validation Audit Logs
              </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Decision Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Accepted", count: auditStats.accepted, colorClass: "bg-primary" },
                    { label: "Returned", count: auditStats.returned, colorClass: "bg-amber-500" },
                    { label: "Rejected", count: auditStats.rejected, colorClass: "bg-destructive" },
                  ].map((item) => {
                    const percentage =
                      auditStats.total > 0 ? Math.round((item.count / auditStats.total) * 100) : 0;
                    return (
                      <div key={item.label} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{item.label}</span>
                          <span className="text-muted-foreground">{item.count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 w-full rounded bg-muted">
                          <div
                            className={`h-2 rounded ${item.colorClass}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Productivity (7 days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-40 flex items-end justify-between gap-2">
                    {weeklyProductivity.map((point) => (
                      <div key={point.day} className="flex flex-col items-center gap-2 flex-1">
                        <div
                          className="w-full max-w-10 rounded-t bg-primary/80"
                          style={{ height: `${Math.max(8, (point.count / maxWeeklyCount) * 120)}px` }}
                        />
                        <div className="text-xs text-muted-foreground">{point.day}</div>
                        <div className="text-xs font-medium">{point.count}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
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
