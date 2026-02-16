import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const mockReport = {
  reference: "FIA-2026-001234",
  type: "CTR" as const,
  entityName: "First Bank of Liberia",
  submittedAt: "2026-02-03 10:30:00",
  submittedBy: "compliance_officer",
  reportingPeriod: "Jan 1-31, 2026",
  status: "PENDING",
  transactions: [
    { id: 1, date: "2026-01-15", type: "Deposit", amount: "25,000", name: "John" },
    { id: 2, date: "2026-01-16", type: "Withdraw", amount: "15,000", name: "Jane" },
    { id: 3, date: "2026-01-18", type: "Transfer", amount: "50,000", name: "Corp" },
    { id: 4, date: "2026-01-22", type: "Deposit", amount: "35,000", name: "John" },
    { id: 5, date: "2026-01-25", type: "Deposit", amount: "25,000", name: "Mike" },
  ],
};

export default function ReportReview() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const [decisionModal, setDecisionModal] = useState<"accept" | "return" | "reject" | null>(null);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const breadcrumbItems = [
    { label: "Compliance", href: "/compliance/validation" },
    { label: "Manual Validation Queue", href: "/compliance/validation-queue" },
    { label: "Report Review", href: "#" },
  ];

  const needsReason = decisionModal === "return" || decisionModal === "reject";
  const canSubmit = !needsReason || reason.trim().length >= 10;

  const handleSubmitDecision = async () => {
    if (needsReason && reason.trim().length < 10) {
      toast.error("Reason must be at least 10 characters");
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    setIsSubmitting(false);
    setDecisionModal(null);
    setReason("");
    toast.success("Decision submitted successfully");
    navigate("/compliance/validation-queue");
  };

  const openModal = (type: "accept" | "return" | "reject") => {
    setReason("");
    setDecisionModal(type);
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <Button variant="ghost" onClick={() => navigate("/compliance/validation-queue")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Queue
        </Button>

        <h1 className="text-2xl font-bold">Report Review: {mockReport.reference}</h1>

        <Card>
          <CardHeader>
            <CardTitle>Report Metadata</CardTitle>
            <CardContent className="pt-0 space-y-1 text-sm">
              <p><strong>Reference:</strong> {mockReport.reference}</p>
              <p><strong>Type:</strong> {mockReport.type}</p>
              <p><strong>Entity:</strong> {mockReport.entityName}</p>
              <p><strong>Submitted:</strong> {mockReport.submittedAt}</p>
              <p><strong>Submitted By:</strong> {mockReport.submittedBy}</p>
              <p><strong>Reporting Period:</strong> {mockReport.reportingPeriod}</p>
              <p><strong>Status:</strong> <Badge>{mockReport.status}</Badge></p>
            </CardContent>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transactions ({mockReport.transactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockReport.transactions.map((t, i) => (
                  <TableRow key={t.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{t.date}</TableCell>
                    <TableCell>{t.type}</TableCell>
                    <TableCell>{t.amount}</TableCell>
                    <TableCell>{t.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={() => openModal("accept")}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Accept
          </Button>
          <Button variant="outline" onClick={() => openModal("return")}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Return for Correction
          </Button>
          <Button variant="destructive" onClick={() => openModal("reject")}>
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>
      </div>

      <Dialog open={!!decisionModal} onOpenChange={(open) => !open && setDecisionModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {decisionModal === "accept" && "Accept Report"}
              {decisionModal === "return" && "Return Report for Correction"}
              {decisionModal === "reject" && "Reject Report"}
            </DialogTitle>
            <DialogDescription>
              Reference: {mockReport.reference} | Type: {mockReport.type}
            </DialogDescription>
          </DialogHeader>
          {decisionModal === "accept" && (
            <p className="text-sm text-muted-foreground">
              This report will be accepted and routed to the next stage. Are you sure?
            </p>
          )}
          {(decisionModal === "return" || decisionModal === "reject") && (
            <div className="space-y-2">
              <Label>Reason * (min 10 characters)</Label>
              <Textarea
                placeholder="Please explain why this report is being returned or rejected..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
              {reason.length > 0 && reason.length < 10 && (
                <p className="text-sm text-destructive">Reason must be at least 10 characters</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDecisionModal(null)}>Cancel</Button>
            <Button
              onClick={handleSubmitDecision}
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : decisionModal === "accept" ? "Confirm Accept" : `Confirm ${decisionModal === "return" ? "Return" : "Reject"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
