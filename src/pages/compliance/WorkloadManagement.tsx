import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Users, RefreshCw, TrendingUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useValidationWorkloadDistribution, useCTRWorkloadDistribution, useEscalationMetrics } from "@/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkloadManagement() {
  const breadcrumbItems = [
    { label: "Compliance Workspace", icon: <Users className="h-5 w-5" /> },
    { label: "Workload Management" },
  ];

  const { data: validationWorkload, isLoading: isLoadingValidation } = useValidationWorkloadDistribution();
  const { data: ctrWorkload, isLoading: isLoadingCTR } = useCTRWorkloadDistribution();
  const { data: escalationMetrics, isLoading: isLoadingEscalation } = useEscalationMetrics();

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Team Workload Overview
            </h1>
          </div>
          <Button variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Validation Queue Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Validation Queue Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingValidation ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="data-table-header">
                    <TableHead>Officer</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Overdue</TableHead>
                    <TableHead>Avg Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validationWorkload?.map((workload: any, idx: number) => (
                    <TableRow key={idx} className="data-table-row">
                      <TableCell className="font-medium">{workload.officer}</TableCell>
                      <TableCell>{workload.assigned}</TableCell>
                      <TableCell>{workload.completed}</TableCell>
                      <TableCell>{workload.pending}</TableCell>
                      <TableCell>
                        <span className={workload.overdue > 0 ? "text-destructive font-medium" : ""}>
                          {workload.overdue}
                        </span>
                      </TableCell>
                      <TableCell>{workload.avgTime}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="data-table-row font-semibold bg-muted/50">
                    <TableCell>TOTAL</TableCell>
                    <TableCell>
                      {validationWorkload?.reduce((acc: number, curr: any) => acc + curr.assigned, 0)}
                    </TableCell>
                    <TableCell>
                      {validationWorkload?.reduce((acc: number, curr: any) => acc + curr.completed, 0)}
                    </TableCell>
                    <TableCell>
                      {validationWorkload?.reduce((acc: number, curr: any) => acc + curr.pending, 0)}
                    </TableCell>
                    <TableCell>
                      {validationWorkload?.reduce((acc: number, curr: any) => acc + curr.overdue, 0)}
                    </TableCell>
                    <TableCell>1.8 days</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* CTR Review Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>CTR Review Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingCTR ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="data-table-header">
                    <TableHead>Officer</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead>Reviewed</TableHead>
                    <TableHead>Flagged</TableHead>
                    <TableHead>Archived</TableHead>
                    <TableHead>Avg Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ctrWorkload?.map((workload: any, idx: number) => (
                    <TableRow key={idx} className="data-table-row">
                      <TableCell className="font-medium">{workload.officer}</TableCell>
                      <TableCell>{workload.assigned}</TableCell>
                      <TableCell>{workload.reviewed}</TableCell>
                      <TableCell>{workload.flagged}</TableCell>
                      <TableCell>{workload.archived}</TableCell>
                      <TableCell>{workload.avgTime}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="data-table-row font-semibold bg-muted/50">
                    <TableCell>TOTAL</TableCell>
                    <TableCell>
                      {ctrWorkload?.reduce((acc: number, curr: any) => acc + curr.assigned, 0)}
                    </TableCell>
                    <TableCell>
                      {ctrWorkload?.reduce((acc: number, curr: any) => acc + curr.reviewed, 0)}
                    </TableCell>
                    <TableCell>
                      {ctrWorkload?.reduce((acc: number, curr: any) => acc + curr.flagged, 0)}
                    </TableCell>
                    <TableCell>
                      {ctrWorkload?.reduce((acc: number, curr: any) => acc + curr.archived, 0)}
                    </TableCell>
                    <TableCell>2.2 days</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm">Assign New CTRs</Button>
              <Button variant="outline" size="sm">Reassign Workload</Button>
              <Button variant="outline" size="sm">View Overdue Items</Button>
              <Button variant="outline" size="sm">Auto-Assign (Lowest Workload)</Button>
            </div>
          </CardContent>
        </Card>

        {/* Escalation Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Escalation Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingEscalation ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">This Month:</span> {escalationMetrics?.this_month}
                </p>
                <p>
                  <span className="font-medium">Quality Score:</span> {escalationMetrics?.quality_score}
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  View Escalation Details →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}