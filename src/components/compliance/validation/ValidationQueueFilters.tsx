import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { QueueFilters } from "@/types/manualValidation";

interface ValidationQueueFiltersProps {
  filters: QueueFilters;
  onChange: (filters: Partial<QueueFilters>) => void;
  onReset: () => void;
}

export function ValidationQueueFilters({ filters, onChange, onReset }: ValidationQueueFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-[180px]">
        <Select
          value={filters.reportType ?? "all"}
          onValueChange={(value) => onChange({ reportType: value === "all" ? undefined : (value as "CTR" | "STR") })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Report Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="CTR">CTR</SelectItem>
            <SelectItem value="STR">STR</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Input
        type="date"
        className="w-[180px]"
        value={filters.dateFrom ?? ""}
        onChange={(e) => onChange({ dateFrom: e.target.value || undefined })}
      />
      <Input
        type="date"
        className="w-[180px]"
        value={filters.dateTo ?? ""}
        onChange={(e) => onChange({ dateTo: e.target.value || undefined })}
      />
      <Input
        placeholder="Search by reference or entity..."
        className="min-w-[220px] flex-1"
        value={filters.search ?? ""}
        onChange={(e) => onChange({ search: e.target.value || undefined })}
      />
      <Button variant="outline" onClick={onReset}>
        Reset
      </Button>
    </div>
  );
}
