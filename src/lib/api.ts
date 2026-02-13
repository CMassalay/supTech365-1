/**
 * API client for Liberia SupTech backend
 * Base URL: https://liberia-suptech.onrender.com
 * Auth: JWT Bearer token (access_token from login)
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://liberia-suptech.onrender.com";

const TOKEN_KEY = "suptech_access_token";
const REMEMBER_ME_KEY = "suptech_remember_me";

export function getStoredToken(): string | null {
  try {
    if (localStorage.getItem(REMEMBER_ME_KEY) === "true") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(accessToken: string, rememberMe: boolean): void {
  try {
    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(REMEMBER_ME_KEY, "true");
      sessionStorage.removeItem(TOKEN_KEY);
    } else {
      sessionStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
  } catch (e) {
    console.warn("Token storage failed", e);
  }
}

export function clearStoredToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
  } catch {}
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Parse 422 validation error detail into a single message and optional field map */
function parse422Detail(detail: unknown): { message: string; fields?: Record<string, string> } {
  if (!Array.isArray(detail)) {
    return { message: "Validation failed." };
  }
  const messages: string[] = [];
  const fields: Record<string, string> = {};
  for (const item of detail) {
    if (item && typeof item === "object" && "msg" in item && typeof (item as any).msg === "string") {
      const msg = (item as any).msg;
      messages.push(msg);
      if ("loc" in item && Array.isArray((item as any).loc)) {
        const loc = (item as any).loc as (string | number)[];
        const field = loc.filter((x) => typeof x === "string").join(".");
        if (field) fields[field] = msg;
      }
    }
  }
  return {
    message: messages.length ? messages.join(" ") : "Validation failed.",
    fields: Object.keys(fields).length ? fields : undefined,
  };
}

/** Humanize backend field path e.g. "body -> primary_contact_name" -> "Primary contact name" */
function humanizeField(field: string): string {
  const raw = field.replace(/^body\s*->\s*/i, "").trim().replace(/_/g, " ");
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

/** Validation error item from API (e.g. error.details.errors[]) */
export interface ValidationErrorItem {
  field: string;
  message: string;
  type?: string;
}

/** Extract validation errors from ApiError when present (error.details.errors). */
export function getValidationErrors(err: ApiError): ValidationErrorItem[] | null {
  const data = err.data;
  if (!data || typeof data !== "object") return null;
  const error = (data as Record<string, unknown>).error;
  if (!error || typeof error !== "object") return null;
  const details = (error as Record<string, unknown>).details;
  if (!details || typeof details !== "object") return null;
  const errors = (details as Record<string, unknown>).errors;
  if (!Array.isArray(errors)) return null;
  return errors
    .filter((e): e is ValidationErrorItem => e != null && typeof e === "object" && typeof (e as any).field === "string" && typeof (e as any).message === "string")
    .map((e) => ({ field: (e as any).field, message: (e as any).message, type: (e as any).type }));
}

/** Parse API error body into code and message. Handles { success: false, error: { code, message, details } }, detail, etc. */
function parseErrorBody(
  body: unknown,
  status: number,
  fallbackMessage: string = "Request failed"
): { code: string; message: string } {
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    // { success: false, error: { code, message, details: { errors: [...] } } }
    if (b.error && typeof b.error === "object") {
      const err = b.error as Record<string, unknown>;
      const code = typeof err.code === "string" ? err.code : "ERROR";
      let message = typeof err.message === "string" ? err.message : fallbackMessage;
      const details = err.details;
      if (details && typeof details === "object") {
        const errors = (details as Record<string, unknown>).errors;
        if (Array.isArray(errors) && errors.length > 0) {
          const lines = errors
            .filter((e): e is Record<string, unknown> => e != null && typeof e === "object" && typeof (e as any).message === "string")
            .map((e) => `${humanizeField(String((e as any).field ?? ""))}: ${(e as any).message}`);
          if (lines.length) message += "\n• " + lines.join("\n• ");
        }
      }
      return { code, message };
    }
    // Top-level code/message
    const code = typeof b.code === "string" ? b.code : "UNKNOWN_ERROR";
    const message =
      typeof b.message === "string"
        ? b.message
        : status === 422 && b.detail
          ? Array.isArray(b.detail)
            ? parse422Detail(b.detail).message
            : String(b.detail)
          : fallbackMessage;
    return { code, message };
  }
  return { code: "UNKNOWN_ERROR", message: fallbackMessage };
}

interface RequestOptions extends RequestInit {
  /** If true, do not send Authorization header (for login, forgot-password, reset) */
  public?: boolean;
}

async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { public: isPublic, ...fetchOptions } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  const token = getStoredToken();
  if (!isPublic && token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: "omit",
  });

  if (!response.ok) {
    const isJson = response.headers.get("content-type")?.includes("application/json");
    const body = isJson ? await response.json().catch(() => ({})) : {};

    if (response.status === 422 && body && typeof body === "object" && Array.isArray((body as any).detail)) {
      const { message } = parse422Detail((body as any).detail);
      throw new ApiError("VALIDATION_ERROR", message, 422, body);
    }

    const { code, message } = parseErrorBody(
      body,
      response.status,
      response.statusText || "Request failed"
    );
    throw new ApiError(code, message, response.status, body);
  }

  const text = await response.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

// --- Auth API (matches backend docs) ---

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    account_status: string;
    entity_id: string | null;
    entity_name: string | null;
    last_login: string | null;
  };
  password_change_required: boolean;
  session_id: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  account_status: string;
  entity_id: string | null;
  entity_name: string | null;
  last_login: string | null;
  created_at: string;
}

export interface SessionInfo {
  id: string;
  created_at: string;
  last_activity: string;
  expires_at: string;
  ip_address: string;
  user_agent: string;
  is_remember_me: boolean;
}

export const authApi = {
  login: async (
    usernameOrEmail: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<LoginResponse> => {
    const data = await apiRequest<LoginResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username_or_email: usernameOrEmail,
        password,
        remember_me: rememberMe,
      }),
      public: true,
    });
    return data;
  },

  logout: async (): Promise<string> => {
    try {
      const result = await apiRequest<string>("/api/v1/auth/logout", {
        method: "POST",
      });
      return result as string;
    } finally {
      clearStoredToken();
    }
  },

  refresh: async (): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>("/api/v1/auth/refresh", {
      method: "POST",
    });
  },

  getProfile: async (): Promise<UserProfile> => {
    return apiRequest<UserProfile>("/api/v1/auth/user/profile", { method: "GET" });
  },

  sessionStatus: async (): Promise<{
    is_valid: boolean;
    expires_at: string;
    minutes_remaining: number;
    requires_refresh: boolean;
  }> => {
    return apiRequest("/api/v1/auth/session/status", { method: "GET" });
  },

  /** Check if session is expiring soon; returns warning message string or empty. */
  sessionWarning: async (): Promise<string> => {
    const result = await apiRequest<string>("/api/v1/auth/session/warning", { method: "GET" });
    return typeof result === "string" ? result : "";
  },

  /** Extend session (refresh token); updates stored token. Caller should also update auth context from returned user/session. */
  extendSession: async (): Promise<LoginResponse> => {
    const data = await apiRequest<LoginResponse>("/api/v1/auth/refresh", { method: "POST" });
    const rememberMe = typeof localStorage !== "undefined" && localStorage.getItem(REMEMBER_ME_KEY) === "true";
    setStoredToken(data.access_token, rememberMe);
    return data;
  },

  forgotPassword: async (email: string): Promise<{ message: string; token_expires_at?: string; email_sent?: boolean }> => {
    return apiRequest("/api/v1/auth/password/forgot", {
      method: "POST",
      body: JSON.stringify({ email }),
      public: true,
    });
  },

  validateResetToken: async (token: string): Promise<{
    is_valid: boolean;
    expires_at: string;
    minutes_remaining: number;
    message?: string;
  }> => {
    return apiRequest(`/api/v1/auth/password/reset/${encodeURIComponent(token)}`, {
      method: "GET",
      public: true,
    });
  },

  resetPassword: async (
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ message: string; user_id?: string }> => {
    return apiRequest("/api/v1/auth/password/reset", {
      method: "POST",
      body: JSON.stringify({
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }),
      public: true,
    });
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ message: string; password_change_required?: boolean; requires_reauth?: boolean }> => {
    return apiRequest("/api/v1/auth/password/change", {
      method: "POST",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }),
    });
  },

  /** GET /api/v1/auth/sessions - list current user's sessions */
  getSessions: async (): Promise<SessionInfo[]> => {
    return apiRequest<SessionInfo[]>("/api/v1/auth/sessions", { method: "GET" });
  },

  terminateAllSessions: async (): Promise<string> => {
    const result = await apiRequest<string>("/api/v1/auth/sessions/terminate-all", {
      method: "POST",
    });
    clearStoredToken();
    return result as string;
  },
};

// --- Registration API ---

export interface RegisterEntityPayload {
  entity_name: string;
  entity_type: string;
  registration_number: string;
  contact_email: string;
  contact_phone: string;
  username: string;
  email: string;
  password: string;
}

export interface RegisterEntityResponse {
  entity: {
    id: string;
    name: string;
    entity_type: string;
    registration_number: string;
    contact_email: string;
    is_active: boolean;
  };
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    account_status: string;
    entity_id: string;
    entity_name: string | null;
    last_login: string | null;
  };
  message: string;
}

export interface Entity {
  id: string;
  name: string;
  entity_type: string;
  registration_number: string;
  contact_email: string;
  is_active: boolean;
}

export interface GetEntitiesResponse {
  data: Entity[];
  total: number;
  limit: number;
  offset: number;
}

export interface UpdateEntityPayload {
  name: string;
  entity_type: string;
  registration_number: string;
  contact_email: string;
}

export interface DeactivateEntityResponse {
  message: string;
  entity_id: string;
  users_disabled: boolean;
}

/** Only these keys are sent to POST /admin/entities/register */
const REGISTER_ENTITY_KEYS: (keyof RegisterEntityPayload)[] = [
  "entity_name",
  "entity_type",
  "registration_number",
  "contact_email",
  "contact_phone",
  "username",
  "email",
  "password",
];

export const registrationApi = {
  registerEntity: async (payload: RegisterEntityPayload): Promise<RegisterEntityResponse> => {
    const body = REGISTER_ENTITY_KEYS.reduce(
      (acc, key) => {
        acc[key] = payload[key];
        return acc;
      },
      {} as RegisterEntityPayload
    );
    return apiRequest<RegisterEntityResponse>("/api/v1/admin/entities/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  getEntities: async (params?: { limit?: number; offset?: number }) => {
    const search = new URLSearchParams();
    if (params?.limit != null) search.set("limit", String(params.limit));
    if (params?.offset != null) search.set("offset", String(params.offset));
    const qs = search.toString();
    return apiRequest<GetEntitiesResponse>(`/api/v1/entity/${qs ? `?${qs}` : ""}`, { method: "GET" });
  },

  getEntity: async (id: string): Promise<Entity> => {
    return apiRequest<Entity>(`/api/v1/entity/${encodeURIComponent(id)}`, { method: "GET" });
  },

  getEntityByRegistrationNumber: async (regNumber: string): Promise<Entity> => {
    return apiRequest<Entity>(
      `/api/v1/entity/by-registration/${encodeURIComponent(regNumber)}`,
      { method: "GET" }
    );
  },

  updateEntity: async (id: string, payload: UpdateEntityPayload): Promise<Entity> => {
    return apiRequest<Entity>(`/api/v1/entity/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deactivateEntity: async (id: string): Promise<DeactivateEntityResponse> => {
    return apiRequest<DeactivateEntityResponse>(
      `/api/v1/entity/entities/${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );
  },

  checkUsername: async (username: string): Promise<{ available: boolean; username: string; message?: string }> => {
    try {
      return await apiRequest<{ available: boolean; username: string; message?: string }>(
        `/admin/users/check-username/${encodeURIComponent(username)}`,
        { method: "GET" }
      );
    } catch {
      return { available: true, username };
    }
  },
};

// --- Admin: Super Admin & Roles ---

export interface CreateSuperAdminPayload {
  username: string;
  email: string;
  password: string;
}

export interface CreateSuperAdminResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  account_status: string;
  entity_id: string;
  entity_name: string | null;
  last_login: string | null;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  permissions: string[];
  user_count: number;
}

export interface GetRolesResponse {
  items: Role[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface CreateRolePayload {
  name: string;
  description: string;
  permissions: string[];
}

export interface AssignRolePayload {
  user_id: string;
  role_name: string;
}

export interface AssignRoleResponse {
  user_id: string;
  username: string;
  old_role: string;
  new_role: string;
  message: string;
  success: boolean;
}

export const adminApi = {
  createSuperAdmin: async (payload: CreateSuperAdminPayload): Promise<CreateSuperAdminResponse> => {
    return apiRequest<CreateSuperAdminResponse>("/api/v1/admin/super-admin", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getRoles: async (params?: { page?: number; size?: number }): Promise<GetRolesResponse> => {
    const search = new URLSearchParams();
    if (params?.page != null) search.set("page", String(params.page));
    if (params?.size != null) search.set("size", String(params.size));
    const qs = search.toString();
    return apiRequest<GetRolesResponse>(`/api/v1/admin/roles${qs ? `?${qs}` : ""}`, { method: "GET" });
  },

  getRole: async (roleId: string): Promise<Role> => {
    return apiRequest<Role>(`/api/v1/admin/roles/${encodeURIComponent(roleId)}`, { method: "GET" });
  },

  createRole: async (payload: CreateRolePayload): Promise<Role> => {
    return apiRequest<Role>("/api/v1/admin/roles", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateRole: async (roleId: string, payload: Partial<CreateRolePayload>): Promise<Role> => {
    return apiRequest<Role>(`/api/v1/admin/roles/${encodeURIComponent(roleId)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteRole: async (roleId: string, force?: boolean): Promise<string> => {
    const qs = force === true ? "?force=true" : "";
    return apiRequest<string>(`/api/v1/admin/roles/${encodeURIComponent(roleId)}${qs}`, {
      method: "DELETE",
    });
  },

  getAvailablePermissions: async (): Promise<string[]> => {
    const result = await apiRequest<string[] | string>("/api/v1/admin/roles/available-permissions", {
      method: "GET",
    });
    return Array.isArray(result) ? result : result ? [result] : [];
  },

  assignRoleToUser: async (payload: AssignRolePayload): Promise<AssignRoleResponse> => {
    return apiRequest<AssignRoleResponse>("/api/v1/admin/roles/assign", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

// --- Submission API (Excel upload) ---

export type ExcelReportType = "STR" | "CTR" | "Monthly" | "Quarterly";

export interface ExcelSubmissionResponse {
  status: string;
  reference: string;
  entity_report_id: string;
  timestamp: string;
  message: string;
}

const MAX_EXCEL_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function submitExcelReport(
  file: File,
  reportType: ExcelReportType,
  entityReference?: string | null
): Promise<ExcelSubmissionResponse> {
  if (file.size > MAX_EXCEL_SIZE_BYTES) {
    throw new ApiError(
      "FILE_TOO_LARGE",
      "File size exceeds maximum allowed size of 10MB",
      413
    );
  }
  const formData = new FormData();
  formData.append("file", file);
  formData.append("report_type", reportType);
  if (entityReference != null && entityReference !== "") {
    formData.append("entity_reference", entityReference);
  }

  const token = getStoredToken();
  const headers: HeadersInit = {
    Accept: "application/json",
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}/api/v1/submission/excel`;
  const response = await fetch(url, {
    method: "POST",
    body: formData,
    headers,
    credentials: "omit",
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await response.json().catch(() => ({})) : await response.text();

  if (!response.ok) {
    const fallback = "Submission failed";
    const parsed =
      typeof body === "object" && body !== null
        ? parseErrorBody(body, response.status, fallback)
        : { code: "SUBMISSION_ERROR", message: response.statusText || fallback };
    throw new ApiError(
      response.status === 422 ? "VALIDATION_ERROR" : parsed.code,
      parsed.message,
      response.status,
      body
    );
  }

  return body as ExcelSubmissionResponse;
}
