import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, ArrowLeft, Download, Upload, Loader2 } from "lucide-react";
import { useValidationResult, useValidationErrors } from "@/hooks/useValidation";
import { format } from "date-fns";

export default function ValidationErrorReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: result, isLoading: resultLoading, error: resultError } = useValidationResult(id || "");
  const { data: errors, isLoading: errorsLoading } = useValidationErrors(id || "");

  const breadcrumbItems = [
    { label: "Reporting", href: "/submissions" },
    { label: "Submission", href: `/submissions/${id}` },
    { label: "Validation Error Report", href: "#" },
  ];

  const handleDownload = () => {
    // In real app: generate CSV/PDF of errors
    window.open("#", "_blank");
  };

  if (resultLoading || errorsLoading) {
    return (
      <MainLayout>
        <div className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading error report...</p>
        </div>
      </MainLayout>
    );
  }

  if (resultError || !result) {
    return (
      <MainLayout>
        <div className="p-6">
          <Card className="border-destructive">
            <CardContent className="p-6 text-center">
              <p className="text-destructive font-medium">Failed to load error report</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/submissions")}>
                Back to Submissions
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <Button variant="ghost" onClick={() => navigate("/submissions")} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Submissions
        </Button>

        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold">Validation Error Report</h1>
            <div className="text-sm text-muted-foreground space-y-1 mt-2">
              <p><strong>Reference:</strong> {result.reference_number}</p>
              <p><strong>Report Type:</strong> {result.report_type}</p>
              <p><strong>Submitted:</strong> {format(new Date(result.submitted_at), "yyyy-MM-dd HH:mm:ss")}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Validation failed</p>
                <p className="text-sm text-red-700 mt-1">
                  {errors?.length || 0} error(s) found. Please fix and resubmit.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Errors ({errors?.length || 0})</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>Error</TableHead>
                    <TableHead>Row</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errors && errors.length > 0 ? (
                    errors.map((e, i) => (
                      <TableRow key={i}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell className="font-medium">{e.field}</TableCell>
                        <TableCell className="text-destructive">{e.message}</TableCell>
                        <TableCell>{e.row || "N/A"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No detailed errors found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download Error Report
              </Button>
              <Button onClick={() => navigate("/submit")}>
                <Upload className="h-4 w-4 mr-2" />
                Resubmit Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
