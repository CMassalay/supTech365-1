/**
 * Assignment & workload API (mock implementation for FDD Feature 6).
 * Replace with real fetch calls when backend is ready.
 */

import type {
  CreateAssignmentRequest,
  AssignmentResponse,
  PendingAssignmentReport,
  WorkloadItemResponse,
  NotificationResponse,
  AssignmentQueueFilters,
  MyAssignmentFilters,
  NotificationFilters,
} from "@/types/assignment";

import { getStoredToken } from "@/lib/api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://liberia-suptech.onrender.com";

type RequestOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined>;
};

function buildUrl(path: string, query?: Record<string, string | number | boolean | undefined>): string {
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

export async function getAssignmentQueue(filters: AssignmentQueueFilters): Promise<{
  items: PendingAssignmentReport[];
  total: number;
  page: number;
  page_size: number;
}> {
  return request("/api/v1/assignments", {
    method: "GET",
    query: {
      page: filters.page,
      page_size: filters.page_size,
      report_type: filters.report_type,
      status: "active", // Default to active assignments for supervisor view
    },
  });
}

export async function getOfficerWorkloads(teamId?: string): Promise<WorkloadItemResponse[]> {
  return request("/api/v1/assignments/workload/officers", {
    method: "GET",
    query: { team_id: teamId },
  });
}

export async function getAnalystWorkloads(): Promise<WorkloadItemResponse[]> {
  // Analysts are also listed under officer workload endpoint but filtered by role in backend
  return request("/api/v1/assignments/workload/officers", {
    method: "GET",
  });
}

export async function getMyAssignments(filters: MyAssignmentFilters): Promise<{
  items: AssignmentResponse[];
  total: number;
  page: number;
  page_size: number;
}> {
  return request("/api/v1/assignments/my-assignments", {
    method: "GET",
    query: {
      page: filters.page,
      page_size: filters.page_size,
      status: filters.status,
    },
  });
}

export async function getMyWorkload(): Promise<{
  total: number;
  by_type: { ctrs: number; strs: number; escalated_ctrs?: number; cases?: number };
}> {
  const data = await request<any>("/api/v1/assignments/workload/me", {
    method: "GET",
  });
  return {
    total: data.workload_count,
    by_type: {
      ctrs: data.active_ctrs || 0,
      strs: data.active_strs || 0,
      escalated_ctrs: data.active_escalated_ctrs || 0,
      cases: data.active_cases || 0,
    }
  };
}

export async function getNotifications(filters: NotificationFilters): Promise<{
  items: NotificationResponse[];
  unread_count: number;
}> {
  return request("/api/v1/assignments/notifications", {
    method: "GET",
    query: {
      is_read: filters.is_read,
      page: filters.page,
      page_size: filters.page_size,
    },
  });
}

export async function createAssignment(data: CreateAssignmentRequest): Promise<AssignmentResponse> {
  return request("/api/v1/assignments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function markNotificationRead(id: string): Promise<NotificationResponse> {
  return request(`/api/v1/assignments/notifications/${encodeURIComponent(id)}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsRead(): Promise<void> {
  // No direct mark all endpoint in router, but we can loop or add one
  // For now, let's assume we might need to add it to backend if needed
  return;
}
