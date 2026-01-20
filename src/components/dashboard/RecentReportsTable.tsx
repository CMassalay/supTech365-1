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

interface Report {
  id: string;
  referenceNumber: string;
  type: ReportType;
  status: WorkflowStatus;
  entityName: string;
  submittedDate: string;
  daysInQueue: number;
}

const mockReports: Report[] = [
  {
    id: "1",
    referenceNumber: "FIA-2026-0234",
    type: "CTR",
    status: "under_review",
    entityName: "Bank of Monrovia",
    submittedDate: "2026-01-18",
    daysInQueue: 2,
  },
  {
    id: "2",
    referenceNumber: "FIA-2026-0233",
    type: "STR",
    status: "validated",
    entityName: "First Trust Bank",
    submittedDate: "2026-01-17",
    daysInQueue: 3,
  },
  {
    id: "3",
    referenceNumber: "FIA-2026-0232",
    type: "Escalated CTR",
    status: "escalated",
    entityName: "Liberian MFI",
    submittedDate: "2026-01-16",
    daysInQueue: 4,
  },
  {
    id: "4",
    referenceNumber: "FIA-2026-0231",
    type: "CTR",
    status: "submitted",
    entityName: "Ecobank Liberia",
    submittedDate: "2026-01-16",
    daysInQueue: 4,
  },
  {
    id: "5",
    referenceNumber: "FIA-2026-0230",
    type: "STR",
    status: "rejected",
    entityName: "UBA Liberia",
    submittedDate: "2026-01-15",
    daysInQueue: 5,
  },
];

export function RecentReportsTable() {
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
          {mockReports.map((report) => (
            <TableRow key={report.id} className="data-table-row">
              <TableCell className="font-mono-ref font-medium text-primary">
                {report.referenceNumber}
              </TableCell>
              <TableCell>
                <ReportTypeBadge type={report.type} />
              </TableCell>
              <TableCell className="max-w-[150px] truncate">{report.entityName}</TableCell>
              <TableCell className="text-muted-foreground">{report.submittedDate}</TableCell>
              <TableCell>
                <StatusBadge status={report.status} />
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={
                    report.daysInQueue > 7
                      ? "text-destructive font-medium"
                      : report.daysInQueue > 5
                      ? "text-risk-high font-medium"
                      : "text-muted-foreground"
                  }
                >
                  {report.daysInQueue}d
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
