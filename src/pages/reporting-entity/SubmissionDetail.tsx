import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FileText, ArrowLeft, Info, Loader2, Clock, Check, Circle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { WorkflowStatus } from "@/components/ui/StatusBadge";
import { getSubmissionStatus, ApiError } from "@/lib/api";
import type { SubmissionStatusResponse } from "@/lib/api";

function formatSubmittedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return iso.slice(0, 19).replace("T", " ");
  }
}

interface TimelineEvent {
  stage: string;
  timestamp: string;
  duration?: string;
  actor?: string;
  completed: boolean;
  current?: boolean;
}

/** Build a placeholder workflow timeline from submission status (dummy UI until API provides real workflow). */
function buildWorkflowTimeline(submission: SubmissionStatusResponse): TimelineEvent[] {
  const submittedShort = formatSubmittedAt(submission.submitted_at).replace(/^(\d{1,2}) (\w+) (\d{4}).*/, "$2 $1, $3").replace(/, \d{2}:\d{2}$/, "");
  const statusLower = (submission.status || "").toLowerCase().replace(/\s+/g, "_");
  const stages: TimelineEvent[] = [
    { stage: "Submitted", timestamp: submittedShort, completed: true },
  ];
  if (["submitted", "pending", "awaiting_validation", ""].includes(statusLower)) {
    stages.push({ stage: "Awaiting Validation", timestamp: "—", completed: false, current: true });
  } else {
    stages.push({ stage: "Automated Validation", timestamp: submittedShort, duration: "—", completed: true });
    stages.push({ stage: "Manual Validation", timestamp: "—", completed: false, current: true });
  }
  return stages;
}

export default function SubmissionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<SubmissionStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getSubmissionStatus(id)
      .then((data) => {
        if (!cancelled) setSubmission(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load submission.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!id) {
    return (
      <MainLayout>
        <div className="p-6">Submission not found.</div>
      </MainLayout>
    );
  }

  const breadcrumbItems = [
    { label: "Reporting Entity Workspace", icon: <FileText className="h-5 w-5" /> },
    { label: "My Submissions", href: "/submissions" },
    { label: submission?.reference ?? id },
  ];

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate("/submissions")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Submissions
        </Button>

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading submission…
          </div>
        )}

        {error && (
          <Card className="border-destructive/50">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate("/submissions")}>
                Back to My Submissions
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && !error && submission && (() => {
          const timeline = buildWorkflowTimeline(submission);
          return (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Submission Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium">Reference Number:</span>
                    <p className="text-base">{submission.reference}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Report Type:</span>
                    <p className="text-base">
                      {submission.report_type}{" "}
                      {submission.report_type === "STR"
                        ? "(Suspicious Transaction Report)"
                        : submission.report_type === "CTR"
                          ? "(Currency Transaction Report)"
                          : ""}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Status:</span>
                    <div className="mt-1">
                      <StatusBadge status={(submission.status || "submitted") as WorkflowStatus} />
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Submitted:</span>
                    <p className="text-base">{formatSubmittedAt(submission.submitted_at)}</p>
                  </div>
                  {submission.last_updated_at && (
                    <div>
                      <span className="text-sm font-medium">Last Updated:</span>
                      <p className="text-base">{formatSubmittedAt(submission.last_updated_at)}</p>
                    </div>
                  )}
                  {submission.entity_report_id && (
                    <div>
                      <span className="text-sm font-medium">Entity Report ID:</span>
                      <p className="text-base">{submission.entity_report_id}</p>
                    </div>
                  )}
                </div>
                {submission.notes && (
                  <div className="pt-2 border-t">
                    <span className="text-sm font-medium">Notes:</span>
                    <p className="text-base mt-1">{submission.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Workflow Timeline (placeholder UI; real data when API provides it) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Workflow Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.map((event, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          {event.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : event.current ? (
                            <div className="h-5 w-5 rounded-full border-2 border-primary bg-primary" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-border" />
                          )}
                          {index < timeline.length - 1 && (
                            <div className={`w-0.5 h-12 ${event.completed ? "bg-muted-foreground/30" : "bg-muted"}`} />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-medium ${event.current ? "text-primary" : ""}`}>
                              {event.completed ? <Check className="h-4 w-4 inline shrink-0" /> : event.current ? <Circle className="h-2.5 w-2.5 fill-current inline shrink-0" /> : null} {event.stage}
                            </span>
                            <span className="text-sm text-muted-foreground">{event.timestamp}</span>
                            {event.duration && (
                              <span className="text-xs text-muted-foreground">({event.duration})</span>
                            )}
                          </div>
                          {event.actor && (
                            <p className="text-sm text-muted-foreground">
                              {event.stage.includes("Validation") ? "Validated by:" : "Assigned to:"} {event.actor}
                            </p>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="bg-muted/50 border rounded-md p-4 flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                You will be notified when the status of this submission changes.
              </p>
            </div>
          </>
          );
        })()}
      </div>
    </MainLayout>
  );
}
