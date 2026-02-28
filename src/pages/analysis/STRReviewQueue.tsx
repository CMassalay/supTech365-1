import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FileText, RefreshCw, AlertTriangle } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { fetchReviewQueue, type ReviewQueueItem } from "@/lib/reviewApi";

interface STRReview {
  id: string;
  referenceNumber: string;
  entityName: string;
  amount: string;
  transactionCount: number;
  subject: string;
  assignedDate: string;
  age: number;
  ageUnit: "d" | "h";
  riskLevel?: "high" | "medium";
  assignedTo?: string;
  status?: string;
}

function formatAmount(value?: number): string {
  return `$${(value || 0).toLocaleString()}`;
}

function formatAge(submittedAt: string): { age: number; ageUnit: "d" | "h" } {
  const submitted = new Date(submittedAt).getTime();
  const now = Date.now();
  const diffHours = Math.max(0, Math.floor((now - submitted) / (1000 * 60 * 60)));
  if (diffHours < 24) return { age: diffHours, ageUnit: "h" };
  return { age: Math.floor(diffHours / 24), ageUnit: "d" };
}

function toStatusLabel(status: string): string {
  return status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function STRReviewQueue() {
  const { user } = useAuth();
  const [queueItems, setQueueItems] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadQueue() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchReviewQueue(1, 100, { report_type: "STR" });
        if (active) setQueueItems(data.items || []);
      } catch (err: any) {
        if (active) setError(err?.message || "Failed to load STR review queue");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadQueue();
    return () => {
      active = false;
    };
  }, []);

  const mappedSTRs = useMemo<STRReview[]>(() => {
    return queueItems.map((item) => {
      const ageData = formatAge(item.submitted_at);
      return {
        id: item.submission_id,
        referenceNumber: item.reference_number,
        entityName: item.entity_id,
        amount: formatAmount(item.total_amount),
        transactionCount: item.transaction_count || 0,
        subject: "-",
        assignedDate: new Date(item.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        age: ageData.age,
        ageUnit: ageData.ageUnit,
        assignedTo: item.assigned_to_name || "Unassigned",
        status: toStatusLabel(item.review_status || "NOT_REVIEWED"),
      };
    });
  }, [queueItems]);

  const breadcrumbItems = [
    { label: "Analysis Workspace", icon: <FileText className="h-5 w-5" /> },
    { label: "My Assigned STRs", link: "/analysis/str-review" },
  ];

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              My Assigned STRs ({mappedSTRs.length} pending)
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {loading && <div className="text-sm text-muted-foreground">Loading STR review queue...</div>}
        {error && <div className="text-sm text-destructive">{error}</div>}

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Review Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="ghost" size="sm">
            Clear
          </Button>
        </div>

        {/* STR Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="data-table-header">
                  <TableHead>Ref #</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Trans</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappedSTRs.map((str) => (
                  <TableRow key={str.id} className="data-table-row">
                    <TableCell className="font-mono font-medium text-primary">
                      {str.referenceNumber}
                    </TableCell>
                    <TableCell>{str.entityName}</TableCell>
                    <TableCell className="font-medium">{str.amount}</TableCell>
                    <TableCell>{str.transactionCount}</TableCell>
                    <TableCell>{str.subject}</TableCell>
                    <TableCell className="text-muted-foreground">{str.assignedTo ?? "Unassigned"}</TableCell>
                    <TableCell>{str.age}{str.ageUnit}</TableCell>
                    <TableCell>
                      {str.riskLevel === "high" && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          High
                        </Badge>
                      )}
                      {str.riskLevel === "medium" && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                          Medium
                        </Badge>
                      )}
                      {!str.riskLevel && <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {str.status ?? "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/analysis/str-review/${str.id}/review`}>
                          <Button size="sm">Review</Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing 1-{mappedSTRs.length} of {mappedSTRs.length} items
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
