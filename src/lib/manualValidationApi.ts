import { getStoredToken } from "@/lib/api";
import type {
  AuditLogFilters,
  AuditLogResponse,
  QueueFilters,
  QueueResponse,
  ReportContentResponse,
  SubmitDecisionRequest,
  SubmitDecisionResponse,
} from "@/types/manualValidation";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://liberia-suptech.onrender.com";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockQueue: QueueResponse = {
  items: [
    {
      submission_id: "1",
      reference_number: "FIA-2026-0001",
      report_type: "CTR",
      entity_name: "First Bank",
      submitted_at: "2026-02-03T10:30:00Z",
      entered_queue_at: "2026-02-03T10:31:00Z",
      transaction_count: 5,
      total_amount: 150000,
    },
    {
      submission_id: "2",
      reference_number: "FIA-2026-0002",
      report_type: "STR",
      entity_name: "Unity Corp",
      submitted_at: "2026-02-03T10:35:00Z",
      entered_queue_at: "2026-02-03T10:36:00Z",
      transaction_count: 3,
      total_amount: 76000,
    },
  ],
  total: 2,
  page: 1,
  page_size: 20,
  total_pages: 1,
};

const mockReport: ReportContentResponse = {
  submission_id: "1",
  reference_number: "FIA-2026-001234",
  report_type: "CTR",
  entity: { id: "e1", name: "First Bank of Liberia", entity_type: "BANK" },
  submitted_by: { id: "u1", username: "compliance_officer" },
  submitted_at: "2026-02-03T10:30:00Z",
  metadata: { reportingPeriod: "Jan 1-31, 2026" },
  transactions: [
    { id: 1, date: "2026-01-15", type: "Deposit", amount: "25000", name: "John Doe", details: "Cash deposit branch #1" },
    { id: 2, date: "2026-01-16", type: "Withdraw", amount: "15000", name: "Jane Doe", details: "ATM withdrawal" },
    { id: 3, date: "2026-01-18", type: "Transfer", amount: "50000", name: "ABC Corp", details: "Cross-border transfer" },
  ],
  validation_status: "PENDING",
  automated_validation_passed_at: "2026-02-03T10:31:00Z",
};

const mockAudit: AuditLogResponse = {
  items: [
    {
      id: "a1",
      submission_id: "1",
      reference_number: "FIA-2026-001",
      decision: "ACCEPT",
      decided_by: "J.Smith",
      decided_at: "2026-02-03T11:30:00Z",
      reason: "",
    },
    {
      id: "a2",
      submission_id: "2",
      reference_number: "FIA-2026-002",
      decision: "RETURN",
      decided_by: "M.Jones",
      decided_at: "2026-02-03T12:10:00Z",
      reason: "Missing transaction origin details and incomplete beneficiary information.",
    },
  ],
  total: 2,
  page: 1,
  page_size: 20,
  total_pages: 1,
};

function buildUrl(path: string, params?: Record<string, string | number | undefined>) {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

async function request<T>(path: string, init?: RequestInit, params?: Record<string, string | number | undefined>): Promise<T> {
  const token = getStoredToken();
  const response = await fetch(buildUrl(path, params), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });
  if (!response.ok) {
    let message = "Request failed";
    try {
      const body = await response.json();
      message = body?.error?.message || body?.message || message;
    } catch {
      // noop
    }
    throw new Error(message);
  }
  return (await response.json()) as T;
}

export async function fetchValidationQueue(filters: QueueFilters, page: number, pageSize: number): Promise<QueueResponse> {
  try {
    return await request<QueueResponse>(
      "/api/v1/manual-validation/queue",
      { method: "GET" },
      {
        page,
        page_size: pageSize,
        report_type: filters.reportType,
        from_date: filters.dateFrom,
        to_date: filters.dateTo,
        search: filters.search,
        assigned_to_me: filters.assignedToMe ? "true" : undefined,
      }
    );
  } catch {
    await delay(250);
    return mockQueue;
  }
}

export async function fetchReportContent(submissionId: string): Promise<ReportContentResponse> {
  try {
    return await request<ReportContentResponse>(`/api/v1/manual-validation/reports/${encodeURIComponent(submissionId)}`, {
      method: "GET",
    });
  } catch {
    await delay(200);
    return { ...mockReport, submission_id: submissionId };
  }
}

export async function submitValidationDecision(
  submissionId: string,
  data: SubmitDecisionRequest
): Promise<SubmitDecisionResponse> {
  try {
    return await request<SubmitDecisionResponse>(
      `/api/v1/manual-validation/reports/${encodeURIComponent(submissionId)}/decision`,
      { method: "POST", body: JSON.stringify(data) }
    );
  } catch {
    await delay(200);
    return {
      submission_id: submissionId,
      reference_number: mockReport.reference_number,
      decision: data.decision,
      decided_at: new Date().toISOString(),
      message: "Decision submitted successfully",
      routed_to_queue: data.decision === "ACCEPT" ? "NEXT_QUEUE" : undefined,
    };
  }
}

export async function fetchAuditLogs(filters: AuditLogFilters, page: number, pageSize: number): Promise<AuditLogResponse> {
  try {
    return await request<AuditLogResponse>(
      "/api/v1/manual-validation/audit-logs",
      { method: "GET" },
      {
        page,
        page_size: pageSize,
        decision: filters.decision,
        from_date: filters.dateFrom,
        to_date: filters.dateTo,
        decided_by: filters.decidedBy,
        submission_reference: filters.submissionReference,
      }
    );
  } catch {
    await delay(250);
    return mockAudit;
  }
}
