import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ValidationQueue from "./pages/compliance/ValidationQueue";
import CTRReview from "./pages/compliance/CTRReview";
import AnalysisQueue from "./pages/analysis/AnalysisQueue";
import SubmitReport from "./pages/reporting-entity/SubmitReport";
import MySubmissions from "./pages/reporting-entity/MySubmissions";
import SubmissionDetail from "./pages/reporting-entity/SubmissionDetail";
import Resubmissions from "./pages/reporting-entity/Resubmissions";
import Statistics from "./pages/reporting-entity/Statistics";

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
              <Route path="/" element={<Index />} />
              {/* Reporting Entity Workspace Routes (f2.md Section 2.1) */}
              <Route path="/submit" element={<SubmitReport />} />
              <Route path="/submissions" element={<MySubmissions />} />
              <Route path="/submissions/:id" element={<SubmissionDetail />} />
              <Route path="/resubmissions" element={<Resubmissions />} />
              <Route path="/statistics" element={<Statistics />} />
              {/* Compliance Workspace Routes (f2.md Section 2.2) */}
              <Route path="/validation" element={<ValidationQueue />} />
              <Route path="/ctr-review" element={<CTRReview />} />
              {/* Analysis Workspace Routes (f2.md Section 2.3) */}
              <Route path="/analysis-queue" element={<AnalysisQueue />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SidebarProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
