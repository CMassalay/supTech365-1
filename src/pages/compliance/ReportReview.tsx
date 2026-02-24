import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useReportContent, useSubmitDecision } from "@/hooks/useManualValidation";
import { useValidationStore } from "@/hooks/useValidationStore";
import { TransactionTable } from "@/components/compliance/validation/TransactionTable";
import { ValidationDecisionModal } from "@/components/compliance/validation/ValidationDecisionModal";
import type { DecisionType } from "@/types/manualValidation";

export default function ReportReview() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { data: report, isLoading } = useReportContent(submissionId || "");
  const { mutateAsync: submitDecision, isPending } = useSubmitDecision();
  const {
    decisionModalOpen,
    selectedDecisionType,
    openDecisionModal,
    closeDecisionModal,
    setSelectedSubmission,
  } = useValidationStore();

  const breadcrumbItems = [
    { label: "Compliance", href: "/compliance/validation" },
    { label: "Manual Validation Queue", href: "/compliance/validation-queue" },
    { label: "Report Review", href: "#" },
  ];

  if (!submissionId) {
    return null;
  }

  const handleSubmitDecision = async (payload: { decision: DecisionType; reason?: string }) => {
    await submitDecision({ submissionId, data: payload });
    closeDecisionModal();
    navigate("/compliance/validation-queue");
  };

  const openModal = (type: DecisionType) => {
    setSelectedSubmission(submissionId);
    openDecisionModal(type);
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <Button variant="ghost" onClick={() => navigate("/compliance/validation-queue")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Queue
        </Button>

        <h1 className="text-2xl font-bold">
          Report Review: {isLoading ? "Loading..." : report?.reference_number}
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Report Metadata</CardTitle>
            <CardContent className="pt-0 space-y-1 text-sm">
              {isLoading ? (
                <p className="text-muted-foreground">Loading report details...</p>
              ) : (
                <>
                  <p><strong>Reference:</strong> {report?.reference_number}</p>
                  <p><strong>Type:</strong> {report?.report_type}</p>
                  <p><strong>Entity:</strong> {report?.entity.name}</p>
                  <p><strong>Submitted:</strong> {new Date(report?.submitted_at || "").toLocaleString()}</p>
                  <p><strong>Submitted By:</strong> {report?.submitted_by.username}</p>
                  <p>
                    <strong>Reporting Period:</strong>{" "}
                    {String(report?.metadata?.reportingPeriod ?? "N/A")}
                  </p>
                  <p><strong>Status:</strong> <Badge>{report?.validation_status}</Badge></p>
                </>
              )}
            </CardContent>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transactions ({report?.transactions.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-sm text-muted-foreground">Loading transactions...</div>
            ) : (
              <TransactionTable transactions={report?.transactions ?? []} />
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={() => openModal("ACCEPT")} disabled={isLoading}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Accept
          </Button>
          <Button variant="outline" onClick={() => openModal("RETURN")} disabled={isLoading}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Return for Correction
          </Button>
          <Button variant="destructive" onClick={() => openModal("REJECT")} disabled={isLoading}>
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>
      </div>

      <ValidationDecisionModal
        open={decisionModalOpen}
        onOpenChange={(open) => {
          if (!open) closeDecisionModal();
        }}
        referenceNumber={report?.reference_number || ""}
        reportType={report?.report_type || "CTR"}
        decisionType={selectedDecisionType}
        isSubmitting={isPending}
        onSubmit={handleSubmitDecision}
      />
    </MainLayout>
  );
}
