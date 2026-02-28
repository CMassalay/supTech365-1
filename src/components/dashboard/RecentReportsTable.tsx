import { FileText, MoreVertical, Eye, ArrowRight } from "lucide-react";
import { StatusBadge, ReportTypeBadge, WorkflowStatus, ReportType } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface Report {
  id: string;
  reference_number: string;
  report_type: ReportType;
  status: WorkflowStatus;
  entity_name: string;
  submitted_at: string;
  days_in_queue: number;
}

interface RecentReportsTableProps {
  data?: Report[];
  isLoading?: boolean;
}

export function RecentReportsTable({ data, isLoading }: RecentReportsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const reports = data || [];

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Recent Reports</h3>
        </div>
        <Button variant="ghost" size="sm" className="text-primary">
          View All
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="data-table-header hover:bg-muted">
            <TableHead>Reference</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Days</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No recent reports found
              </TableCell>
            </TableRow>
          ) : (
            reports.map((report) => (
              <TableRow key={report.id} className="data-table-row">
                <TableCell className="font-mono-ref font-medium text-primary">
                  {report.reference_number}
                </TableCell>
                <TableCell>
                  <ReportTypeBadge type={report.report_type} />
                </TableCell>
                <TableCell className="max-w-[150px] truncate">{report.entity_name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(report.submitted_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <StatusBadge status={report.status} />
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={
                      report.days_in_queue > 7
                        ? "text-destructive font-medium"
                        : report.days_in_queue > 5
                        ? "text-risk-high font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {report.days_in_queue}d
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Take Action
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
