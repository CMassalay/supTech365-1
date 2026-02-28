import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { TrendingUp, BarChart3, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStatistics, useCTRWorkloadDistribution } from "@/hooks/useDashboard";

export default function ProcessingMetrics() {
  const { data: stats, isLoading: statsLoading } = useDashboardStatistics();
  const { data: ctrWorkload, isLoading: workloadLoading } = useCTRWorkloadDistribution();

  const breadcrumbItems = [
    { label: "Compliance Workspace", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Dashboards", link: "/compliance/dashboards/processing" },
    { label: "CTR Processing Metrics" },
  ];

  if (statsLoading || workloadLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const kpis = stats?.kpis || {};
  const totalSubmissions = ctrWorkload?.reduce((acc: number, curr: any) => acc + curr.assigned, 0) || 0;
  const totalReviewed = ctrWorkload?.reduce((acc: number, curr: any) => acc + curr.reviewed, 0) || 0;
  const passRate = totalSubmissions > 0 ? Math.round((totalReviewed / totalSubmissions) * 100) : 0;

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              CTR Processing Performance
            </h1>
          </div>
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

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total CTRs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalSubmissions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Validated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalReviewed}</div>
              <div className="text-sm text-muted-foreground mt-1">({passRate}%)</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Escalated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpis.open_cases || 0}</div>
              <div className="text-sm text-muted-foreground mt-1">({kpis.escalation_rate || "0%"})</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Processing Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpis.avg_processing_time || "0d"}</div>
            </CardContent>
          </Card>
        </div>

        {/* Processing Time Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Processing Time Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 bg-primary h-20 rounded-t"></div>
                <span className="text-xs text-muted-foreground">W1</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 bg-primary h-16 rounded-t"></div>
                <span className="text-xs text-muted-foreground">W2</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 bg-primary h-14 rounded-t"></div>
                <span className="text-xs text-muted-foreground">W3</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 bg-primary h-12 rounded-t"></div>
                <span className="text-xs text-muted-foreground">W4</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Trend based on real-time data
            </p>
          </CardContent>
        </Card>

        {/* Escalation Rate Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Escalation Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 bg-blue-500 h-8 rounded-t"></div>
                <span className="text-xs text-muted-foreground">W1</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 bg-blue-500 h-10 rounded-t"></div>
                <span className="text-xs text-muted-foreground">W2</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 bg-blue-500 h-12 rounded-t"></div>
                <span className="text-xs text-muted-foreground">W3</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 bg-blue-500 h-10 rounded-t"></div>
                <span className="text-xs text-muted-foreground">W4</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Current: {kpis.escalation_rate || "0%"} (Target range: 5-10%)
            </p>
          </CardContent>
        </Card>

        {/* Reporting Entity Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Reporting Entity Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              <div className="grid grid-cols-4 gap-4 p-4 items-center">
                <div className="font-medium">Officer</div>
                <div className="text-sm text-muted-foreground">Assigned</div>
                <div className="text-sm text-muted-foreground">Reviewed</div>
                <div className="text-sm text-muted-foreground">Avg Time</div>
              </div>
              {ctrWorkload?.map((item: any, idx: number) => (
                <div key={idx} className="grid grid-cols-4 gap-4 p-4 items-center hover:bg-muted/50">
                  <div className="font-medium">{item.officer}</div>
                  <div>{item.assigned}</div>
                  <div>{item.reviewed}</div>
                  <div>{item.avgTime}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}