import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Upload, FileText, Download, Link2, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function SubmitReport() {
  const [reportType, setReportType] = useState<"STR" | "CTR">("STR");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success">("idle");
  const [successRefNumber, setSuccessRefNumber] = useState("");
  const [apiStatusDialogOpen, setApiStatusDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const breadcrumbItems = [
    { label: "Reporting Entity Workspace", icon: <FileText className="h-5 w-5" /> },
    { label: "Submit Report" },
  ];

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

  const handleUpload = () => {
    if (!selectedFile) return;
    
    setUploadStatus("uploading");
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadStatus("success");
            setSuccessRefNumber(`FIA-2026-${Math.floor(Math.random() * 9000) + 1000}`);
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleUploadComplete = () => {
    setUploadDialogOpen(false);
    setUploadStatus("idle");
    setUploadProgress(0);
    setSelectedFile(null);
    setSuccessRefNumber("");
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
              <RadioGroup value={reportType} onValueChange={(value) => setReportType(value as "STR" | "CTR")}>
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
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
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
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download .xlsx
                </Button>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {uploadStatus === "uploading" ? "Uploading Report..." : 
                 uploadStatus === "success" ? "Report Submitted Successfully" : 
                 "Upload Report"}
              </DialogTitle>
            </DialogHeader>

            {uploadStatus === "idle" && (
              <>
                <DialogDescription>
                  Report Type: {reportType === "STR" ? "STR (Suspicious Transaction Report)" : "CTR (Currency Transaction Report)"}
                </DialogDescription>
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="font-medium mb-1">Drag and drop file here</p>
                    <p className="text-sm text-muted-foreground mb-4">or</p>
                    <Button>Browse Files</Button>
                    <Input
                      id="file-upload"
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
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm font-medium">Selected: {selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-2">
                    <p className="text-sm font-medium">ℹ️ Important Notes:</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Ensure all mandatory fields are completed</li>
                      <li>Use the latest template version (2.0)</li>
                      <li>Check data formats match requirements</li>
                      <li>Review your submission before uploading</li>
                    </ul>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpload} disabled={!selectedFile}>
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
                <div className="text-center py-4">
                  <CheckCircle2 className="h-16 w-16 mx-auto text-green-600 mb-4" />
                  <p className="text-lg font-semibold mb-4">Your report has been submitted</p>
                </div>

                <div className="space-y-2 bg-muted p-4 rounded-md">
                  <p><span className="font-medium">Reference Number:</span> {successRefNumber}</p>
                  <p><span className="font-medium">Report Type:</span> {reportType}</p>
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

                <div className="space-y-2">
                  <p className="text-sm font-medium">📧 A confirmation email has been sent to:</p>
                  <p className="text-sm text-muted-foreground">compliance@bankofmonrovia.lr</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-2">
                  <p className="text-sm font-medium">Next Steps:</p>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Your report will undergo automated validation</li>
                    <li>You will be notified of the validation outcome</li>
                    <li>Track status in "My Submissions"</li>
                  </ul>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleUploadComplete}>
                    Submit Another
                  </Button>
                  <Button onClick={handleUploadComplete}>
                    View Submission
                  </Button>
                </div>
              </div>
            )}
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
                  <CardTitle className="text-base">📊 Recent API Activity (Last 7 Days)</CardTitle>
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
                <p className="font-medium">📋 API Credentials</p>
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
                <p className="font-medium">📄 Documentation:</p>
                <Button variant="link" className="p-0 h-auto">
                  View API Documentation
                </Button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm font-medium mb-1">⚠️ Need Help?</p>
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