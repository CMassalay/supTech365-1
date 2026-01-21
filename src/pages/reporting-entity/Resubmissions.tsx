import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { RotateCcw, Eye, AlertCircle, Download, Calendar, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, ReportTypeBadge } from "@/components/ui/StatusBadge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Resubmission {
  id: string;
  referenceNumber: string;
  reportType: "CTR" | "STR";
  originalSubmissionDate: string;
  returnedDate: string;
  daysPending: number;
  deadline: string;
  isOverdue: boolean;
  reason: string;
  fileName: string;
  fileSize: string;
  submissionMethod: "excel" | "api";
}

const sampleResubmissions: Resubmission[] = [
  {
    id: "1",
    referenceNumber: "FIA-2026-0231",
    reportType: "CTR",
    originalSubmissionDate: "January 19, 2026 at 11:20",
    returnedDate: "January 19, 2026 at 12:05",
    daysPending: 1,
    deadline: "January 26, 2026",
    isOverdue: false,
    reason: "Date format inconsistent in transaction rows. Transactions 1-3 use DD/MM/YYYY format while transactions 4-7 use MM/DD/YYYY format. Please standardize all dates to YYYY-MM-DD format as specified in the template instructions.",
    fileName: "CTR_BankOfMonrovia_2026-01-19.xlsx",
    fileSize: "1.8 MB",
    submissionMethod: "excel",
  },
  {
    id: "2",
    referenceNumber: "FIA-2026-0228",
    reportType: "STR",
    originalSubmissionDate: "January 17, 2026 at 14:30",
    returnedDate: "January 18, 2026 at 09:15",
    daysPending: 2,
    deadline: "January 25, 2026",
    isOverdue: false,
    reason: "Missing mandatory field: Beneficiary Address. Transactions 2, 5, and 8 do not include the complete beneficiary address as required by the STR template.",
    fileName: "STR_BankOfMonrovia_2026-01-17.xlsx",
    fileSize: "2.1 MB",
    submissionMethod: "excel",
  },
  {
    id: "3",
    referenceNumber: "FIA-2026-0224",
    reportType: "CTR",
    originalSubmissionDate: "January 14, 2026 at 10:00",
    returnedDate: "January 15, 2026 at 11:20",
    daysPending: 5,
    deadline: "January 22, 2026",
    isOverdue: true,
    reason: "Transaction narrative unclear. Please provide detailed descriptions for transactions 3, 6, and 9 explaining the nature and purpose of each currency transaction.",
    fileName: "CTR_BankOfMonrovia_2026-01-14.xlsx",
    fileSize: "1.9 MB",
    submissionMethod: "excel",
  },
  {
    id: "4",
    referenceNumber: "FIA-2026-0236",
    reportType: "CTR",
    originalSubmissionDate: "January 20, 2026 at 08:30",
    returnedDate: "January 20, 2026 at 09:15",
    daysPending: 0,
    deadline: "January 27, 2026",
    isOverdue: false,
    reason: "Subject identification incomplete. Transactions 1, 4, 7, and 9 contain business names without corresponding business registration numbers or tax ID numbers as required by the CTR template.",
    fileName: "API_Submission_FIA-2026-0236.xml",
    fileSize: "1.8 MB",
    submissionMethod: "api",
  },
];

export default function Resubmissions() {
  const navigate = useNavigate();
  const [resubmitDialogOpen, setResubmitDialogOpen] = useState(false);
  const [selectedResubmission, setSelectedResubmission] = useState<Resubmission | null>(null);
  const [correctionsNotes, setCorrectionsNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resubmitSuccess, setResubmitSuccess] = useState(false);

  const breadcrumbItems = [
    { label: "Reporting Entity Workspace", icon: <RotateCcw className="h-5 w-5" /> },
    { label: "Resubmissions" },
  ];

  const handleResubmit = (resubmission: Resubmission) => {
    if (resubmission.submissionMethod === "api") {
      // For API submissions, navigate to detail view with instructions
      navigate(`/submissions/${resubmission.id}`);
    } else {
      // For Excel submissions, open resubmit dialog
      setSelectedResubmission(resubmission);
      setResubmitDialogOpen(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setSelectedFile(file);
    }
  };

  const handleSubmitResubmission = () => {
    // Simulate submission
    setResubmitSuccess(true);
  };

  const handleCloseSuccess = () => {
    setResubmitDialogOpen(false);
    setResubmitSuccess(false);
    setSelectedFile(null);
    setCorrectionsNotes("");
    setSelectedResubmission(null);
  };

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 space-y-6">
        <div>
          <h1>Resubmissions</h1>
        </div>

        {/* Info Alert */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>ℹ️ Reports Requiring Correction</strong>
            <p className="mt-1">
              These reports were returned by FIA and require corrections before they can be processed.
            </p>
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {sampleResubmissions.length} reports requiring resubmission
          </p>
        </div>

        {/* Resubmission Cards */}
        <div className="space-y-4">
          {sampleResubmissions.map((resubmission) => (
            <Card key={resubmission.id} className={resubmission.isOverdue ? "border-red-300 bg-red-50" : ""}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <AlertCircle className={`h-6 w-6 ${resubmission.isOverdue ? "text-red-600" : "text-yellow-600"}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">
                            {resubmission.isOverdue && (
                              <Badge variant="destructive" className="mr-2">OVERDUE</Badge>
                            )}
                            {resubmission.referenceNumber} ({resubmission.reportType})
                          </h3>
                        </div>
                        {resubmission.submissionMethod === "api" && (
                          <Badge variant="outline" className="mt-1">API Integration</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Original Submission:</span>
                      <p className="text-muted-foreground">{resubmission.originalSubmissionDate}</p>
                    </div>
                    <div>
                      <span className="font-medium">Returned:</span>
                      <p className="text-muted-foreground">{resubmission.returnedDate}</p>
                    </div>
                    <div>
                      <span className="font-medium">Days Pending:</span>
                      <p className={resubmission.isOverdue ? "text-red-600 font-semibold" : ""}>
                        {resubmission.daysPending} day{resubmission.daysPending !== 1 ? "s" : ""} 
                        {resubmission.isOverdue ? " (OVERDUE)" : ` (${5 - resubmission.daysPending} days remaining)`}
                      </p>
                    </div>
                  </div>

                  {resubmission.isOverdue && (
                    <Alert className="bg-red-100 border-red-300">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-900">
                        ⚠️ This resubmission deadline has passed. Please contact FIA if you need an extension.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <p className="font-medium mb-2">Reason:</p>
                    <p className="text-sm text-muted-foreground bg-white p-3 rounded-md border">
                      "{resubmission.reason}"
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-2">Original File:</p>
                    <div className="flex items-center justify-between bg-white p-3 rounded-md border">
                      <div className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-primary" />
                        <span className="text-sm">{resubmission.fileName}</span>
                        <span className="text-xs text-muted-foreground">({resubmission.fileSize})</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/submissions/${resubmission.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    {resubmission.submissionMethod === "excel" && (
                      <Button onClick={() => handleResubmit(resubmission)}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Resubmit Now
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-900 text-sm">
            ℹ️ All resubmissions should be completed within 5 business days of receiving the return notification.
          </AlertDescription>
        </Alert>

        {/* Resubmit Dialog */}
        <Dialog open={resubmitDialogOpen} onOpenChange={setResubmitDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {resubmitSuccess ? "Resubmission Successful" : `Resubmit Report: ${selectedResubmission?.referenceNumber}`}
              </DialogTitle>
            </DialogHeader>

            {!resubmitSuccess ? (
              <>
                <DialogDescription>
                  <div className="space-y-2 mb-4">
                    <p><span className="font-medium">Original Report:</span> {selectedResubmission?.referenceNumber}</p>
                    <p><span className="font-medium">Type:</span> {selectedResubmission?.reportType} ({selectedResubmission?.reportType === "STR" ? "Suspicious Transaction Report" : "Currency Transaction Report"})</p>
                    <p><span className="font-medium">Original Submission:</span> {selectedResubmission?.originalSubmissionDate}</p>
                  </div>
                </DialogDescription>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Corrections Made:</label>
                    <p className="text-xs text-muted-foreground mb-2">(Please describe the corrections you made)</p>
                    <Textarea
                      placeholder="• Standardized all transaction dates to YYYY-MM-DD format as required&#10;• Completed beneficiary full name in Transaction 5&#10;• Reviewed all other fields for accuracy"
                      value={correctionsNotes}
                      onChange={(e) => setCorrectionsNotes(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Upload Corrected File:</label>
                    <div
                      className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById("resubmit-file-upload")?.click()}
                    >
                      <Download className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="font-medium mb-1">Drag and drop file here</p>
                      <p className="text-sm text-muted-foreground mb-4">or</p>
                      <Button variant="outline">Browse Files</Button>
                      <Input
                        id="resubmit-file-upload"
                        type="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <p className="text-xs text-muted-foreground mt-4">
                        Accepted formats: .xlsx, .xls<br />
                        Maximum file size: 25MB
                      </p>
                    </div>

                    {selectedFile && (
                      <div className="bg-muted p-3 rounded-md mt-2">
                        <p className="text-sm font-medium">Selected: {selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    )}
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-sm">
                      ℹ️ Important:
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>This will be recorded as Resubmission #1</li>
                        <li>Your corrections will be verified during validation</li>
                        <li>You will receive notification of the outcome</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setResubmitDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitResubmission} disabled={!selectedFile || !correctionsNotes}>
                      Submit Resubmission
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <CheckCircle2 className="h-16 w-16 mx-auto text-green-600 mb-4" />
                  <p className="text-lg font-semibold mb-4">Your corrected report has been submitted</p>
                </div>

                <div className="space-y-2 bg-muted p-4 rounded-md">
                  <p><span className="font-medium">Original Reference:</span> {selectedResubmission?.referenceNumber}</p>
                  <p><span className="font-medium">Resubmission:</span> #1</p>
                  <p><span className="font-medium">Submitted:</span> {new Date().toLocaleString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                  <p><span className="font-medium">Status:</span> Submitted - Awaiting Validation</p>
                </div>

                <Separator />

                <div>
                  <p className="font-medium mb-2">Your Corrections:</p>
                  <div className="bg-white p-3 rounded-md border whitespace-pre-wrap text-sm">
                    {correctionsNotes || "No corrections noted"}
                  </div>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <AlertDescription className="text-sm">
                    Next Steps:
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Your resubmission will undergo validation</li>
                      <li>You will be notified of the outcome</li>
                      <li>Track status in "My Submissions"</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleCloseSuccess}>
                    Close
                  </Button>
                  <Button onClick={() => {
                    handleCloseSuccess();
                    navigate("/submissions");
                  }}>
                    View Submission
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}