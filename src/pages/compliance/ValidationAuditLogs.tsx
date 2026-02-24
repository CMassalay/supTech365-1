import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Shield, Eye, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuditLogs } from "@/hooks/useManualValidation";
import { useValidationStore } from "@/hooks/useValidationStore";
import type { AuditLogItem, DecisionType } from "@/types/manualValidation";

export default function ValidationAuditLogs() {
  const { auditLogFilters, setAuditLogFilters, resetAuditLogFilters } = useValidationStore();
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const { data, isLoading } = useAuditLogs(auditLogFilters, page, pageSize);
  const [selectedEntry, setSelectedEntry] = useState<AuditLogItem | null>(null);
  const items = data?.items ?? [];

  const breadcrumbItems = [
    { label: "Compliance", href: "/compliance/validation" },
    { label: "Validation Audit Logs", href: "/compliance/validation-audit-logs" },
  ];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Validation Audit Logs
        </h1>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 mb-4">
              <Select
                value={auditLogFilters.decision ?? "all"}
                onValueChange={(value) => {
                  setPage(1);
                  setAuditLogFilters({ decision: value === "all" ? undefined : (value as DecisionType) });
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Decisions</SelectItem>
                  <SelectItem value="ACCEPT">Accept</SelectItem>
                  <SelectItem value="RETURN">Return</SelectItem>
                  <SelectItem value="REJECT">Reject</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                className="w-[180px]"
                value={auditLogFilters.dateFrom ?? ""}
                onChange={(e) => setAuditLogFilters({ dateFrom: e.target.value || undefined })}
              />
              <Input
                type="date"
                className="w-[180px]"
                value={auditLogFilters.dateTo ?? ""}
                onChange={(e) => setAuditLogFilters({ dateTo: e.target.value || undefined })}
              />
              <Input
                placeholder="Search by reference..."
                className="max-w-xs"
                value={auditLogFilters.submissionReference ?? ""}
                onChange={(e) => setAuditLogFilters({ submissionReference: e.target.value || undefined })}
              />
              <Input
                placeholder="Filter by user..."
                className="max-w-xs"
                value={auditLogFilters.decidedBy ?? ""}
                onChange={(e) => setAuditLogFilters({ decidedBy: e.target.value || undefined })}
              />
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPage(1);
                  resetAuditLogFilters();
                }}
              >
                Reset
              </Button>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-sm text-muted-foreground">Loading audit logs...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Decision</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-24">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.reference_number}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            entry.decision === "ACCEPT"
                              ? "default"
                              : entry.decision === "RETURN"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {entry.decision}
                        </Badge>
                      </TableCell>
                      <TableCell>{entry.decided_by}</TableCell>
                      <TableCell>{new Date(entry.decided_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedEntry(entry)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {items.length ? (page - 1) * pageSize + 1 : 0}-{(page - 1) * pageSize + items.length} of {data?.total ?? 0}
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((p) => Math.max(1, p - 1));
                      }}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">{page}</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        const maxPage = Math.max(1, Math.ceil((data?.total ?? 1) / pageSize));
                        setPage((p) => Math.min(maxPage, p + 1));
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={Boolean(selectedEntry)} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Audit Entry Details</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-2 text-sm">
              <p><strong>Reference:</strong> {selectedEntry.reference_number}</p>
              <p><strong>Decision:</strong> {selectedEntry.decision}</p>
              <p><strong>Reviewer:</strong> {selectedEntry.decided_by}</p>
              <p><strong>Date:</strong> {new Date(selectedEntry.decided_at).toLocaleString()}</p>
              <p><strong>Reason:</strong> {selectedEntry.reason || "N/A"}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
