import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FileCheck, RefreshCw, UserPlus, AlertTriangle, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ReportTypeBadge } from "@/components/ui/StatusBadge";
import { Input } from "@/components/ui/input";
import { useValidationQueue } from "@/hooks/useManualValidation";
import { useTeamWorkload } from "@/hooks/useTeamWorkload";
import { differenceInDays } from "date-fns";

export default function PendingValidations() {
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: queueData, isLoading: queueLoading, refetch: refetchQueue } = useValidationQueue({
    validationStatus: "PENDING"
  }, page, pageSize);
  const { data: teamData, isLoading: teamLoading } = useTeamWorkload();

  const breadcrumbItems = [
    { label: "Compliance Workspace", icon: <FileCheck className="h-5 w-5" /> },
    { label: "Validation Queue", link: "/compliance/validation" },
    { label: "Pending Manual Validation" },
  ];

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-primary" />
            Pending Manual Validation (Unassigned)
          </h1>
          <Button variant="outline" size="sm" onClick={() => refetchQueue()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Select defaultValue="all">
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="CTR">CTR</SelectItem>
              <SelectItem value="STR">STR</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm">
            Clear
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Unassigned Pool ({queueData?.total || 0} items)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {queueLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="data-table-header">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selected.length > 0 && selected.length === (queueData?.items.length || 0)}
                        onCheckedChange={(checked) => {
                          if (checked) setSelected(queueData?.items.map(v => v.submission_id) || []);
                          else setSelected([]);
                        }}
                      />
                    </TableHead>
                    <TableHead>Ref #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Trans</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Age</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queueData?.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No pending validations found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    queueData?.items.map((v) => (
                      <TableRow key={v.submission_id} className="data-table-row">
                        <TableCell>
                          <Checkbox
                            checked={selected.includes(v.submission_id)}
                            onCheckedChange={(checked) => {
                              if (checked) setSelected([...selected, v.submission_id]);
                              else setSelected(selected.filter(id => id !== v.submission_id));
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-mono font-medium text-primary">{v.reference_number}</TableCell>
                        <TableCell>
                          <ReportTypeBadge type={v.report_type as any} />
                        </TableCell>
                        <TableCell>{v.entity_name}</TableCell>
                        <TableCell>{v.transaction_count}</TableCell>
                        <TableCell className="text-muted-foreground">{v.submitted_at}</TableCell>
                        <TableCell>
                          {differenceInDays(new Date(), new Date(v.submitted_at))}d
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelected(queueData?.items.map(v => v.submission_id) || [])}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelected([])}>
                  Deselect All
                </Button>
              </div>
              <div className="flex gap-2">
                <Select>
                  <SelectTrigger className="w-[170px]">
                    <SelectValue placeholder="Assign to" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamData?.map(officer => (
                      <SelectItem key={officer.user_id} value={officer.user_id}>
                        {officer.user_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input type="date" className="w-[160px]" defaultValue={new Date().toISOString().split('T')[0]} />
                <Button size="sm" disabled={selected.length === 0}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

