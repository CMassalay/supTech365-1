import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FileText, ArrowLeft, Download, CheckCircle2, XCircle, AlertCircle, Clock, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, ReportTypeBadge } from "@/components/ui/StatusBadge";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface TimelineEvent {
  stage: string;
  timestamp: string;
  duration?: string;
  actor?: string;
  completed: boolean;
  current?: boolean;
}

// Mock data - in real app, this would come from API based on submission ID
const getSubmissionData = (id: string) => {
  // Simulate different submission states
  if (id === "1") {
    return {
      referenceNumber: "FIA-2026-0234",
      reportType: "STR" as const,
      status: "submitted" as const,
      submittedDate: "January 20, 2026 at 14:32",
      submittedBy: "John Mensah (compliance@bank...)",
      submissionMethod: "Excel Upload" as const,
      transactionCount: 8,
      currentStage: "Awaiting Validation",
      timeline: [
        {
          stage: "Submitted",
          timestamp: "Jan 20, 14:32",
          completed: true,
        },
      ] as TimelineEvent[],
      summary: {
        primarySubject: "Sarah Konneh",
        subjectType: "Individual",
        accountNumber: "••••••5678",
        dateRange: "Dec 15, 2025 - Jan 18, 2026",
        currency: "USD",
      },
      attachments: [
        { name: "STR_BankOfMonrovia_2026-01-20.xlsx", size: "2.4 MB" },
      ],
    };
  } else if (id === "2") {
    return {
      referenceNumber: "FIA-2026-0233",
      reportType: "CTR" as const,
      status: "validated" as const,
      submittedDate: "January 20, 2026 at 09:15",
      submittedBy: "System (API Integration)",
      submissionMethod: "API Integration" as const,
      transactionCount: 5,
      currentStage: "Under Compliance Review",
      timeline: [
        {
          stage: "Submitted",
          timestamp: "Jan 20, 09:15",
          completed: true,
        },
        {
          stage: "Automated Validation",
          timestamp: "Jan 20, 09:15",
          duration: "10 sec",
          completed: true,
        },
        {
          stage: "Manual Validation",
          timestamp: "Jan 20, 09:45",
          actor: "Data Clerk Sarah Johnson",
          completed: true,
        },
        {
          stage: "Under Compliance Review",
          timestamp: "Jan 20, 10:00",
          actor: "Compliance Officer Jane Doe",
          completed: false,
          current: true,
        },
      ] as TimelineEvent[],
      summary: {
        primarySubject: "ABC Trading Company Ltd.",
        accountNumber: "••••••1234",
        dateRange: "Jan 15 - Jan 19, 2026",
        currency: "Mixed (USD, LRD)",
      },
      processingTime: {
        currentStage: "4 hours 32 minutes",
        total: "4 hours 45 minutes",
      },
      attachments: [
        { name: "API_Submission_FIA-2026-0233.xml", size: "1.2 MB" },
      ],
    };
  } else if (id === "5") {
    return {
      referenceNumber: "FIA-2026-0230",
      reportType: "STR" as const,
      status: "rejected" as const,
      submittedDate: "January 18, 2026 at 14:10",
      submittedBy: "John Mensah (compliance@bank...)",
      submissionMethod: "Excel Upload" as const,
      transactionCount: 7,
      rejectionDetails: {
        rejectedAt: "January 18, 2026 at 14:11",
        rejectedBy: "System (Automated Validation)",
        reason: "Validation Errors (3 errors found)",
        errors: [
          {
            id: 1,
            type: "Missing Mandatory Field",
            field: "Beneficiary Name",
            location: "Row 3, Transaction ID: TXN-003",
            error: "This field is required and cannot be empty",
          },
          {
            id: 2,
            type: "Invalid Data Type",
            field: "Transaction Amount",
            location: "Row 5, Transaction ID: TXN-005",
            error: 'Expected numeric value, found "Five Thousand"',
            expectedFormat: "5000.00",
          },
          {
            id: 3,
            type: "Invalid Date Format",
            field: "Transaction Date",
            location: "Row 7, Transaction ID: TXN-007",
            error: "Date format incorrect",
            found: "20/01/2026",
            expectedFormat: "YYYY-MM-DD (e.g., 2026-01-20)",
          },
        ],
      },
      attachments: [
        { name: "STR_BankOfMonrovia_2026-01-18.xlsx", size: "1.8 MB" },
      ],
    };
  } else {
    return {
      referenceNumber: "FIA-2026-0236",
      reportType: "CTR" as const,
      status: "returned" as const,
      submittedDate: "January 20, 2026 at 08:30",
      submittedBy: "System (API Integration)",
      submissionMethod: "API Integration" as const,
      transactionCount: 12,
      attempts: 1,
      timeline: [
        {
          stage: "Submitted",
          timestamp: "Jan 20, 08:30",
          completed: true,
        },
        {
          stage: "Automated Validation",
          timestamp: "Jan 20, 08:30",
          duration: "9 sec",
          completed: true,
        },
        {
          stage: "Manual Validation",
          timestamp: "Jan 20, 09:15",
          actor: "Data Clerk Sarah Johnson",
          completed: false,
          current: true,
        },
      ] as TimelineEvent[],
      correctionDetails: {
        returnedAt: "January 20, 2026 at 09:15",
        returnedBy: "Data Clerk Sarah Johnson",
        reason: "Subject identification incomplete. Transactions 1, 4, 7, and 9 contain business names without corresponding business registration numbers or tax ID numbers as required by the CTR template. Please update your API integration to include mandatory business identification fields for all entity subjects.",
        deadline: "January 27, 2026 (5 business days)",
      },
      attachments: [
        { name: "API_Submission_FIA-2026-0236.xml", size: "1.8 MB" },
      ],
    };
  }
};

export default function SubmissionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  if (!id) {
    return <div>Submission not found</div>;
  }

  const submission = getSubmissionData(id);
  const breadcrumbItems = [
    { label: "Reporting Entity Workspace", icon: <FileText className="h-5 w-5" /> },
    { label: "My Submissions", href: "/submissions" },
    { label: submission.referenceNumber },
  ];

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate("/submissions")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Submissions
        </Button>

        {/* Submission Details Card */}
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
                <p className="text-base">{submission.referenceNumber}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Report Type:</span>
                <p className="text-base">
                  {submission.reportType} ({submission.reportType === "STR" ? "Suspicious Transaction Report" : "Currency Transaction Report"})
                </p>
              </div>
              <div>
                <span className="text-sm font-medium">Status:</span>
                <div className="mt-1">
                  <StatusBadge status={submission.status} />
                </div>
              </div>
              {submission.currentStage && (
                <div>
                  <span className="text-sm font-medium">Current Stage:</span>
                  <p className="text-base">{submission.currentStage}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium">Submitted:</span>
                <p className="text-base">{submission.submittedDate}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Submitted By:</span>
                <p className="text-base">{submission.submittedBy}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Submission Method:</span>
                <p className="text-base">{submission.submissionMethod}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Transaction Count:</span>
                <p className="text-base">{submission.transactionCount} transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Timeline */}
        {submission.timeline && submission.timeline.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Workflow Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {submission.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      {event.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : event.current ? (
                        <div className="h-5 w-5 rounded-full border-2 border-primary bg-primary" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                      {index < submission.timeline.length - 1 && (
                        <div className={`w-0.5 h-12 ${event.completed ? "bg-gray-300" : "bg-gray-200"}`} />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${event.current ? "text-primary" : ""}`}>
                          {event.completed ? "✓" : event.current ? "●" : ""} {event.stage}
                        </span>
                        <span className="text-sm text-muted-foreground">{event.timestamp}</span>
                        {event.duration && (
                          <Badge variant="outline" className="text-xs">
                            {event.duration}
                          </Badge>
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
        )}

        {/* Report Summary */}
        {submission.summary && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Report Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">Primary Subject:</span>
                  <p className="text-base">{submission.summary.primarySubject}</p>
                </div>
                {submission.summary.subjectType && (
                  <div>
                    <span className="text-sm font-medium">Subject Type:</span>
                    <p className="text-base">{submission.summary.subjectType}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium">Account Number:</span>
                  <p className="text-base">{submission.summary.accountNumber}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Date Range:</span>
                  <p className="text-base">{submission.summary.dateRange}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Currency:</span>
                  <p className="text-base">{submission.summary.currency}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processing Time */}
        {submission.processingTime && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Processing Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">Time in Current Stage:</span>
                  <p className="text-base">{submission.processingTime.currentStage}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Total Processing Time:</span>
                  <p className="text-base">{submission.processingTime.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rejection Details */}
        {submission.rejectionDetails && (
          <>
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <XCircle className="h-5 w-5" />
                  Rejection Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium">Rejected At:</span>
                    <p className="text-base">{submission.rejectionDetails.rejectedAt}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Rejected By:</span>
                    <p className="text-base">{submission.rejectionDetails.rejectedBy}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-sm font-medium">Reason:</span>
                    <p className="text-base">{submission.rejectionDetails.reason}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <p className="font-medium">Validation Errors:</p>
                  {submission.rejectionDetails.errors.map((error) => (
                    <div key={error.id} className="bg-white p-4 rounded-md border border-red-200">
                      <p className="font-medium text-red-900 mb-2">
                        {error.id}. ❌ {error.type}
                      </p>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Field:</span> {error.field}</p>
                        <p><span className="font-medium">Location:</span> {error.location}</p>
                        <p><span className="font-medium">Error:</span> {error.error}</p>
                        {error.found && (
                          <p><span className="font-medium">Found:</span> {error.found}</p>
                        )}
                        {(error.expectedFormat || error.found) && (
                          <p><span className="font-medium">Expected Format:</span> {error.expectedFormat}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-2">
                  <p className="font-medium">📋 How to Fix</p>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>Download the original submission file below</li>
                    <li>Correct the errors listed above</li>
                    <li>Ensure all mandatory fields are completed</li>
                    <li>Verify data formats match requirements</li>
                    <li>Submit the corrected report as a new submission</li>
                  </ol>
                  <p className="text-sm mt-2">
                    📄 Need help? View the <Button variant="link" className="p-0 h-auto">STR Template Guide</Button>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Original Submission
                </CardTitle>
              </CardHeader>
              <CardContent>
                {submission.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">Size: {file.size}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => navigate("/submit")}>Submit New Report</Button>
            </div>
          </>
        )}

        {/* Correction Required Details */}
        {submission.correctionDetails && (
          <>
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-900">
                  <AlertCircle className="h-5 w-5" />
                  Correction Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium">Returned At:</span>
                    <p className="text-base">{submission.correctionDetails.returnedAt}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Returned By:</span>
                    <p className="text-base">{submission.correctionDetails.returnedBy}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="font-medium mb-2">Reason for Return:</p>
                  <p className="text-sm bg-white p-3 rounded-md border">{submission.correctionDetails.reason}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="space-y-2 list-decimal list-inside">
                  <li>Download original submission below for reference</li>
                  {submission.submissionMethod === "API Integration" ? (
                    <>
                      <li>Update your system data or API integration</li>
                      <li>Include all required identification fields</li>
                      <li>Resubmit via API with corrections</li>
                    </>
                  ) : (
                    <>
                      <li>Correct data in your core banking system</li>
                      <li>Have your IT team resubmit via API</li>
                    </>
                  )}
                </ol>

                {submission.submissionMethod === "API Integration" && (
                  <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
                    <p className="font-medium">API Resubmission:</p>
                    <p><code className="bg-background px-2 py-1 rounded">POST https://api.fia.gov.lr/v1/reports</code></p>
                    <p className="mt-2">Include in payload:</p>
                    <p><code className="bg-background px-2 py-1 rounded">"resubmission_of": "{submission.referenceNumber}"</code></p>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <p className="text-sm font-medium">⏱️ Deadline: {submission.correctionDetails.deadline}</p>
                </div>

                {submission.submissionMethod === "API Integration" && (
                  <div className="flex gap-2">
                    <Button variant="link" className="p-0 h-auto">📄 API Documentation</Button>
                    <Button variant="link" className="p-0 h-auto">💬 Contact Tech Support</Button>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm">
                    ℹ️ Note: API resubmissions should be sent to the standard submission endpoint with updated data. 
                    The original reference number will be automatically linked.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Original Submission
                </CardTitle>
              </CardHeader>
              <CardContent>
                {submission.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">Size: {file.size}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}

        {/* Attachments (for validated/submitted) */}
        {!submission.rejectionDetails && !submission.correctionDetails && submission.attachments && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submission.attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">Size: {file.size}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Info Note */}
        {submission.status !== "rejected" && submission.status !== "returned" && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm">ℹ️ Note: You will be notified when the status changes.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}