import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  fetchCTRReviewDetail,
  submitCTRReviewDecision,
  type ReviewDetailResponse,
} from "@/lib/reviewApi";

export default function CTRReviewDetail() {
  const { id, reportId } = useParams<{ id?: string; reportId?: string }>();
  const submissionId = id || reportId || "";
  const navigate = useNavigate();
  const [disposition, setDisposition] = useState("");
  const [findings, setFindings] = useState("");
  const [escalationReason, setEscalationReason] = useState("");
  const [reportData, setReportData] = useState<ReviewDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbItems = [
    { label: "Compliance Workspace", icon: <FileText className="h-5 w-5" /> },
    { label: "CTR Review Queue", link: "/compliance/ctr-review" },
    { label: submissionId || "CTR", link: `/compliance/ctr-review/${submissionId}/review` },
    { label: "Review" },
  ];

  useEffect(() => {
    async function loadDetail() {
      if (!submissionId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCTRReviewDetail(submissionId);
        setReportData(data);
      } catch (error: any) {
        setError(error?.message || "Failed to load report details");
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [submissionId]);

  const transactions = useMemo(() => reportData?.report?.transactions || [], [reportData]);
  const report = reportData?.report;
  const entity = reportData?.entity;
  const validationResult = reportData?.validation_result;

  async function handleSubmitDecision() {
    if (!submissionId) return;
    if (!disposition) return;
    if (disposition === "ESCALATED" && !escalationReason.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await submitCTRReviewDecision(submissionId, {
        decision: disposition as "ARCHIVED" | "MONITORED" | "ESCALATED",
        comments: findings || undefined,
        escalation_reason: disposition === "ESCALATED" ? escalationReason : undefined,
      });
      navigate("/compliance/ctr-review");
    } catch (err: any) {
      setError(err?.message || "Failed to submit decision");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <Breadcrumb items={breadcrumbItems} />
        <div className="p-6 space-y-6">Loading report details...</div>
      </MainLayout>
    );
  }

  if (!report) {
    return (
      <MainLayout>
        <Breadcrumb items={breadcrumbItems} />
        <div className="p-6 space-y-2">
          <div className="text-destructive">{error || "Report data unavailable."}</div>
          <Link to="/compliance/ctr-review">
            <Button variant="outline">Back to Queue</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const submittedAt = report.submitted_at
    ? new Date(report.submitted_at).toLocaleString("en-US")
    : "-";
  const validatedAt = validationResult?.validated_at
    ? new Date(validationResult.validated_at).toLocaleString("en-US")
    : "-";

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">CTR {report.reference_number}</h1>
              <Badge variant="outline" className="gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                Compliance Review
              </Badge>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Entity:</span>
                <p className="font-medium">{entity?.name || report.entity_id}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Submitted:</span>
                <p className="font-medium">{submittedAt}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Validated:</span>
                <p className="font-medium">
                  {validatedAt} ({validationResult?.validation_status || "N/A"})
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Review Status:</span>
                <p className="font-medium">{report.review_status || "NOT_REVIEWED"}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Transaction Count:</span>
                <p className="font-medium">{transactions.length} transactions</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Total Amount:</span>
                <p className="font-medium">
                  $
                  {transactions
                    .reduce((sum, tx) => sum + (tx.transaction_amount || 0), 0)
                    .toLocaleString()}{" "}
                  USD
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Table ({transactions.length} transactions)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="data-table-header">
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Acct</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id} className="data-table-row">
                    <TableCell>{tx.transaction_date ? new Date(tx.transaction_date).toLocaleDateString("en-US") : "-"}</TableCell>
                    <TableCell className="font-medium">
                      ${(tx.transaction_amount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>{tx.subject_name || "-"}</TableCell>
                    <TableCell className="font-mono text-sm">{tx.account_number || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Review Findings</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Document your compliance review findings, red flags, and reasoning..."
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              className="min-h-[150px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disposition Decision</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Decision applies to entire CTR report
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={disposition} onValueChange={setDisposition}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ARCHIVED" id="archive" />
                <Label htmlFor="archive" className="cursor-pointer">
                  Archive - No suspicious activity, close report
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MONITORED" id="monitor" />
                <Label htmlFor="monitor" className="cursor-pointer">
                  Monitor - Place on watchlist, no immediate action
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ESCALATED" id="flag" />
                <Label htmlFor="flag" className="cursor-pointer">
                  Flag for Escalation - Recommend conversion to Escalated CTR (Analysis)
                </Label>
              </div>
            </RadioGroup>

            {disposition === "ESCALATED" && (
              <div>
                <Label htmlFor="justification">
                  Escalation Justification (required if flagging)
                </Label>
                <Textarea
                  id="justification"
                  placeholder="Enter justification..."
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  className="mt-2"
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Link to="/compliance/ctr-review">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button
                onClick={handleSubmitDecision}
                disabled={saving || !disposition || (disposition === "ESCALATED" && !escalationReason)}
              >
                {saving ? "Submitting..." : "Submit Decision"}
              </Button>
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}