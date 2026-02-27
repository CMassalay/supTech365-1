import { getStoredToken } from "@/lib/api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://liberia-suptech.onrender.com";

type RequestOptions = RequestInit & {
  query?: Record<string, string | number | undefined>;
};

function buildUrl(path: string, query?: Record<string, string | number | undefined>): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { query, ...init } = options;
  const token = getStoredToken();
  const response = await fetch(buildUrl(path, query), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });

  const text = await response.text();
  const parsed = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      parsed?.error?.message || parsed?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return parsed as T;
}

export interface ReviewQueueItem {
  submission_id: string;
  reference_number: string;
  report_type: string;
  entity_id: string;
  submitted_at: string;
  entered_queue_at?: string | null;
  manual_validation_status: string;
  review_status: string;
  transaction_count: number;
  total_amount: number;
  assigned_to_name?: string;
}

export interface ReviewQueueResponse {
  items: ReviewQueueItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ReviewDetailResponse {
  report: {
    id: string;
    reference_number: string;
    report_type: string;
    entity_id: string;
    submitted_at: string;
    manual_validation_status: string;
    review_status: string | null;
    status: string;
    transactions: Array<{
      id: string;
      transaction_date?: string;
      transaction_amount?: number;
      account_number?: string;
      subject_name?: string;
      subject_id_number?: string;
      raw_data?: Record<string, unknown>;
    }>;
    alerts: Array<Record<string, unknown>>;
  };
  validation_result?: {
    validation_status?: string;
    validated_at?: string;
  };
  review_decision?: {
    review_status?: string;
    reviewed_at?: string | null;
    reviewed_by?: string | null;
  };
  entity?: {
    id: string;
    name?: string;
    entity_type?: string;
  } | null;
}

export interface SubmitReviewDecisionRequest {
  decision: "ARCHIVED" | "MONITORED" | "ESCALATED";
  comments?: string;
  escalation_reason?: string;
}

export async function fetchReviewQueue(page = 1, pageSize = 20): Promise<ReviewQueueResponse> {
  return request<ReviewQueueResponse>("/api/v1/review/queue", {
    method: "GET",
    query: {
      page,
      page_size: pageSize,
      report_type: "CTR",
    },
  });
}

export async function fetchCTRReviewDetail(submissionId: string): Promise<ReviewDetailResponse> {
  return request<ReviewDetailResponse>(
    `/api/v1/review/reports/${encodeURIComponent(submissionId)}`,
    { method: "GET" }
  );
}

export async function submitCTRReviewDecision(
  submissionId: string,
  payload: SubmitReviewDecisionRequest
): Promise<{
  submission_id: string;
  reference_number: string;
  decision: string;
  decided_at: string;
  message: string;
}> {
  return request(`/api/v1/review/reports/${encodeURIComponent(submissionId)}/decision`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
