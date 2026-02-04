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

    if (response.status === 422 && body.detail) {
      const { message } = parse422Detail(body.detail);
      throw new ApiError("VALIDATION_ERROR", message, 422, body);
    }

    const code = (body as any).code || (body as any).error || "UNKNOWN_ERROR";
    const message =
      (body as any).message || (body as any).detail?.[0]?.msg || response.statusText || "Request failed";
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

export const authApi = {
  login: async (
    usernameOrEmail: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<LoginResponse> => {
    const data = await apiRequest<LoginResponse>("/auth/login", {
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
    const result = await apiRequest<string>("/auth/logout", {
      method: "POST",
    });
    clearStoredToken();
    return result as string;
  },

  refresh: async (): Promise<LoginResponse> => {
    const data = await apiRequest<LoginResponse>("/auth/refresh", {
      method: "POST",
    });
    return data;
  },

  getProfile: async (): Promise<{
    id: string;
    username: string;
    email: string;
    role: string;
    account_status: string;
    entity_id: string | null;
    entity_name: string | null;
    last_login: string | null;
  }> => {
    const data = await apiRequest<{
      id: string;
      username: string;
      email: string;
      role: string;
      account_status: string;
      entity_id: string | null;
      entity_name: string | null;
      last_login: string | null;
    }>("/auth/user/profile", {
      method: "GET",
    });
    return data;
  },

  sessionStatus: async (): Promise<{
    is_valid: boolean;
    expires_at: string;
    minutes_remaining: number;
    requires_refresh: boolean;
  }> => {
    return apiRequest("/auth/session/status", { method: "GET" });
  },

  /** Extend session (refresh token); updates stored token */
  extendSession: async (): Promise<LoginResponse> => {
    const data = await apiRequest<LoginResponse>("/auth/refresh", { method: "POST" });
    const rememberMe = typeof localStorage !== "undefined" && localStorage.getItem(REMEMBER_ME_KEY) === "true";
    setStoredToken(data.access_token, rememberMe);
    return data;
  },

  forgotPassword: async (email: string): Promise<{ message: string; token_expires_at?: string; email_sent?: boolean }> => {
    return apiRequest("/auth/password/forgot", {
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
    return apiRequest(`/auth/password/reset/${encodeURIComponent(token)}`, {
      method: "GET",
      public: true,
    });
  },

  resetPassword: async (
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ message: string; user_id?: string }> => {
    return apiRequest("/auth/password/reset", {
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
    return apiRequest("/auth/password/change", {
      method: "POST",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }),
    });
  },

  terminateAllSessions: async (): Promise<string> => {
    const result = await apiRequest<string>("/auth/sessions/terminate-all", {
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
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone: string;
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

/** Only these keys are sent to POST /admin/entities/register */
const REGISTER_ENTITY_KEYS: (keyof RegisterEntityPayload)[] = [
  "entity_name",
  "entity_type",
  "registration_number",
  "contact_email",
  "contact_phone",
  "primary_contact_name",
  "primary_contact_email",
  "primary_contact_phone",
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
    return apiRequest<RegisterEntityResponse>("/admin/entities/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  getEntities: async (params?: { limit?: number; offset?: number }) => {
    const search = new URLSearchParams();
    if (params?.limit != null) search.set("limit", String(params.limit));
    if (params?.offset != null) search.set("offset", String(params.offset));
    const qs = search.toString();
    return apiRequest<unknown>(`/api/entities${qs ? `?${qs}` : ""}`, { method: "GET" });
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
