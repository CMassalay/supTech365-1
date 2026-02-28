import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { BarChart3, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboardStatistics, useValidationWorkloadDistribution } from "@/hooks/useDashboard";

export default function ValidationQualityMetrics() {
  const { data: stats, isLoading: statsLoading } = useDashboardStatistics();
  const { data: validationWorkload, isLoading: workloadLoading } = useValidationWorkloadDistribution();

  const breadcrumbItems = [
    { label: "Compliance Workspace", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Dashboards", link: "/compliance/dashboards/processing" },
    { label: "Validation Quality Metrics" },
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
  const totalAssigned = validationWorkload?.reduce((acc: number, curr: any) => acc + curr.assigned, 0) || 0;
  const totalCompleted = validationWorkload?.reduce((acc: number, curr: any) => acc + curr.completed, 0) || 0;
  const totalOverdue = validationWorkload?.reduce((acc: number, curr: any) => acc + curr.overdue, 0) || 0;
  const passRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Validation Quality Metrics
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
            <CardTitle>Validation Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Processed</div>
                <div className="text-3xl font-bold mt-1">{totalAssigned}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Validated</div>
                <div className="text-3xl font-bold mt-1">{totalCompleted} ({passRate}%)</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Pending</div>
                <div className="text-3xl font-bold mt-1">{totalAssigned - totalCompleted}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Overdue</div>
                <div className="text-3xl font-bold mt-1 text-destructive">{totalOverdue}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Validation Timeline Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Manual Validation:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Average Processing Time:</span>
                  <span className="flex items-center gap-1">
                    {kpis.avg_processing_time || "0d"}
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Validation Pass Rate:</span>
                  <span>{passRate}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Officer Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="data-table-header">
                  <TableHead>Officer</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Avg Time</TableHead>
                  <TableHead>Overdue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {validationWorkload?.map((item: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{item.officer}</TableCell>
                    <TableCell>{item.assigned}</TableCell>
                    <TableCell>{item.completed}</TableCell>
                    <TableCell>{item.avgTime}</TableCell>
                    <TableCell>
                      <span className={item.overdue > 0 ? "text-destructive font-medium" : ""}>
                        {item.overdue}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">View Validation Details</Button>
        </div>
      </div>
    </MainLayout>
  );
}