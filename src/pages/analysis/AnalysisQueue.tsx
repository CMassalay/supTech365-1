import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Search, RefreshCw, AlertTriangle, Inbox } from "lucide-react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  riskLevel?: "high" | "medium" | "low";
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

export default function AnalysisQueue() {
  const { user } = useAuth();
  const role = (user?.role as string | undefined) ?? "";
  const normalizedRole = role.toUpperCase();
  const isSupervisor = normalizedRole === "HEAD_OF_ANALYSIS";
  const [assignmentFilter, setAssignmentFilter] = useState<"all" | "assigned" | "unassigned">("all");
  const [selectedReport, setSelectedReport] = useState<STRReview | null>(null);
  const [assignee, setAssignee] = useState<string>("none");
  const [queueItems, setQueueItems] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const assigneeOptions = ["Alice Johnson", "Bob Smith", "Charlie Brown", "Current Analyst"];

  useEffect(() => {
    let active = true;
    async function loadQueue() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchReviewQueue(1, 100, "STR");
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

  const visibleSTRs = useMemo(() => {
    if (!isSupervisor) {
      return mappedSTRs;
    }
    if (assignmentFilter === "assigned") {
      return mappedSTRs.filter((item) => item.assignedTo && item.assignedTo !== "Unassigned");
    }
    if (assignmentFilter === "unassigned") {
      return mappedSTRs.filter((item) => !item.assignedTo || item.assignedTo === "Unassigned");
    }
    return mappedSTRs;
  }, [assignmentFilter, isSupervisor, mappedSTRs]);

  const breadcrumbItems = [
    { label: "Analysis Workspace", icon: <Inbox className="h-5 w-5" /> },
    { label: isSupervisor ? "STR Management Hub" : "My Assigned STRs", link: "/analysis/queue" },
  ];

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              {isSupervisor ? `STR Management Hub (${visibleSTRs.length} total)` : `My Assigned STRs (${visibleSTRs.length} pending)`}
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

          {isSupervisor && (
            <Select
              value={assignmentFilter}
              onValueChange={(value) => setAssignmentFilter(value as "all" | "assigned" | "unassigned")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Assignment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignments</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>
          )}

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
                  <TableHead>{isSupervisor ? "Assigned To" : "Assigned"}</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleSTRs.map((str) => (
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
                        {isSupervisor && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedReport(str);
                              setAssignee("none");
                            }}
                          >
                            {str.assignedTo && str.assignedTo !== "Unassigned" ? "Reassign" : "Assign"}
                          </Button>
                        )}
                        <Link to={`/analysis/queue/${str.id}/analyze`}>
                          <Button size="sm">Analyze</Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="text-sm text-muted-foreground flex items-center gap-4">
          <span>Legend:</span>
          <span className="flex items-center gap-1">
            <Badge variant="destructive" className="h-4 px-1.5">
              <AlertTriangle className="h-2 w-2" />
            </Badge>
            High Risk Alert
          </span>
          <span className="flex items-center gap-1">
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 h-4 px-1.5">
              M
            </Badge>
            Medium Risk Alert
          </span>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing 1-{visibleSTRs.length} of {visibleSTRs.length} items
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

        {/* Performance Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Assigned</div>
              <div className="text-2xl font-semibold mt-1">
                {visibleSTRs.filter((item) => item.assignedTo && item.assignedTo !== "Unassigned").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Analyzed</div>
              <div className="text-2xl font-semibold mt-1">8</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Cases Opened</div>
              <div className="text-2xl font-semibold mt-1">3</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Avg Analysis</div>
              <div className="text-2xl font-semibold mt-1">2.1d</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={Boolean(selectedReport)} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign STR</DialogTitle>
            <DialogDescription>
              {selectedReport ? `Reference: ${selectedReport.referenceNumber}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Assign to analyst</div>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Select analyst" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select analyst</SelectItem>
                {assigneeOptions.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              Cancel
            </Button>
            <Button
              disabled={assignee === "none"}
              onClick={() => {
                setSelectedReport(null);
              }}
            >
              Confirm Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
