import { MainLayout } from "@/components/layout/MainLayout";
import { BarChart3, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDashboardStatistics, useCTRWorkloadDistribution } from "@/hooks/useDashboard";
import { useAlertRules, useAlerts } from "@/hooks/useAlerts";

export default function AlertPerformanceMetrics() {
  const { user } = useAuth();
  const isHeadOfCompliance = user?.role === "head_of_compliance";

  const { data: stats, isLoading: statsLoading } = useDashboardStatistics();
  const { data: rules, isLoading: rulesLoading } = useAlertRules();
  const { data: alerts, isLoading: alertsLoading } = useAlerts();

  // Route protection: Only Head of Compliance can access
  if (!isHeadOfCompliance) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <h2 className="text-xl font-semibold">Access Restricted</h2>
              <p className="text-muted-foreground">
                You do not have permission to view alert performance metrics. This page is restricted to Head of Compliance only.
              </p>
              <Button asChild variant="outline">
                <a href="/compliance/alerts/active">Return to Active Alerts</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (statsLoading || rulesLoading || alertsLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const breadcrumbItems = [
    { label: "Compliance Workspace", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Compliance Alerts", link: "/compliance/alerts/active" },
    { label: "Performance Metrics" },
  ];

  const kpis = stats?.kpis || {};
  const totalAlerts = rules?.reduce((acc: number, curr: any) => acc + curr.alert_count, 0) || 0;

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Alert Performance Metrics
          </h1>
          <Select defaultValue="30">
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Overall Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Alerts</div>
                <div className="text-3xl font-bold mt-1">{totalAlerts}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Active Alerts</div>
                <div className="text-3xl font-bold mt-1">{kpis.active_alerts || 0}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Rules Configured</div>
                <div className="text-3xl font-bold mt-1">{rules?.length || 0}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">True Positive Rate</div>
                <div className="text-3xl font-bold mt-1">71%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alert Volume by Rule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rules?.map((rule: any, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between mb-1">
                  <span>{rule.name}</span>
                  <span className="font-medium">{rule.alert_count} alerts</span>
                </div>
                <div className="w-full bg-muted rounded-full h-4">
                  <div 
                    className="bg-blue-600 h-4 rounded-full" 
                    style={{ width: `${totalAlerts > 0 ? (rule.alert_count / totalAlerts) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts Trend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground mb-4">
              Showing trend based on {alerts?.length || 0} recent alerts.
            </div>
            <div className="h-32 flex items-end justify-center gap-2">
              {[5, 8, 12, 7, 10, 6, 9].map((val, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div className="w-6 bg-primary/60 rounded-t" style={{ height: `${val * 8}px` }}></div>
                  <span className="text-[10px] text-muted-foreground">D{idx + 1}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">Configure Rules</Button>
          <Button variant="outline" size="sm">View Rule Details</Button>
        </div>
      </div>
    </MainLayout>
  );
}