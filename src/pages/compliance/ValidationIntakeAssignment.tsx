import { useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FileCheck, RefreshCw, UserPlus, AlertTriangle, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportTypeBadge } from "@/components/ui/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useValidationQueue } from "@/hooks/useManualValidation";
import { useTeamWorkload } from "@/hooks/useTeamWorkload";
import { differenceInDays } from "date-fns";

type IntakeTab = "unassigned" | "assigned";

export default function ValidationIntakeAssignment() {
  const [tab, setTab] = useState<IntakeTab>("unassigned");
  const [query, setQuery] = useState("");
  const [selectedUnassigned, setSelectedUnassigned] = useState<string[]>([]);
  const [selectedAssigned, setSelectedAssigned] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: unassignedData, isLoading: unassignedLoading, refetch: refetchUnassigned } = useValidationQueue({
    validationStatus: "PENDING"
  }, page, pageSize);

  const { data: assignedData, isLoading: assignedLoading, refetch: refetchAssigned } = useValidationQueue({
    validationStatus: "IN_REVIEW"
  }, page, pageSize);

  const { data: teamData, isLoading: teamLoading } = useTeamWorkload();

  const breadcrumbItems = [
    { label: "Compliance Workspace", icon: <FileCheck className="h-5 w-5" /> },
    { label: "Validation Queue", link: "/compliance/validation" },
    { label: "Intake & Assignment" },
  ];

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-primary" />
            Validation Intake &amp; Assignment
          </h1>
          <Button variant="outline" size="sm" onClick={() => { refetchUnassigned(); refetchAssigned(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Tabs + shared filters/search */}
        <div className="flex flex-col gap-4">
          <Tabs value={tab} onValueChange={(v) => { setTab(v as IntakeTab); setPage(1); }}>
            <TabsList>
              <TabsTrigger value="unassigned">Unassigned ({unassignedData?.total || 0})</TabsTrigger>
              <TabsTrigger value="assigned">Assigned / Reassign ({assignedData?.total || 0})</TabsTrigger>
            </TabsList>

            <div className="mt-4 flex gap-2 flex-wrap items-center">
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
              <Button variant="ghost" size="sm" onClick={() => setQuery("")}>
                Clear
              </Button>
              <div className="flex-1" />
              <div className="min-w-[260px] w-full sm:w-[360px]">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by Ref # / Entity / Assignee..."
                />
              </div>
            </div>

            <TabsContent value="unassigned" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Unassigned Pool</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {unassignedLoading ? (
                    <div className="p-12 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="data-table-header">
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedUnassigned.length > 0 && selectedUnassigned.length === (unassignedData?.items.length || 0)}
                              onCheckedChange={(checked) => {
                                if (checked) setSelectedUnassigned(unassignedData?.items.map(v => v.submission_id) || []);
                                else setSelectedUnassigned([]);
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
                        {unassignedData?.items.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              No unassigned reports found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          unassignedData?.items.map((v) => (
                            <TableRow key={v.submission_id} className="data-table-row">
                              <TableCell>
                                <Checkbox
                                  checked={selectedUnassigned.includes(v.submission_id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) setSelectedUnassigned([...selectedUnassigned, v.submission_id]);
                                    else setSelectedUnassigned(selectedUnassigned.filter(id => id !== v.submission_id));
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUnassigned(unassignedData?.items.map(v => v.submission_id) || [])}
                      >
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setSelectedUnassigned([])}>
                        Clear
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
                      <Button size="sm" disabled={selectedUnassigned.length === 0}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Assign Selected
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assigned" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Assigned / Reassign</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assignedLoading ? (
                    <div className="p-12 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="data-table-header">
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedAssigned.length > 0 && selectedAssigned.length === (assignedData?.items.length || 0)}
                              onCheckedChange={(checked) => {
                                if (checked) setSelectedAssigned(assignedData?.items.map(v => v.submission_id) || []);
                                else setSelectedAssigned([]);
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
                        {assignedData?.items.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                              No assigned reports found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          assignedData?.items.map((v) => (
                            <TableRow key={v.submission_id} className="data-table-row">
                              <TableCell>
                                <Checkbox
                                  checked={selectedAssigned.includes(v.submission_id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) setSelectedAssigned([...selectedAssigned, v.submission_id]);
                                    else setSelectedAssigned(selectedAssigned.filter(id => id !== v.submission_id));
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAssigned(assignedData?.items.map(v => v.submission_id) || [])}
                      >
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setSelectedAssigned([])}>
                        Clear
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
                      <Button size="sm" disabled={selectedAssigned.length === 0}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Reassign Selected
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}

