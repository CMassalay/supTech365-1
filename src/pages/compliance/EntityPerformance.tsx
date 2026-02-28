import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Building2, TrendingUp } from "lucide-react";
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useEntityPerformance } from "@/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";

interface Entity {
  name: string;
  submissions: number;
  passRate: string;
  returnRate: string;
  escalationRate: string;
}

export default function EntityPerformance() {
  const breadcrumbItems = [
    { label: "Compliance Workspace", icon: <Building2 className="h-5 w-5" /> },
    { label: "Dashboards", link: "/processing-metrics" },
    { label: "Reporting Entity Performance" },
  ];

  const { data: entities, isLoading } = useEntityPerformance();

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Reporting Entity Performance
          </h1>
          <div className="flex items-center gap-3">
            <Select defaultValue="30">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Entities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Submission Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="CTR">CTR</SelectItem>
              <SelectItem value="STR">STR</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm">Clear</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Overall Entity Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="data-table-header">
                    <TableHead>Entity</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Pass Rate</TableHead>
                    <TableHead>Return Rate</TableHead>
                    <TableHead>Escalation Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entities?.map((entity: any, idx: number) => (
                    <TableRow key={idx} className="data-table-row">
                      <TableCell className="font-medium">{entity.name}</TableCell>
                      <TableCell>{entity.submissions}</TableCell>
                      <TableCell>{entity.passRate}</TableCell>
                      <TableCell>{entity.returnRate}</TableCell>
                      <TableCell>{entity.escalationRate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {entities?.length || 0} entities
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </MainLayout>
  );
}
