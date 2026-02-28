import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FileCheck, RefreshCw, Search, AlertTriangle, Loader2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportTypeBadge } from "@/components/ui/StatusBadge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useValidationQueue } from "@/hooks/useManualValidation";
import { differenceInDays } from "date-fns";

export default function ValidationQueue() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [statusFilter, setStatusFilter] = useState<string | undefined>("PENDING");
  const [reportTypeFilter, setReportTypeFilter] = useState<string | undefined>(undefined);

  const { data, isLoading, error, refetch } = useValidationQueue({
    validationStatus: statusFilter as any,
    reportType: reportTypeFilter as any
  }, page, pageSize);

  const breadcrumbItems = [
    { label: "Compliance Workspace", icon: <FileCheck className="h-5 w-5" /> },
    { label: "Validation Queue" },
  ];

  if (error) {
    return (
      <MainLayout>
        <div className="p-6">
          <Card className="border-destructive">
            <CardContent className="p-6 text-center">
              <p className="text-destructive font-medium">Failed to load validation queue</p>
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
              My Assigned Validations ({data?.total || 0} pending)
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <Select value={statusFilter || "all"} onValueChange={(v) => { setStatusFilter(v === "all" ? undefined : v); setPage(1); }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_REVIEW">In Progress</SelectItem>
            </SelectContent>
          </Select>

          <Select value={reportTypeFilter || "all"} onValueChange={(v) => { setReportTypeFilter(v === "all" ? undefined : v); setPage(1); }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="CTR">CTR</SelectItem>
              <SelectItem value="STR">STR</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="ghost" size="sm" onClick={() => { setStatusFilter("PENDING"); setReportTypeFilter(undefined); setPage(1); }}>
            Clear
          </Button>
        </div>

        {/* Validation Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground">Loading queue...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="data-table-header">
                    <TableHead>Ref #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Trans</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No validations found in your queue.
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
                        <TableCell className="text-muted-foreground">{validation.submitted_at}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1">
                            {differenceInDays(new Date(), new Date(validation.submitted_at))}d
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/compliance/manual-validation/${validation.submission_id}`}>
                            <Button size="sm">Validate</Button>
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
            Showing 1-10 of 12 items
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
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Pending</div>
              <div className="text-2xl font-semibold mt-1">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Today</div>
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
              <div className="text-2xl font-semibold mt-1">2d</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
