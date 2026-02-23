import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Upload, FileText, Download, Link2, CheckCircle2, X, Info, Mail, BarChart3, ClipboardList, Eye, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { submitExcelReport, downloadSubmissionTemplate, ApiError } from "@/lib/api";
import { toast } from "sonner";

const MAX_FILE_SIZE_MB = 10;

type ReportTypeOption = "STR" | "CTR";

export default function SubmitReport() {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState<ReportTypeOption>("STR");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success">("idle");
  const [successRefNumber, setSuccessRefNumber] = useState("");
  const [successTimestamp, setSuccessTimestamp] = useState("");
  const [apiStatusDialogOpen, setApiStatusDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [entityReference, setEntityReference] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [templateDownloading, setTemplateDownloading] = useState<"STR" | "CTR" | null>(null);

  const breadcrumbItems = [
    { label: "Reporting Entity Workspace", icon: <FileText className="h-5 w-5" /> },
    { label: "Submit Report" },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(`File must be under ${MAX_FILE_SIZE_MB}MB`);
        e.target.value = "";
        return;
      }
      if (!file.name.endsWith(".xlsx")) {
        toast.error("Please select an Excel file (.xlsx, Excel 2007+)");
        e.target.value = "";
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
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
    if (file) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(`File must be under ${MAX_FILE_SIZE_MB}MB`);
        return;
      }
      if (file.name.endsWith(".xlsx")) {
        setSelectedFile(file);
        setUploadError(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadError(null);
    setUploadStatus("uploading");
    setUploadProgress(20);

    try {
      const res = await submitExcelReport(
        selectedFile,
        reportType,
        entityReference.trim() || undefined
      );
      setUploadProgress(100);
      setSuccessRefNumber(res.reference);
      setSuccessTimestamp(res.timestamp || new Date().toISOString());
      setUploadStatus("success");
      toast.success(res.message || "Report submitted successfully.");
    } catch (err) {
      setUploadStatus("idle");
      setUploadProgress(0);
      const message = err instanceof ApiError ? err.message : "Upload failed. Please try again.";
      setUploadError(message);
      toast.error(message);
    }
  };

  const handleUploadComplete = () => {
    setUploadDialogOpen(false);
    setUploadStatus("idle");
    setUploadProgress(0);
    setSelectedFile(null);
    setSuccessRefNumber("");
    setSuccessTimestamp("");
    setUploadError(null);
  };

  const handleDownloadTemplate = async (reportType: "STR" | "CTR") => {
    setTemplateDownloading(reportType);
    try {
      await downloadSubmissionTemplate(reportType);
      toast.success(`${reportType} template downloaded.`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Download failed. Please try again.";
      toast.error(message);
    } finally {
      setTemplateDownloading(null);
    }
  };

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 space-y-6">
        <div>
          <h1>Submit Report</h1>
        </div>

        {/* Submit New Report Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Submit New Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Report Type Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Select Report Type:</Label>
              <RadioGroup value={reportType} onValueChange={(value) => setReportType(value as ReportTypeOption)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="STR" id="str" />
                  <Label htmlFor="str" className="font-normal cursor-pointer">
                    STR (Suspicious Transaction Report)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="CTR" id="ctr" />
                  <Label htmlFor="ctr" className="font-normal cursor-pointer">
                    CTR (Currency Transaction Report)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            {/* Submission Method */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Choose Submission Method:</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setUploadDialogOpen(true)}
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <FileText className="h-12 w-12 mx-auto text-primary" />
                    <div>
                      <h3 className="font-semibold">Excel Upload</h3>
                      <p className="text-sm text-muted-foreground mt-1">Upload your report file</p>
                    </div>
                    <Button className="w-full">Upload File</Button>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setApiStatusDialogOpen(true)}
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <Link2 className="h-12 w-12 mx-auto text-primary" />
                    <div>
                      <h3 className="font-semibold">API Integration</h3>
                      <p className="text-sm text-muted-foreground mt-1">View API status</p>
                    </div>
                    <Button variant="outline" className="w-full">View Status</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Download Templates Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">STR Template</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Suspicious Transaction Report Template</p>
                  <p className="text-xs text-muted-foreground mt-1">Version: 2.0 | Updated: Jan 2026</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={templateDownloading !== null}
                  onClick={() => handleDownloadTemplate("STR")}
                >
                  {templateDownloading === "STR" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download .xlsx
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">CTR Template</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Currency Transaction Report Template</p>
                  <p className="text-xs text-muted-foreground mt-1">Version: 2.0 | Updated: Jan 2026</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={templateDownloading !== null}
                  onClick={() => handleDownloadTemplate("CTR")}
                >
                  {templateDownloading === "CTR" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download .xlsx
                </Button>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl max-h-[85dvh] sm:max-h-[90vh] flex flex-col overflow-hidden p-4 sm:p-6 left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
            <DialogHeader className="shrink-0 pr-8">
              <DialogTitle className="text-base sm:text-lg">
                {uploadStatus === "uploading" ? "Uploading Report..." : 
                 uploadStatus === "success" ? "Report Submitted Successfully" : 
                 "Upload Report"}
              </DialogTitle>
            </DialogHeader>

            <div className="overflow-y-auto flex-1 min-h-0 -mx-4 px-4 sm:-mx-6 sm:px-6">
            {uploadStatus === "idle" && (
              <>
                <DialogDescription>
                  Report Type: {reportType === "STR" ? "STR (Suspicious Transaction Report)" : "CTR (Currency Transaction Report)"}
                </DialogDescription>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="entity-reference">Entity reference (optional)</Label>
                    <Input
                      id="entity-reference"
                      placeholder="Internal reference for tracking"
                      value={entityReference}
                      onChange={(e) => setEntityReference(e.target.value)}
                    />
                  </div>
                  <div
                    className="border-2 border-dashed rounded-lg p-6 sm:p-12 text-center cursor-pointer hover:border-primary transition-colors touch-manipulation"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <Upload className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                    <p className="font-medium mb-1 text-sm sm:text-base">Drag and drop file here</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">or</p>
                    <Button className="w-full sm:w-auto">Browse Files</Button>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".xlsx"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <p className="text-xs text-muted-foreground mt-3 sm:mt-4">
                      Accepted format: .xlsx (Excel 2007+)<br />
                      Maximum file size: {MAX_FILE_SIZE_MB}MB
                    </p>
                  </div>

                  {uploadError && (
                    <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
                      {uploadError}
                    </div>
                  )}

                  {selectedFile && (
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm font-medium">Selected: {selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  )}

                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-3 sm:p-4 space-y-2">
                    <p className="text-xs sm:text-sm font-medium flex items-center gap-2"><Info className="h-4 w-4 shrink-0" /> Important Notes:</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Ensure all mandatory fields are completed</li>
                      <li>Use the latest template version (2.0)</li>
                      <li>Check data formats match requirements</li>
                      <li>Review your submission before uploading</li>
                    </ul>
                  </div>

                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => setUploadDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button className="w-full sm:w-auto" onClick={handleUpload} disabled={!selectedFile}>
                      Upload Report
                    </Button>
                  </div>
                </div>
              </>
            )}

            {uploadStatus === "uploading" && (
              <div className="space-y-4">
                {selectedFile && (
                  <>
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Progress value={uploadProgress} />
                    <p className="text-sm text-muted-foreground text-center">Uploading file... Please wait.</p>
                  </>
                )}
              </div>
            )}

            {uploadStatus === "success" && (
              <div className="space-y-4">
                <div className="text-center py-2 sm:py-4">
                  <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-green-600 mb-3 sm:mb-4" />
                  <p className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Your report has been submitted</p>
                </div>

                <div className="space-y-2 bg-muted p-3 sm:p-4 rounded-md text-sm">
                  <p><span className="font-medium">Reference Number:</span> {successRefNumber}</p>
                  <p><span className="font-medium">Report Type:</span> {reportType}</p>
                  <p><span className="font-medium">Submitted:</span> {successTimestamp ? new Date(successTimestamp).toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : new Date().toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  <p><span className="font-medium">Status:</span> Submitted - Awaiting Validation</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" /> A confirmation email has been sent to:</p>
                  <p className="text-sm text-muted-foreground">compliance@bankofmonrovia.lr</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-3 sm:p-4 space-y-2">
                  <p className="text-xs sm:text-sm font-medium">Next Steps:</p>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Your report will undergo automated validation</li>
                    <li>You will be notified of the validation outcome</li>
                    <li>Track status in "My Submissions"</li>
                  </ul>
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button variant="outline" className="w-full sm:w-auto" onClick={handleUploadComplete}>
                    Submit Another
                  </Button>
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() => {
                      handleUploadComplete();
                      navigate("/submissions");
                    }}
                  >
                    View Submissions
                  </Button>
                </div>
              </div>
            )}
            </div>
          </DialogContent>
        </Dialog>

        {/* API Integration Status Dialog */}
        <Dialog open={apiStatusDialogOpen} onOpenChange={setApiStatusDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                API Integration Status
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">🔗 API Connection Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Active
                    </span>
                  </div>
                  <p><span className="font-medium">Last Connection:</span> January 20, 2026 at 14:15</p>
                  <p><span className="font-medium">API Version:</span> 1.0</p>
                  <p><span className="font-medium">Total Submissions (This Month):</span> 127</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Recent API Activity (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Date</th>
                          <th className="text-left p-2">Submissions</th>
                          <th className="text-left p-2">Success</th>
                          <th className="text-left p-2">Failed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { date: "Jan 20", submissions: 18, success: 18, failed: 0 },
                          { date: "Jan 19", submissions: 22, success: 22, failed: 0 },
                          { date: "Jan 18", submissions: 15, success: 14, failed: 1 },
                          { date: "Jan 17", submissions: 19, success: 19, failed: 0 },
                          { date: "Jan 16", submissions: 24, success: 23, failed: 1 },
                          { date: "Jan 15", submissions: 21, success: 21, failed: 0 },
                          { date: "Jan 14", submissions: 8, success: 8, failed: 0 },
                        ].map((row, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="p-2">{row.date}</td>
                            <td className="p-2">{row.submissions}</td>
                            <td className="p-2">{row.success}</td>
                            <td className="p-2">{row.failed}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <p className="font-medium flex items-center gap-2"><ClipboardList className="h-4 w-4" /> API Credentials</p>
                <div className="bg-muted p-3 rounded-md space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">API Key:</span>
                    <code className="flex-1">•••••••••••••••••••••••••••••3x7K</code>
                    <Button variant="ghost" size="sm">👁 Show</Button>
                  </div>
                  <div>
                    <span className="font-medium">Endpoint:</span>{" "}
                    <code>https://api.fia.gov.lr/v1/reports</code>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium flex items-center gap-2"><FileText className="h-4 w-4" /> Documentation:</p>
                <Button variant="link" className="p-0 h-auto">
                  View API Documentation
                </Button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm font-medium mb-1 flex items-center gap-2"><AlertTriangle className="h-4 w-4 shrink-0" /> Need Help?</p>
                <p className="text-xs text-muted-foreground">
                  Contact FIA Technical Support: tech-support@fia.gov.lr
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setApiStatusDialogOpen(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}