import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { History, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useAuth } from "@/contexts/AuthContext";
import { fetchManualValidationHistory } from "@/lib/manualValidationApi";

interface ValidationHistoryItem {
  submission_id: string;
  reference_number: string;
  report_type: string;
  submitted_at: string;
  entity_name: string;
  validation_decision: "RETURN" | "REJECT";
  decided_at: string;
  decision_reason?: string;
}

export default function ManualValidationHistory() {
  const { user } = useAuth();
  const [items, setItems] = useState<ValidationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchManualValidationHistory(page, pageSize);
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err?.message || "Failed to load validation history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [page]);

  const isPersonalQueue = user?.role === "compliance_officer" || user?.role === "analyst";
  const pageTitle = isPersonalQueue
    ? "My Validation History"
    : "Manual Validation History";

  const breadcrumbItems = [
    { label: "Compliance", href: "/compliance/validation-queue" },
    { label: pageTitle, href: "/compliance/validation-history" },
  ];

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case "RETURN":
        return <Badge variant="outline" className="bg-yellow-50">Returned</Badge>;
      case "REJECT":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{decision}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6" />
            {pageTitle} ({total} Reports)
          </h1>
          <Button onClick={loadHistory} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            {loading && (
              <div className="text-center py-12">Loading validation history...</div>
            )}

            {error && (
              <div className="text-center py-12 text-red-600">
                <p>{error}</p>
                <Button onClick={loadHistory} variant="outline" className="mt-4">
                  Try Again
                </Button>
              </div>
            )}

            {!loading && !error && items.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No validation history found</p>
              </div>
            )}

            {!loading && !error && items.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Decision</TableHead>
                      <TableHead>Decided At</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.submission_id} data-testid="history-row" data-reference={item.reference_number}>
                        <TableCell className="font-mono text-sm">
                          {item.reference_number}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.report_type}</Badge>
                        </TableCell>
                        <TableCell>{item.entity_name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(item.submitted_at)}
                        </TableCell>
                        <TableCell>{getDecisionBadge(item.validation_decision)}</TableCell>
                        <TableCell className="text-sm">
                          {formatDate(item.decided_at)}
                        </TableCell>
                        <TableCell className="max-w-md truncate text-sm">
                          {item.decision_reason || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    onClick={() => setPage(i + 1)}
                    isActive={page === i + 1}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </MainLayout>
  );
}
