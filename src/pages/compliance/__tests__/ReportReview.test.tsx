import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReportReview from "../ReportReview";
import { BrowserRouter } from "react-router-dom";
import * as manualValidationHooks from "@/hooks/useManualValidation";
import { useValidationStore } from "@/hooks/useValidationStore";
import { mockReportContent } from "@/test/fixtures/manualValidation";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the hooks
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ submissionId: "uuid-1" }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock("@/contexts/AuthContext", async () => {
  const actual = await vi.importActual("@/contexts/AuthContext");
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

vi.mock("@/hooks/useManualValidation", () => ({
  useReportContent: vi.fn(),
  useSubmitDecision: vi.fn(),
}));

vi.mock("@/hooks/useValidationStore", () => ({
  useValidationStore: vi.fn(),
}));

// Mock useNotifications to avoid QueryClient requirement in TopNav
vi.mock("@/hooks/useNotifications", () => ({
  useNotifications: vi.fn(() => ({ data: [], isLoading: false })),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SidebarProvider>
            {ui}
          </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe("ReportReview", () => {
  const mockOpenDecisionModal = vi.fn();
  const mockSetSelectedSubmission = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      user: { role: "head_of_compliance", name: "Head User" },
      isAuthenticated: true,
    });
    (useValidationStore as any).mockReturnValue({
      decisionModalOpen: false,
      selectedDecisionType: null,
      openDecisionModal: mockOpenDecisionModal,
      closeDecisionModal: vi.fn(),
      setSelectedSubmission: mockSetSelectedSubmission,
    });
  });

  it("renders report metadata and transactions", () => {
    (manualValidationHooks.useReportContent as any).mockReturnValue({
      data: mockReportContent,
      isLoading: false,
    });
    (manualValidationHooks.useSubmitDecision as any).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    renderWithProviders(<ReportReview />);

    expect(screen.getByText("Report Review: FIA-2026-001234")).toBeInTheDocument();
    expect(screen.getByText("First Bank")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("opens the decision modal when clicking Accept", () => {
    (manualValidationHooks.useReportContent as any).mockReturnValue({
      data: mockReportContent,
      isLoading: false,
    });
    (manualValidationHooks.useSubmitDecision as any).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    renderWithProviders(<ReportReview />);

    const acceptButton = screen.getByRole("button", { name: /accept/i });
    fireEvent.click(acceptButton);

    expect(mockSetSelectedSubmission).toHaveBeenCalledWith("uuid-1");
    expect(mockOpenDecisionModal).toHaveBeenCalledWith("ACCEPT");
  });

  it("opens the decision modal when clicking Return for Correction", () => {
    (manualValidationHooks.useReportContent as any).mockReturnValue({
      data: mockReportContent,
      isLoading: false,
    });
    (manualValidationHooks.useSubmitDecision as any).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    renderWithProviders(<ReportReview />);

    const returnButton = screen.getByRole("button", { name: /return for correction/i });
    fireEvent.click(returnButton);

    expect(mockOpenDecisionModal).toHaveBeenCalledWith("RETURN");
  });
});
