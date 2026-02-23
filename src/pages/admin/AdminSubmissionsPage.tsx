import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FileText, Download, Loader2, AlertCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge, ReportTypeBadge } from "@/components/ui/StatusBadge";
import type { WorkflowStatus } from "@/components/ui/StatusBadge";
import { getAdminRecentSubmissions, getAdminSubmissionsCsv, ApiError } from "@/lib/api";
import type { SubmissionListItem } from "@/lib/api";
import { toast } from "sonner";

const LIMIT_OPTIONS = [10, 25, 50] as const;

function formatSubmittedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return iso.slice(0, 19).replace("T", " ");
  }
}

function submissionMethodLabel(method?: string): string {
  if (!method) return "—";
  if (method === "excel") return "Excel Upload";
  if (method === "api") return "API";
  return method;
}

export default function AdminSubmissionsPage() {
  const navigate = useNavigate();
  const [limit, setLimit] = useState<number>(10);
  const [data, setData] = useState<{ submissions: SubmissionListItem[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminRecentSubmissions(limit);
      setData({
        submissions: res.submissions ?? [],
        total: res.total ?? 0,
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to load submissions.";
      setError(message);
      toast.error(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      await getAdminSubmissionsCsv(limit);
      toast.success("CSV export started. Check your downloads.");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Export failed.";
      toast.error(message);
    } finally {
      setExporting(false);
    }
  };

  const breadcrumbItems = [
    { label: "Administration", href: "/" },
    { label: "Entity submissions" },
  ];

  const submissions = data?.submissions ?? [];
  const total = data?.total ?? 0;

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Entity submissions
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={String(limit)}
              onValueChange={(v) => setLimit(Number(v) as (typeof LIMIT_OPTIONS)[number])}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                {LIMIT_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} recent
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={exporting || loading}
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export CSV
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Recent submissions from all reporting entities. Requires TECH_ADMIN, OIC, or SUPER_ADMIN.
        </p>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
            <Button variant="ghost" size="sm" onClick={() => fetchSubmissions()}>
              Retry
            </Button>
          </div>
        )}

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Report type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current stage</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Entity reference</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading submissions…
                    </div>
                  </TableCell>
                </TableRow>
              ) : submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No submissions found
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((row) => (
                  <TableRow key={row.reference}>
                    <TableCell className="font-mono text-sm">{row.reference}</TableCell>
                    <TableCell>
                      <ReportTypeBadge
                        type={row.report_type === "STR" || row.report_type === "CTR" ? row.report_type : "CTR"}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={(row.status || "submitted") as WorkflowStatus} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {row.current_stage ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatSubmittedAt(row.submitted_at)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {submissionMethodLabel(row.submission_method)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.entity_reference ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/submissions/${row.reference}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        <p className="text-sm text-muted-foreground">
          Showing {loading ? "…" : submissions.length} of {total} (most recent first).
        </p>
      </div>
    </MainLayout>
  );
}
