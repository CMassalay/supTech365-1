import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FileCheck, RefreshCw, UserPlus, Users, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportTypeBadge, StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useValidationQueue } from "@/hooks/useManualValidation";
import { differenceInDays } from "date-fns";

export default function AllValidations() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [reportType, setReportType] = useState<string | undefined>(undefined);
  const [validationStatus, setValidationStatus] = useState<string | undefined>(undefined);

  const { data, isLoading, error, refetch } = useValidationQueue({
    reportType: reportType as any,
    validationStatus: validationStatus as any,
  }, page, pageSize);

  const breadcrumbItems = [
    { label: "Compliance Workspace", icon: <FileCheck className="h-5 w-5" /> },
    { label: "Validation Queue", link: "/validation" },
    { label: "All Validations" },
  ];

  if (error) {
    return (
      <MainLayout>
        <div className="p-6">
          <Card className="border-destructive">
            <CardContent className="p-6 text-center">
              <p className="text-destructive font-medium">Failed to load validations</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <FileCheck className="h-6 w-6 text-primary" />
              All Validations ({data?.total || 0} total)
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <Select value={validationStatus || "all"} onValueChange={(v) => { setValidationStatus(v === "all" ? undefined : v); setPage(1); }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_REVIEW">In Review</SelectItem>
              <SelectItem value="RETURNED">Returned</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Assigned To" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Officers</SelectItem>
            </SelectContent>
          </Select>

          <Select value={reportType || "all"} onValueChange={(v) => { setReportType(v === "all" ? undefined : v); setPage(1); }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="CTR">CTR</SelectItem>
              <SelectItem value="STR">STR</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="ghost" size="sm" onClick={() => { setReportType(undefined); setValidationStatus(undefined); setPage(1); }}>
            Clear
          </Button>
        </div>

        {/* Validation Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground">Loading validations...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="data-table-header">
                    <TableHead>Ref #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Trans</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No validations found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.items.map((validation) => (
                      <TableRow key={validation.submission_id} className="data-table-row">
                        <TableCell className="font-mono font-medium text-primary">
                          {validation.reference_number}
                        </TableCell>
                        <TableCell>
                          <ReportTypeBadge type={validation.report_type as any} />
                        </TableCell>
                        <TableCell>{validation.entity_name}</TableCell>
                        <TableCell>{validation.transaction_count}</TableCell>
                        <TableCell>
                          {validation.assigned_to_name || (
                            <Badge variant="outline" className="text-orange-600">
                              Unassigned
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={validation.validation_status.toLowerCase() as any} />
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1">
                            {differenceInDays(new Date(), new Date(validation.submitted_at))}d
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/compliance/manual-validation/${validation.submission_id}`}>
                            <Button size="sm">View</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {data && data.total_pages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: data.total_pages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink 
                    onClick={() => setPage(p)}
                    isActive={page === p}
                    className="cursor-pointer"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                  className={page === data.total_pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing 1-25 of 170 items
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
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">...</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">7</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Pending</div>
              <div className="text-2xl font-semibold mt-1">25</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Unassigned</div>
              <div className="text-2xl font-semibold mt-1">3</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Overdue</div>
              <div className="text-2xl font-semibold mt-1 text-destructive">1</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Avg Time</div>
              <div className="text-2xl font-semibold mt-1">2.1d</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-4 flex gap-2">
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Assign Unassigned
            </Button>
            <Button variant="outline" size="sm">
              Bulk Reassign
            </Button>
            <Button variant="outline" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}