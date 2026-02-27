import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronRight, AlertTriangle } from "lucide-react";
import type { QueueItem } from "@/types/manualValidation";

interface ValidationQueueTableProps {
  items: QueueItem[];
  onViewDetails: (submissionId: string) => void;
}

export function ValidationQueueTable({ items, onViewDetails }: ValidationQueueTableProps) {
  const amountFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  if (!items.length) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        No reports pending validation
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ref #</TableHead>
          <TableHead>Entity</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Trans</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>Risk</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.submission_id}>
            <TableCell className="font-medium text-primary cursor-pointer hover:underline" onClick={() => onViewDetails(item.submission_id)}>
              {item.reference_number.split("-").pop() || item.reference_number}
            </TableCell>
            <TableCell>{item.entity_name}</TableCell>
            <TableCell className="font-semibold">
              {typeof item.total_amount === "number" ? amountFormatter.format(item.total_amount) : "-"}
            </TableCell>
            <TableCell>{item.transaction_count ?? "-"}</TableCell>
            <TableCell>{item.subject ?? "-"}</TableCell>
            <TableCell>{item.age ?? "-"}</TableCell>
            <TableCell>
              {item.risk_level === "high" && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  High
                </Badge>
              )}
              {item.risk_level === "medium" && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                  Medium
                </Badge>
              )}
              {item.risk_level === "low" && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  Low
                </Badge>
              )}
              {!item.risk_level && <span className="text-muted-foreground">-</span>}
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="font-medium">
                {item.status ?? "Not Manually Validated"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3"
                onClick={() => onViewDetails(item.submission_id)}
              >
                Review
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
