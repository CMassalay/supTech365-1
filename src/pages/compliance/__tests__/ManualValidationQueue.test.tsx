import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ManualValidationQueue from "../ManualValidationQueue";
import { BrowserRouter } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import * as manualValidationHooks from "@/hooks/useManualValidation";
import { useValidationStore } from "@/hooks/useValidationStore";
import { mockQueueItems } from "@/test/fixtures/manualValidation";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the hooks
vi.mock("@/contexts/AuthContext", async () => {
  const actual = await vi.importActual("@/contexts/AuthContext");
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

vi.mock("@/hooks/useManualValidation", () => ({
  useValidationQueue: vi.fn(),
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

describe("ManualValidationQueue", () => {
  const mockSetQueueFilters = vi.fn();
  const mockResetQueueFilters = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useValidationStore as any).mockReturnValue({
      queueFilters: {},
      setQueueFilters: mockSetQueueFilters,
      resetQueueFilters: mockResetQueueFilters,
    });
  });

  it("renders the queue items correctly for leadership roles", async () => {
    (useAuth as any).mockReturnValue({
      user: { role: "head_of_compliance", name: "Head User" },
      isAuthenticated: true,
    });

    (manualValidationHooks.useValidationQueue as any).mockReturnValue({
      data: { items: mockQueueItems, total: 2 },
      isLoading: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<ManualValidationQueue />);

    // Use getAllByText and check the heading specifically
    const titles = screen.getAllByText("Manual Validation Queue");
    expect(titles.length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: /manual validation queue/i })).toBeInTheDocument();
    
    expect(screen.getByText("FIA-2026-001234")).toBeInTheDocument();
    expect(screen.getByText("FIA-2026-001235")).toBeInTheDocument();
  });

  it("shows personal queue title for compliance officers", () => {
    (useAuth as any).mockReturnValue({
      user: { role: "compliance_officer", name: "Officer User" },
      isAuthenticated: true,
    });

    (manualValidationHooks.useValidationQueue as any).mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<ManualValidationQueue />);

    expect(screen.getByRole("heading", { name: /my validation queue/i })).toBeInTheDocument();
  });

  it("shows loading state", () => {
    (useAuth as any).mockReturnValue({
      user: { role: "head_of_compliance", name: "Head User" },
      isAuthenticated: true,
    });

    (manualValidationHooks.useValidationQueue as any).mockReturnValue({
      data: null,
      isLoading: true,
      refetch: vi.fn(),
    });

    renderWithProviders(<ManualValidationQueue />);

    expect(screen.getByText("Loading queue...")).toBeInTheDocument();
  });

  it("applies correct filters for Head of Compliance (CTRs)", () => {
    (useAuth as any).mockReturnValue({
      user: { role: "head_of_compliance", name: "Head User" },
      isAuthenticated: true,
    });

    (manualValidationHooks.useValidationQueue as any).mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<ManualValidationQueue />);

    expect(mockSetQueueFilters).toHaveBeenCalledWith({ reportType: "CTR" });
  });

  it("applies correct filters for Compliance Officer (Assigned CTRs)", () => {
    (useAuth as any).mockReturnValue({
      user: { role: "compliance_officer", name: "Officer User" },
      isAuthenticated: true,
    });

    (manualValidationHooks.useValidationQueue as any).mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<ManualValidationQueue />);

    expect(mockSetQueueFilters).toHaveBeenCalledWith({ reportType: "CTR", assignedToMe: true });
  });
});
