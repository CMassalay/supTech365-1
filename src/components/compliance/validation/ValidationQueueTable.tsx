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
import { ChevronRight } from "lucide-react";
import type { QueueItem } from "@/types/manualValidation";

interface ValidationQueueTableProps {
  items: QueueItem[];
  onViewDetails: (submissionId: string) => void;
}

export function ValidationQueueTable({ items, onViewDetails }: ValidationQueueTableProps) {
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
          <TableHead>Reference</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Entity</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="w-24">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.submission_id}>
            <TableCell className="font-medium">{item.reference_number}</TableCell>
            <TableCell>
              <Badge variant={item.report_type === "CTR" ? "default" : "secondary"}>
                {item.report_type}
              </Badge>
            </TableCell>
            <TableCell>{item.entity_name}</TableCell>
            <TableCell>{new Date(item.submitted_at).toLocaleDateString()}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(item.submission_id)}
                aria-label={`View details for ${item.reference_number}`}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
