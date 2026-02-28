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
import { fetchReviewHistory } from "@/lib/reviewApi";

interface ReviewHistoryItem {
  submission_id: string;
  reference_number: string;
  report_type: string;
  submitted_at: string;
  entity_id: string;
  review_status: "ARCHIVED" | "MONITORED" | "ESCALATED";
  decided_at: string;
  escalation_reason?: string;
}

export default function CTRReviewHistory() {
  const { user } = useAuth();
  const [items, setItems] = useState<ReviewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReviewHistory(page, pageSize);
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err?.message || "Failed to load review history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [page]);

  const isPersonalQueue = user?.role === "compliance_officer" || user?.role === "analyst";
  const pageTitle = isPersonalQueue ? "My Review History" : "CTR Review History";

  const breadcrumbItems = [
    { label: "Compliance", href: "/compliance/ctr-review" },
    { label: pageTitle, href: "/compliance/ctr-review-history" },
  ];

  const getDispositionBadge = (disposition: string) => {
    switch (disposition) {
      case "ARCHIVED":
        return <Badge variant="secondary">Archived</Badge>;
      case "MONITORED":
        return <Badge variant="default" className="bg-orange-500">Monitored</Badge>;
      case "ESCALATED":
        return <Badge variant="destructive">Escalated</Badge>;
      default:
        return <Badge>{disposition}</Badge>;
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
            {pageTitle} ({total} CTRs)
          </h1>
          <Button onClick={loadHistory} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            {loading && (
              <div className="text-center py-12">Loading review history...</div>
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
                <p>No review history found</p>
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
                      <TableHead>Disposition</TableHead>
                      <TableHead>Decided At</TableHead>
                      <TableHead>Notes</TableHead>
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
                        <TableCell>{item.entity_id}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(item.submitted_at)}
                        </TableCell>
                        <TableCell>{getDispositionBadge(item.review_status)}</TableCell>
                        <TableCell className="text-sm">
                          {formatDate(item.decided_at)}
                        </TableCell>
                        <TableCell className="max-w-md truncate text-sm">
                          {item.escalation_reason || "-"}
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
