import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FileText, RefreshCw, AlertTriangle, Loader2 } from "lucide-react";
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useReviewQueue } from "@/hooks/useReviewQueue";
import { differenceInDays } from "date-fns";

export default function CTRPendingReview() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error, refetch } = useReviewQueue(page, pageSize, { report_type: "CTR" });

  const breadcrumbItems = [
    { label: "Compliance Workspace", icon: <FileText className="h-5 w-5" /> },
    { label: "CTR Review Queue", link: "/compliance/ctr-review" },
    { label: "Pending Review" },
  ];

  if (error) {
    return (
      <MainLayout>
        <div className="p-6">
          <Card className="border-destructive">
            <CardContent className="p-6 text-center">
              <p className="text-destructive font-medium">Failed to load reports pending review</p>
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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Pending Review ({data?.total || 0} CTRs)
          </h1>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Assigned To" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="me">Me</SelectItem>
              <SelectItem value="others">Others</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm">Clear</Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground">Loading pending reviews...</p>
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
                    <TableHead>Age</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No reports pending review found.
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
                        <TableCell>{differenceInDays(new Date(), new Date(ctr.submitted_at))}d</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">🟡 Medium</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/compliance/ctr-review/${ctr.submission_id}/review`}>
                            <Button size="sm">Review</Button>
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

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Assigned to Me</div>
              <div className="text-2xl font-semibold mt-1">8</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">High Priority</div>
              <div className="text-2xl font-semibold mt-1">5</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Overdue</div>
              <div className="text-2xl font-semibold mt-1 text-destructive">1</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}