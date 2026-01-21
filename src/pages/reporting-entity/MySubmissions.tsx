import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FileText, Eye, Download, Search, Upload, Filter, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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
import { CheckCircle2, XCircle, Clock, AlertCircle, Circle } from "lucide-react";

interface Submission {
  id: string;
  referenceNumber: string;
  reportType: "CTR" | "STR";
  submittedDate: string;
  submittedTime: string;
  status: "submitted" | "validated" | "under_review" | "rejected" | "returned" | "under_compliance_review" | "under_analysis";
  currentStage?: string;
  submissionMethod: "excel" | "api";
}

const sampleSubmissions: Submission[] = [
  {
    id: "1",
    referenceNumber: "FIA-2026-0234",
    reportType: "STR",
    submittedDate: "Jan 20, 2026",
    submittedTime: "14:32",
    status: "submitted",
    currentStage: "Awaiting Validation",
    submissionMethod: "excel",
  },
  {
    id: "2",
    referenceNumber: "FIA-2026-0233",
    reportType: "CTR",
    submittedDate: "Jan 20, 2026",
    submittedTime: "09:15",
    status: "validated",
    currentStage: "Under Compliance Review",
    submissionMethod: "api",
  },
  {
    id: "3",
    referenceNumber: "FIA-2026-0232",
    reportType: "STR",
    submittedDate: "Jan 19, 2026",
    submittedTime: "16:45",
    status: "validated",
    currentStage: "Under Analysis",
    submissionMethod: "excel",
  },
  {
    id: "4",
    referenceNumber: "FIA-2026-0231",
    reportType: "CTR",
    submittedDate: "Jan 19, 2026",
    submittedTime: "11:20",
    status: "returned",
    currentStage: "Correction Required",
    submissionMethod: "excel",
  },
  {
    id: "5",
    referenceNumber: "FIA-2026-0230",
    reportType: "STR",
    submittedDate: "Jan 18, 2026",
    submittedTime: "14:10",
    status: "rejected",
    currentStage: "See details for reason",
    submissionMethod: "excel",
  },
];

const getStatusIcon = (status: Submission["status"]) => {
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
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

const getStatusLabel = (status: Submission["status"]) => {
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

export default function MySubmissions() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const breadcrumbItems = [
    { label: "Reporting Entity Workspace", icon: <FileText className="h-5 w-5" /> },
    { label: "My Submissions" },
  ];

  const filteredSubmissions = sampleSubmissions.filter((submission) => {
    if (statusFilter !== "all" && submission.status !== statusFilter) return false;
    if (typeFilter !== "all" && submission.reportType !== typeFilter) return false;
    if (searchQuery && !submission.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubmissions = filteredSubmissions.slice(startIndex, startIndex + itemsPerPage);

  const clearFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setDateRangeFilter("all");
    setSearchQuery("");
  };

  const hasActiveFilters = statusFilter !== "all" || typeFilter !== "all" || dateRangeFilter !== "all" || searchQuery !== "";

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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                    <SelectItem value="under_review">Under Review</SelectItem>
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

                <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
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
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSubmissions.length)} of {filteredSubmissions.length} submissions
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

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
              {paginatedSubmissions.length === 0 ? (
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
                          <div className="font-medium">{getStatusLabel(submission.status)}</div>
                          {submission.currentStage && (
                            <div className="text-xs text-muted-foreground">{submission.currentStage}</div>
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
                          onClick={() => navigate(`/submissions/${submission.id}`)}
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