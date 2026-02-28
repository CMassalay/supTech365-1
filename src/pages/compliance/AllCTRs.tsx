import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FileText, RefreshCw, TrendingUp, Loader2 } from "lucide-react";
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
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useAllReviewReports } from "@/hooks/useReviewQueue";
import { differenceInDays } from "date-fns";

export default function AllCTRs() {
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const getReviewStatusFromTab = (t: string) => {
    switch (t) {
      case "pending": return "NOT_REVIEWED";
      case "flagged": return "REVIEW_IN_PROGRESS";
      case "escalated": return "ESCALATED";
      case "archived": return "ARCHIVED";
      case "monitoring": return "MONITORED";
      default: return undefined;
    }
  };

  const { data, isLoading, error, refetch } = useAllReviewReports(page, pageSize, { 
    report_type: "CTR",
    review_status: getReviewStatusFromTab(tab)
  });

  const breadcrumbItems = [
    { label: "Compliance Workspace", icon: <FileText className="h-5 w-5" /> },
    { label: "CTR Review Queue", link: "/compliance/ctr-review" },
    { label: "All CTRs" },
  ];

  if (error) {
    return (
      <MainLayout>
        <div className="p-6">
          <Card className="border-destructive">
            <CardContent className="p-6 text-center">
              <p className="text-destructive font-medium">Failed to load reports</p>
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
              <FileText className="h-6 w-6 text-primary" />
              All CTRs ({data?.total || 0} total)
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={(v) => { setTab(v); setPage(1); }}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending Review</TabsTrigger>
            <TabsTrigger value="flagged">Flagged</TabsTrigger>
            <TabsTrigger value="escalated">Escalated</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
            <TabsTrigger value="monitoring">Under Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="space-y-6">
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
                  <SelectValue placeholder="Entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="ghost" size="sm">
                Clear
              </Button>
            </div>

            {/* CTR Table */}
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="mt-4 text-muted-foreground">Loading reports...</p>
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
                        <TableHead>Status</TableHead>
                        <TableHead>Age</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.items.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No reports found.
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
                            <TableCell>{ctr.assigned_to_name || "-"}</TableCell>
                            <TableCell>
                              <StatusBadge status={ctr.review_status.toLowerCase()} />
                            </TableCell>
                            <TableCell>{differenceInDays(new Date(), new Date(ctr.submitted_at))}d</TableCell>
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
          </TabsContent>
        </Tabs>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing 1-25 of 150 items
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
                    <PaginationLink href="#">...</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">6</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </TabsContent>
        </Tabs>

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
              <div className="text-sm text-muted-foreground">Flagged</div>
              <div className="text-2xl font-semibold mt-1">8</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Escalated</div>
              <div className="text-2xl font-semibold mt-1">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Archived</div>
              <div className="text-2xl font-semibold mt-1">95</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-4 flex gap-2">
            <Button variant="outline" size="sm">
              Bulk Assign
            </Button>
            <Button variant="outline" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Link to="/compliance/escalation/pending">
              <Button variant="outline" size="sm">
                View Escalation Queue
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}