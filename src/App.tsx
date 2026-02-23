import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ProtectedLayout } from "@/components/auth/ProtectedLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ChangePasswordRequired from "./pages/auth/ChangePasswordRequired";
import RegisterEntity from "./pages/admin/RegisterEntity";
import CreateUser from "./pages/admin/CreateUser";
import CreateSuperAdmin from "./pages/admin/CreateSuperAdmin";
import RolesPage from "./pages/admin/RolesPage";
import ValidationQueue from "./pages/compliance/ValidationQueue";
import ValidationDetail from "./pages/compliance/ValidationDetail";
import AllValidations from "./pages/compliance/AllValidations";
import PendingValidations from "./pages/compliance/PendingValidations";
import AssignValidations from "./pages/compliance/AssignValidations";
import CTRReview from "./pages/compliance/CTRReview";
import CTRReviewDetail from "./pages/compliance/CTRReviewDetail";
import OverdueCTRs from "./pages/compliance/OverdueCTRs";
import AllCTRs from "./pages/compliance/AllCTRs";
import CTRPendingReview from "./pages/compliance/CTRPendingReview";
import CTRFlaggedForEscalation from "./pages/compliance/CTRFlaggedForEscalation";
import CTREscalated from "./pages/compliance/CTREscalated";
import CTRArchived from "./pages/compliance/CTRArchived";
import CTRUnderMonitoring from "./pages/compliance/CTRUnderMonitoring";
import EscalationQueue from "./pages/compliance/EscalationQueue";
import EscalationApprovalDetail from "./pages/compliance/EscalationApprovalDetail";
import WorkloadManagement from "./pages/compliance/WorkloadManagement";
import AssignCTRs from "./pages/compliance/AssignCTRs";
import ComplianceAlerts from "./pages/compliance/ComplianceAlerts";
import AlertRuleType from "./pages/compliance/AlertRuleType";
import AlertPerformanceMetrics from "./pages/compliance/AlertPerformanceMetrics";
import ProcessingMetrics from "./pages/compliance/ProcessingMetrics";
import EscalationRateTrends from "./pages/compliance/EscalationRateTrends";
import ValidationQualityMetrics from "./pages/compliance/ValidationQualityMetrics";
import EntityPerformance from "./pages/compliance/EntityPerformance";
import AnalysisQueue from "./pages/analysis/AnalysisQueue";
import SubmitReport from "./pages/reporting-entity/SubmitReport";
import MySubmissions from "./pages/reporting-entity/MySubmissions";
import SubmissionDetail from "./pages/reporting-entity/SubmissionDetail";
import ValidationResult from "./pages/reporting-entity/ValidationResult";
import ValidationErrorReport from "./pages/reporting-entity/ValidationErrorReport";
import Resubmissions from "./pages/reporting-entity/Resubmissions";
import Statistics from "./pages/reporting-entity/Statistics";
import MyEntityPage from "./pages/reporting-entity/MyEntityPage";
import ManualValidationQueue from "./pages/compliance/ManualValidationQueue";
import ReportReview from "./pages/compliance/ReportReview";
import ValidationAuditLogs from "./pages/compliance/ValidationAuditLogs";
import AssignmentQueuePage from "./pages/supervisor/AssignmentQueuePage";
import TeamWorkloadPage from "./pages/supervisor/TeamWorkloadPage";
import MyAssignmentsPage from "./pages/my-assignments/MyAssignmentsPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import EntitiesPage from "./pages/admin/EntitiesPage";
import EntityDetailPage from "./pages/admin/EntityDetailPage";
import AdminApiKeysPage from "./pages/admin/AdminApiKeysPage";
import SessionsPage from "./pages/admin/SessionsPage";
import ProfilePage from "./pages/profile/ProfilePage";
import SubjectSearchPage from "./pages/subjects/SubjectSearchPage";
import SubjectProfilePage from "./pages/subjects/SubjectProfilePage";
import ApiCredentialsPage from "./pages/reporting-entity/ApiCredentialsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SidebarProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes: unauthenticated users see these first */}
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* All other routes require auth; redirect to /login if not authenticated */}
              <Route element={<ProtectedLayout />}>
                <Route path="/change-password-required" element={<ChangePasswordRequired />} />
                <Route
                  path="/admin/entities/register"
                  element={
                    <ProtectedRoute requiredRole={["tech_admin", "super_admin"]}>
                      <RegisterEntity />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users/create"
                  element={
                    <ProtectedRoute requiredRole={["tech_admin", "super_admin"]}>
                      <CreateUser />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/super-admin"
                  element={
                    <ProtectedRoute requiredRole={["tech_admin", "super_admin"]}>
                      <CreateSuperAdmin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/roles"
                  element={
                    <ProtectedRoute requiredRole={["tech_admin", "super_admin"]}>
                      <RolesPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Index />} />
              {/* Task Assignment & Workload (FDD Feature 6) - defined early so path matches */}
              <Route
                path="/supervisor/assignment-queue"
                element={
                  <ProtectedRoute requiredRole={["head_of_compliance", "head_of_analysis", "super_admin"]}>
                    <AssignmentQueuePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/supervisor/workload"
                element={
                  <ProtectedRoute requiredRole={["head_of_compliance", "head_of_analysis", "super_admin"]}>
                    <TeamWorkloadPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-assignments"
                element={
                  <ProtectedRoute requiredRole={["compliance_officer", "analyst"]}>
                    <MyAssignmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route
                path="/entities"
                element={
                  <ProtectedRoute requiredRole={["tech_admin", "super_admin"]}>
                    <EntitiesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/entities/:id"
                element={
                  <ProtectedRoute requiredRole={["tech_admin", "super_admin"]}>
                    <EntityDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/api-keys"
                element={
                  <ProtectedRoute requiredRole={["tech_admin", "super_admin"]}>
                    <AdminApiKeysPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sessions"
                element={
                  <ProtectedRoute requiredRole={["tech_admin", "super_admin"]}>
                    <SessionsPage />
                  </ProtectedRoute>
                }
              />
              {/* Reporting Entity Workspace Routes (f2.md Section 2.1) */}
              <Route path="/submit" element={<SubmitReport />} />
              <Route path="/my-entity" element={<MyEntityPage />} />
              <Route path="/submissions" element={<MySubmissions />} />
              <Route path="/submissions/:id" element={<SubmissionDetail />} />
              <Route path="/submissions/:id/result" element={<ValidationResult />} />
              <Route path="/submissions/:id/errors" element={<ValidationErrorReport />} />
              <Route path="/resubmissions" element={<Resubmissions />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/api-credentials" element={<ApiCredentialsPage />} />
              {/* Subject Profiling (FDD Feature 7) */}
              <Route path="/subjects" element={<SubjectSearchPage />} />
              <Route path="/subjects/:uuid" element={<SubjectProfilePage />} />
              {/* Compliance Workspace Routes (f2.md Section 2.2) */}
              <Route path="/compliance/validation" element={<ValidationQueue />} />
              <Route path="/compliance/validation/pending" element={<PendingValidations />} />
              <Route path="/compliance/validation/assign" element={<AssignValidations />} />
              <Route path="/compliance/validation/all" element={<AllValidations />} />
              <Route path="/compliance/validation/:reportId/validate" element={<ValidationDetail />} />
              <Route path="/compliance/validation-queue" element={<ManualValidationQueue />} />
              <Route path="/compliance/validation-queue/:submissionId" element={<ReportReview />} />
              <Route path="/compliance/validation-audit-logs" element={<ValidationAuditLogs />} />
              <Route path="/compliance/ctr-review" element={<CTRReview />} />
              <Route path="/compliance/ctr-review/all" element={<AllCTRs />} />
              <Route path="/compliance/ctr-review/overdue" element={<OverdueCTRs />} />
              <Route path="/compliance/ctr-review/pending" element={<CTRPendingReview />} />
              <Route path="/compliance/ctr-review/flagged" element={<CTRFlaggedForEscalation />} />
              <Route path="/compliance/ctr-review/escalated" element={<CTREscalated />} />
              <Route path="/compliance/ctr-review/archived" element={<CTRArchived />} />
              <Route path="/compliance/ctr-review/monitoring" element={<CTRUnderMonitoring />} />
              <Route path="/compliance/ctr-review/:reportId/review" element={<CTRReviewDetail />} />
              {/* Legacy routes for backward compatibility */}
              <Route path="/ctr-review" element={<CTRReview />} />
              <Route path="/ctr-review/all" element={<AllCTRs />} />
              <Route path="/ctr-review/overdue" element={<OverdueCTRs />} />
              <Route path="/ctr-review/pending" element={<CTRPendingReview />} />
              <Route path="/ctr-review/flagged" element={<CTRFlaggedForEscalation />} />
              <Route path="/ctr-review/escalated" element={<CTREscalated />} />
              <Route path="/ctr-review/archived" element={<CTRArchived />} />
              <Route path="/ctr-review/monitoring" element={<CTRUnderMonitoring />} />
              <Route path="/ctr-review/:id/review" element={<CTRReviewDetail />} />
              <Route path="/compliance/escalation/pending" element={<EscalationQueue defaultTab="pending" />} />
              <Route path="/compliance/escalation/approved" element={<EscalationQueue defaultTab="approved" />} />
              <Route path="/compliance/escalation/rejected" element={<EscalationQueue defaultTab="rejected" />} />
              <Route path="/compliance/escalation/:reportId/escalate" element={<EscalationApprovalDetail />} />
              <Route path="/compliance/workload/dashboard" element={<WorkloadManagement />} />
              <Route path="/compliance/workload/assign" element={<AssignCTRs />} />
              {/* Legacy route */}
              <Route path="/compliance/workload" element={<WorkloadManagement />} />
              <Route path="/compliance/alerts/active" element={<ComplianceAlerts />} />
              <Route path="/compliance/alerts/performance" element={<AlertPerformanceMetrics />} />
              <Route path="/compliance/dashboards/processing" element={<ProcessingMetrics />} />
              <Route path="/compliance/dashboards/escalation" element={<EscalationRateTrends />} />
              <Route path="/compliance/dashboards/quality" element={<ValidationQualityMetrics />} />
              {/* Legacy routes for backward compatibility */}
              <Route path="/validation" element={<ValidationQueue />} />
              <Route path="/validation/all" element={<AllValidations />} />
              <Route path="/validation/:id/validate" element={<ValidationDetail />} />
              <Route path="/escalation" element={<EscalationQueue />} />
              <Route path="/escalation/:id/review" element={<EscalationApprovalDetail />} />
              <Route path="/workload" element={<WorkloadManagement />} />
              <Route path="/workload/assign" element={<AssignCTRs />} />
              <Route path="/compliance-alerts" element={<ComplianceAlerts />} />
              <Route path="/compliance-alerts/performance" element={<AlertPerformanceMetrics />} />
              <Route path="/processing-metrics" element={<ProcessingMetrics />} />
              <Route path="/processing-metrics/escalation-trends" element={<EscalationRateTrends />} />
              <Route path="/processing-metrics/validation-quality" element={<ValidationQualityMetrics />} />
              <Route path="/processing-metrics/entity-performance" element={<EntityPerformance />} />
              {/* Analysis Workspace Routes (f2.md Section 2.3) */}
              <Route path="/analysis-queue" element={<AnalysisQueue />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SidebarProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
