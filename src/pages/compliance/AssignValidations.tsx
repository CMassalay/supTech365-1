import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FileCheck, RefreshCw, UserPlus, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ReportTypeBadge } from "@/components/ui/StatusBadge";
import { useValidationQueue } from "@/hooks/useManualValidation";
import { useTeamWorkload } from "@/hooks/useTeamWorkload";
import { differenceInDays } from "date-fns";

export default function AssignValidations() {
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: queueData, isLoading: queueLoading, refetch: refetchQueue } = useValidationQueue({
    validationStatus: "IN_REVIEW"
  }, page, pageSize);
  const { data: teamData, isLoading: teamLoading, refetch: refetchTeam } = useTeamWorkload();

  const breadcrumbItems = [
    { label: "Compliance Workspace", icon: <FileCheck className="h-5 w-5" /> },
    { label: "Validation Queue", link: "/compliance/validation" },
    { label: "Assign/Reassign" },
  ];

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-primary" />
            Assign/Reassign Validations
          </h1>
          <Button variant="outline" size="sm" onClick={() => { refetchQueue(); refetchTeam(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reassign Existing Validations ({queueData?.total || 0} items)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Input placeholder="Search by Ref # / Entity / Assignee..." className="flex-1 min-w-[260px]" />
              <Button variant="ghost" size="sm">
                Clear
              </Button>
            </div>

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
                        checked={selected.length === (queueData?.items.length || 0) && (queueData?.items.length || 0) > 0}
                        onCheckedChange={(checked) => {
                          if (checked) setSelected(queueData?.items.map(v => v.submission_id) || []);
                          else setSelected([]);
                        }}
                      />
                    </TableHead>
                    <TableHead>Ref #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Current Assignee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queueData?.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No validations found to reassign.
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
                        <TableCell>{v.assigned_to_name || "Unassigned"}</TableCell>
                        <TableCell>{v.validation_status}</TableCell>
                        <TableCell>{differenceInDays(new Date(), new Date(v.submitted_at))}d</TableCell>
                        <TableCell>
                          <Input placeholder="Enter reason..." className="w-[220px]" />
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
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Reassign to" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamData?.map(officer => (
                      <SelectItem key={officer.user_id} value={officer.user_id}>
                        {officer.user_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" disabled={selected.length === 0}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Reassign Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

