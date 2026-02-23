import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FileText, Eye, Download, Search, Upload, Filter, X, Loader2, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { listSubmissions, ApiError } from "@/lib/api";
import type { SubmissionListItem } from "@/lib/api";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge, ReportTypeBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, XCircle, Clock, Circle } from "lucide-react";

/** Display status key used by getStatusLabel/getStatusIcon (API status is normalized to this). */
type DisplayStatus =
  | "submitted"
  | "validated"
  | "under_review"
  | "rejected"
  | "returned"
  | "under_compliance_review"
  | "under_analysis";

/** Normalize API status (e.g. Pending, Under Review, Accepted) to display status key. */
function normalizeApiStatus(apiStatus: string): DisplayStatus {
  const s = apiStatus?.toLowerCase().replace(/\s+/g, "_") || "";
  const map: Record<string, DisplayStatus> = {
    pending: "submitted",
    under_review: "under_review",
    accepted: "validated",
    rejected: "rejected",
    requires_clarification: "returned",
  };
  return (map[s] ?? "submitted") as DisplayStatus;
}

/** Build start_date/end_date (YYYY-MM-DD) from date range filter. */
function getDateRangeParams(range: string): { start_date?: string; end_date?: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const toISO = (d: Date) => d.toISOString().slice(0, 10);
  switch (range) {
    case "today":
      return { start_date: toISO(today), end_date: toISO(today) };
    case "7days": {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      return { start_date: toISO(start), end_date: toISO(today) };
    }
    case "30days": {
      const start = new Date(today);
      start.setDate(start.getDate() - 29);
      return { start_date: toISO(start), end_date: toISO(today) };
    }
    case "thismonth":
      return {
        start_date: toISO(new Date(now.getFullYear(), now.getMonth(), 1)),
        end_date: toISO(today),
      };
    case "lastmonth": {
      const y = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      const m = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      return {
        start_date: toISO(new Date(y, m, 1)),
        end_date: toISO(new Date(y, m + 1, 0)),
      };
    }
    default:
      return {};
  }
}

/** Format submitted_at ISO string to "Jan 20, 2026" and "14:32". */
function formatSubmittedAt(iso: string): { date: string; time: string } {
  try {
    const d = new Date(iso);
    const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
    return { date, time };
  } catch {
    return { date: iso.slice(0, 10), time: "" };
  }
}

/** Table row shape derived from API SubmissionListItem. */
interface SubmissionRow {
  id: string;
  referenceNumber: string;
  reportType: "STR" | "CTR";
  submittedDate: string;
  submittedTime: string;
  status: DisplayStatus;
  currentStage?: string;
}

function mapApiItemToRow(item: SubmissionListItem): SubmissionRow {
  const { date, time } = formatSubmittedAt(item.submitted_at);
  return {
    id: item.reference,
    referenceNumber: item.reference,
    reportType: item.report_type === "STR" || item.report_type === "CTR" ? item.report_type : "STR",
    submittedDate: date,
    submittedTime: time,
    status: normalizeApiStatus(item.status),
    currentStage: item.status,
  };
}


const getStatusIcon = (status: DisplayStatus) => {
  switch (status) {
    case "submitted":
      return <Circle className="h-4 w-4 text-blue-600" />;
    case "validated":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "rejected":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "returned":
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

// Shortened labels for display
const getStatusLabel = (status: DisplayStatus) => {
  switch (status) {
    case "submitted":
      return "Submitted";
    case "validated":
      return "Validated";
    case "rejected":
      return "Rejected";
    case "returned":
      return "Returned";
    case "under_review":
      return "Review";
    case "under_compliance_review":
      return "Compliance";
    case "under_analysis":
      return "Analysis";
    default:
      return status;
  }
};

// Full descriptions for tooltips
const getStatusTooltip = (status: DisplayStatus) => {
  switch (status) {
    case "submitted":
      return "Submitted";
    case "validated":
      return "Validated";
    case "rejected":
      return "Rejected";
    case "returned":
      return "Returned";
    case "under_review":
      return "Under Review";
    case "under_compliance_review":
      return "Under Compliance Review";
    case "under_analysis":
      return "Under Analysis";
    default:
      return status;
  }
};

// Helper to shorten currentStage labels
const shortenStageLabel = (stage?: string) => {
  if (!stage) return "";
  if (stage === "Under Compliance Review") return "Compliance";
  if (stage === "Under Analysis") return "Analysis";
  if (stage === "Awaiting Validation") return "Awaiting";
  if (stage === "Under Review") return "Review";
  return stage;
};

// Get full stage description for tooltip
const getStageTooltip = (stage?: string) => {
  return stage || "";
};

/** Map our filter value to API status param (backend: Pending, Under Review, Accepted, Rejected, Requires Clarification). */
function filterStatusToApi(statusFilter: string): string | undefined {
  if (statusFilter === "all") return undefined;
  const map: Record<string, string> = {
    submitted: "Pending",
    validated: "Accepted",
    rejected: "Rejected",
    returned: "Requires Clarification",
    under_review: "Under Review",
    under_compliance_review: "Under Review",
    under_analysis: "Under Review",
  };
  return map[statusFilter] ?? undefined;
}

export default function MySubmissions() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [listData, setListData] = useState<{
    submissions: SubmissionRow[];
    total: number;
    page: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dateParams = getDateRangeParams(dateRangeFilter);
      const res = await listSubmissions({
        status: filterStatusToApi(statusFilter),
        report_type: typeFilter === "all" ? undefined : typeFilter,
        start_date: dateParams.start_date,
        end_date: dateParams.end_date,
        search: searchQuery.trim() || undefined,
        page: currentPage,
        limit: itemsPerPage,
      });
      const totalPages = res.total_pages ?? (Math.ceil((res.total || 0) / itemsPerPage) || 1);
      setListData({
        submissions: (res.submissions || []).map(mapApiItemToRow),
        total: res.total ?? 0,
        page: res.page ?? currentPage,
        totalPages,
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to load submissions.";
      setError(message);
      toast.error(message);
      setListData(null);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, dateRangeFilter, searchQuery, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const breadcrumbItems = [
    { label: "Reporting Entity Workspace", icon: <FileText className="h-5 w-5" /> },
    { label: "My Submissions" },
  ];

  const paginatedSubmissions = listData?.submissions ?? [];
  const totalPages = listData?.totalPages ?? 0;
  const total = listData?.total ?? 0;
  const startIndex = (currentPage - 1) * itemsPerPage;

  const clearFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setDateRangeFilter("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const hasActiveFilters = statusFilter !== "all" || typeFilter !== "all" || dateRangeFilter !== "all" || searchQuery !== "";

  const setStatusFilterAndResetPage = (v: string) => {
    setStatusFilter(v);
    setCurrentPage(1);
  };
  const setTypeFilterAndResetPage = (v: string) => {
    setTypeFilter(v);
    setCurrentPage(1);
  };
  const setDateRangeFilterAndResetPage = (v: string) => {
    setDateRangeFilter(v);
    setCurrentPage(1);
  };

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>My Submissions</h1>
          </div>
          <Link to="/submit">
            <Button className="bg-primary hover:bg-primary-dark">
              <Upload className="h-4 w-4 mr-2" />
              Quick Submit
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-wrap gap-2 flex-1">
                <Select value={statusFilter} onValueChange={setStatusFilterAndResetPage}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="validated">Validated</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="returned">Returned for Correction</SelectItem>
                    <SelectItem value="under_review">Review</SelectItem>
                    <SelectItem value="under_compliance_review">Under Compliance Review</SelectItem>
                    <SelectItem value="under_analysis">Under Analysis</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="STR">STR</SelectItem>
                    <SelectItem value="CTR">CTR</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateRangeFilter} onValueChange={setDateRangeFilterAndResetPage}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="thismonth">This Month</SelectItem>
                    <SelectItem value="lastmonth">Last Month</SelectItem>
                    <SelectItem value="custom">Custom Range...</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by reference number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Info and Actions */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {loading ? "..." : `${startIndex + 1}-${startIndex + paginatedSubmissions.length} of ${total}`} submissions
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
            <Button variant="ghost" size="sm" onClick={() => fetchSubmissions()}>
              Retry
            </Button>
          </div>
        )}

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading submissions...
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No submissions found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.referenceNumber}</TableCell>
                    <TableCell>
                      <ReportTypeBadge type={submission.reportType} />
                    </TableCell>
                    <TableCell>
                      {submission.submittedDate} {submission.submittedTime}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(submission.status)}
                        <div>
                          {getStatusTooltip(submission.status) !== getStatusLabel(submission.status) ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="font-medium cursor-help">
                                    {getStatusLabel(submission.status)}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{getStatusTooltip(submission.status)}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <div className="font-medium">
                              {getStatusLabel(submission.status)}
                            </div>
                          )}
                          {submission.currentStage && (
                            getStageTooltip(submission.currentStage) !== shortenStageLabel(submission.currentStage) ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="text-xs text-muted-foreground cursor-help">
                                      {shortenStageLabel(submission.currentStage)}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{getStageTooltip(submission.currentStage)}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <div className="text-xs text-muted-foreground">
                                {shortenStageLabel(submission.currentStage)}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {submission.status === "returned" && (
                          <Link to={`/resubmissions`}>
                            <Button variant="outline" size="sm">
                              Resubmit
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/submissions/${submission.referenceNumber}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(page);
                    }}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </MainLayout>
  );
}