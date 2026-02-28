import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Users, RefreshCw, UserPlus, CheckCircle2, AlertTriangle, Search, Loader2 } from "lucide-react";
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
import { useAssignmentQueue } from "@/hooks/useAssignmentQueue";
import { useTeamWorkload } from "@/hooks/useTeamWorkload";
import { useCreateAssignment } from "@/hooks/useCreateAssignment";
import { toast } from "@/hooks/use-toast";

export default function AssignCTRs() {
  const [selectedUnassigned, setSelectedUnassigned] = useState<string[]>([]);
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [deadline, setDeadline] = useState<string>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  const { data: queueData, isLoading: queueLoading, refetch: refetchQueue } = useAssignmentQueue({ report_type: "CTR" });
  const { data: teamData, isLoading: teamLoading, refetch: refetchTeam } = useTeamWorkload();
  const { mutate: createAssignment, isPending: isAssigning } = useCreateAssignment();

  const breadcrumbItems = [
    { label: "Compliance Workspace", icon: <Users className="h-5 w-5" /> },
    { label: "Workload Management", link: "/compliance/workload/dashboard" },
    { label: "Assign CTRs" },
  ];

  const handleAssign = () => {
    if (selectedUnassigned.length === 0) {
      toast({ title: "No reports selected", variant: "destructive" });
      return;
    }
    if (!assigneeId) {
      toast({ title: "Please select an officer", variant: "destructive" });
      return;
    }

    selectedUnassigned.forEach(reportId => {
      createAssignment({
        report_id: reportId,
        assignee_id: assigneeId,
        workflow_type: "compliance",
        deadline: new Date(deadline).toISOString(),
      }, {
        onSuccess: () => {
          toast({ title: "Assignment created successfully" });
          setSelectedUnassigned([]);
          refetchQueue();
          refetchTeam();
        },
        onError: (err: any) => {
          toast({ title: "Failed to create assignment", description: err.message, variant: "destructive" });
        }
      });
    });
  };

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Assign/Reassign CTRs
          </h1>
          <Button variant="outline" size="sm" onClick={() => { refetchQueue(); refetchTeam(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Unassigned CTRs */}
        <Card>
          <CardHeader>
            <CardTitle>UNASSIGNED CTRs ({queueData?.total || 0} items)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {queueLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground">Loading unassigned reports...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="data-table-header">
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedUnassigned.length === (queueData?.items.length || 0) && (queueData?.items.length || 0) > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUnassigned(queueData?.items.map(i => i.id) || []);
                          } else {
                            setSelectedUnassigned([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Ref #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Validated At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queueData?.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No unassigned reports found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    queueData?.items.map((ctr) => (
                      <TableRow key={ctr.id} className="data-table-row">
                        <TableCell>
                          <Checkbox
                            checked={selectedUnassigned.includes(ctr.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedUnassigned([...selectedUnassigned, ctr.id]);
                              } else {
                                setSelectedUnassigned(selectedUnassigned.filter(id => id !== ctr.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-mono font-medium text-primary">
                          {ctr.reference}
                        </TableCell>
                        <TableCell>
                          <ReportTypeBadge type={ctr.report_type as any} />
                        </TableCell>
                        <TableCell>{ctr.entity_name}</TableCell>
                        <TableCell>{ctr.validated_at}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedUnassigned(queueData?.items.map(i => i.id) || [])}>Select All</Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedUnassigned([])}>Deselect All</Button>
              </div>
              <div className="flex gap-2">
                <Select value={assigneeId} onValueChange={setAssigneeId}>
                  <SelectTrigger className="w-[150px]">
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
                <Input type="date" className="w-[150px]" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                <Button size="sm" onClick={handleAssign} disabled={isAssigning || selectedUnassigned.length === 0 || !assigneeId}>
                  {isAssigning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                  Assign Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Workload Summary */}
        <Card>
          <CardHeader>
            <CardTitle>TEAM WORKLOAD SUMMARY</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {teamLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="data-table-header">
                    <TableHead>Officer</TableHead>
                    <TableHead>Total Active</TableHead>
                    <TableHead>CTRs</TableHead>
                    <TableHead>STRs</TableHead>
                    <TableHead>Capacity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamData?.map((officer) => (
                    <TableRow key={officer.user_id}>
                      <TableCell className="font-medium">{officer.user_name}</TableCell>
                      <TableCell>{officer.workload_count}</TableCell>
                      <TableCell>{officer.active_ctrs}</TableCell>
                      <TableCell>{officer.active_strs}</TableCell>
                      <TableCell>
                        {officer.workload_count > 10 ? (
                          <span className="flex items-center gap-1 text-orange-600">
                            <AlertTriangle className="h-4 w-4" />
                            High
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            Normal
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}