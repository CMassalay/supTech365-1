import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, XCircle, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useReportContent, useSubmitDecision } from "@/hooks/useManualValidation";
import { useValidationStore } from "@/hooks/useValidationStore";
import { TransactionTable } from "@/components/compliance/validation/TransactionTable";
import { ValidationDecisionModal } from "@/components/compliance/validation/ValidationDecisionModal";
import type { ManualDecisionType } from "@/types/manualValidation";
import { useAuth } from "@/contexts/AuthContext";

export default function ReportReview() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: detailData, isLoading } = useReportContent(submissionId || "");
  const report = detailData?.report;
  const { mutateAsync: submitDecision, isPending } = useSubmitDecision();
  const {
    decisionModalOpen,
    selectedDecisionType,
    openDecisionModal,
    closeDecisionModal,
    setSelectedSubmission,
  } = useValidationStore();

  const queueRoute =
    user?.role === "compliance_officer" || user?.role === "analyst"
      ? "/compliance/validation-queue"
      : "/compliance/manual-validation";
  const queueLabel =
    user?.role === "compliance_officer" || user?.role === "analyst"
      ? "My Assigned Validations"
      : "Manual Validation Queue";

  const breadcrumbItems = [
    { label: "Compliance", href: "/compliance/validation" },
    { label: queueLabel, href: queueRoute },
    { label: "Report Review", href: "#" },
  ];

  if (!submissionId) {
    return null;
  }

  const handleAccept = async () => {
    if (!submissionId) return;
    try {
      await submitDecision({ submissionId, data: { decision: "ACCEPT" } });
      navigate(queueRoute);
    } catch (error) {
      console.error("Failed to accept report:", error);
    }
  };

  const handleSubmitDecision = async (payload: any) => {
    try {
      await submitDecision({ submissionId, data: payload });
      closeDecisionModal();
      navigate(queueRoute);
    } catch (error) {
      console.error("Failed to submit decision:", error);
      // Don't navigate on error - stay on the review page to show error state
    }
  };

  const openModal = (type: ManualDecisionType) => {
    setSelectedSubmission(submissionId);
    openDecisionModal(type);
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <Button variant="ghost" onClick={() => navigate(queueRoute)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {queueLabel}
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
                  <p>Type: {report?.report_type}</p>
                  <p><strong>Entity:</strong> {report?.entity?.name || "N/A"}</p>
                  <p><strong>Submitted:</strong> {report?.submitted_at ? new Date(report.submitted_at).toLocaleString() : "N/A"}</p>
                  <p><strong>Status:</strong> <Badge>{report?.status || "PENDING"}</Badge></p>
                </>
              )}
            </CardContent>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transactions ({report?.transactions?.length ?? 0})</CardTitle>
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
          <Button onClick={handleAccept} disabled={isLoading || isPending}>
            <Check className="h-4 w-4 mr-2" />
            Accept
          </Button>
          <Button variant="outline" onClick={() => openModal("RETURN")} disabled={isLoading || isPending}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Return for Correction
          </Button>
          <Button variant="destructive" onClick={() => openModal("REJECT")} disabled={isLoading || isPending}>
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
