import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { AlertTriangle, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
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
import { useOverdueReports } from "@/hooks/useReviewQueue";
import { differenceInDays } from "date-fns";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function OverdueCTRs() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error, refetch } = useOverdueReports(page, pageSize, { report_type: "CTR" });

  const breadcrumbItems = [
    { label: "Compliance Workspace", icon: <AlertTriangle className="h-5 w-5" /> },
    { label: "CTR Review Queue", link: "/compliance/ctr-review" },
    { label: "Overdue CTRs" },
  ];

  if (error) {
    return (
      <MainLayout>
        <div className="p-6">
          <Card className="border-destructive">
            <CardContent className="p-6 text-center">
              <p className="text-destructive font-medium">Failed to load overdue reports</p>
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
                <AlertTriangle className="h-6 w-6 text-destructive" />
                Overdue CTRs ({data?.total || 0} items)
              </h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Assigned To" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Officers</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="most">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="most">Most Overdue</SelectItem>
              <SelectItem value="least">Least Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="ghost" size="sm">
            Clear
          </Button>
        </div>

        {/* Overdue CTRs Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground">Loading overdue reports...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="data-table-header">
                    <TableHead>Ref #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Trans</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead>Days Overdue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No overdue reports found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.items.map((ctr) => (
                      <TableRow key={ctr.submission_id} className="data-table-row">
                        <TableCell className="font-mono font-medium text-primary">
                          {ctr.reference_number}
                        </TableCell>
                        <TableCell>{ctr.report_type}</TableCell>
                        <TableCell className="font-medium">${ctr.total_amount.toLocaleString()}</TableCell>
                        <TableCell>{ctr.transaction_count}</TableCell>
                        <TableCell>{ctr.assigned_to_name || "Unassigned"}</TableCell>
                        <TableCell className="text-destructive font-semibold">
                          {differenceInDays(new Date(), new Date(ctr.submitted_at))} days
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

        {/* Warning */}
        <Card className="border-destructive">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span className="text-sm font-medium">
              All overdue items require immediate attention.
            </span>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-4 flex gap-2">
            <Button variant="outline" size="sm">
              Escalate to Supervisor
            </Button>
            <Button variant="outline" size="sm">
              Request Extension
            </Button>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}