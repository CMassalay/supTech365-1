import { getStoredToken } from "@/lib/api";
import type {
  AuditLogFilters,
  AuditLogResponse,
  QueueFilters,
  QueueResponse,
  ReportContentResponse,
  ReportDetailsResponse,
  SubmitDecisionRequest,
  SubmitDecisionResponse,
} from "@/types/manualValidation";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://liberia-suptech.onrender.com";

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

async function request<T>(
  path: string,
  init?: RequestInit,
  params?: Record<string, string | number | undefined>
): Promise<T> {
  const token = getStoredToken();
  const url = buildUrl(path, params);
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  let parsedBody: any = null;

  if (!response.ok) {
    let message = "Request failed";
    try {
      parsedBody = await response.json();
      message = parsedBody?.error?.message || parsedBody?.message || message;
    } catch {
      // noop
    }

    // #region agent log
    fetch("http://127.0.0.1:7246/ingest/c3e0a118-fed4-4495-92ce-731c1630130d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "manualValidationApi.ts:request:error",
        message: "manualValidationApi request failed",
        data: {
          path,
          url,
          status: response.status,
          ok: response.ok,
        },
        timestamp: Date.now(),
        runId: "pre-fix",
        hypothesisId: "H1",
      }),
    }).catch(() => { });
    // #endregion

    throw new Error(message);
  }

  try {
    if (parsedBody === null) {
      parsedBody = await response.json();
    }

    // #region agent log
    fetch("http://127.0.0.1:7246/ingest/c3e0a118-fed4-4495-92ce-731c1630130d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "manualValidationApi.ts:request:success",
        message: "manualValidationApi request success",
        data: {
          path,
          url,
          status: response.status,
          ok: response.ok,
          total:
            parsedBody && typeof parsedBody === "object"
              ? (parsedBody as any).total ?? null
              : null,
          itemsLength:
            parsedBody &&
              typeof parsedBody === "object" &&
              Array.isArray((parsedBody as any).items)
              ? (parsedBody as any).items.length
              : null,
        },
        timestamp: Date.now(),
        runId: "pre-fix",
        hypothesisId: "H1",
      }),
    }).catch(() => { });
    // #endregion
  } catch {
    // If JSON parsing fails we still proceed and let caller handle it.
  }

  return parsedBody as T;
}

export async function fetchValidationQueue(filters: QueueFilters, page: number, pageSize: number): Promise<QueueResponse> {
  return await request<QueueResponse>(
    "/api/v1/validation/manual-validation/queue",
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
}

export async function fetchReportContent(submission_id: string): Promise<ReportDetailsResponse> {
  return await request<ReportDetailsResponse>(
    `/api/v1/validation/manual-validation/reports/${encodeURIComponent(submission_id)}`,
    {
      method: "GET",
    }
  );
}

export async function submitValidationDecision(
  submissionId: string,
  data: SubmitDecisionRequest
): Promise<SubmitDecisionResponse> {
  return await request<SubmitDecisionResponse>(
    `/api/v1/validation/manual-validation/reports/${encodeURIComponent(submissionId)}/decision`,
    { method: "POST", body: JSON.stringify(data) }
  );
}

export async function fetchAuditLogs(filters: AuditLogFilters, page: number, pageSize: number): Promise<AuditLogResponse> {
  return await request<AuditLogResponse>(
    "/api/v1/validation/manual-validation/audit-logs",
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
}

export async function fetchManualValidationHistory(page: number, pageSize: number, reportType?: string): Promise<QueueResponse> {
  return await request<QueueResponse>(
    "/api/v1/validation/manual-validation/history",
    { method: "GET" },
    {
      page,
      page_size: pageSize,
      report_type: reportType,
    }
  );
}