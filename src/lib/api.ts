/**
 * API utility functions for authentication and registration
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Get CSRF token from cookie
function getCsrfToken(): string | null {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "csrf_token") {
      return decodeURIComponent(value);
    }
  }
  return null;
}

// Get CSRF token from response header (if available)
function extractCsrfTokenFromResponse(response: Response): void {
  const csrfToken = response.headers.get("X-CSRF-Token");
  if (csrfToken) {
    // Store in memory (not localStorage for security)
    (window as any).__csrfToken = csrfToken;
  }
}

// Make API request with CSRF token and credentials
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const csrfToken = getCsrfToken() || (window as any).__csrfToken;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (csrfToken) {
    headers["X-CSRF-Token"] = csrfToken;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // Include cookies for authentication
  });

  // Extract CSRF token from response if present
  extractCsrfTokenFromResponse(response);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: "UNKNOWN_ERROR",
      message: "An unexpected error occurred",
    }));
    throw new ApiError(errorData.error || "UNKNOWN_ERROR", errorData.message || "An error occurred", response.status, errorData);
  }

  return response.json();
}

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Authentication API
export const authApi = {
  login: async (username: string, password: string, rememberMe: boolean = false) => {
    return apiRequest<{
      user: {
        id: string;
        username: string;
        email: string;
        role: string;
        requiresPasswordChange: boolean;
        entityId?: string;
        entityName?: string;
      };
      session: {
        expiresAt: string;
        ipAddress: string;
        userAgent: string;
      };
      activeSessions: number;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password, rememberMe }),
    });
  },

  logout: async () => {
    return apiRequest<{ success: boolean; message: string }>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  logoutAll: async () => {
    return apiRequest<{ success: boolean; message: string }>("/auth/logout-all", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  refresh: async () => {
    return apiRequest<{
      session: {
        expiresAt: string;
        ipAddress: string;
        userAgent: string;
      };
    }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  getMe: async () => {
    return apiRequest<{
      user: {
        id: string;
        username: string;
        email: string;
        role: string;
        requiresPasswordChange: boolean;
        entityId?: string;
        entityName?: string;
      };
      session: {
        expiresAt: string;
        ipAddress: string;
        userAgent: string;
      };
      activeSessions: number;
      sessions: Array<{
        id: string;
        ipAddress: string;
        userAgent: string;
        lastActivity: string;
        isCurrent: boolean;
      }>;
    }>("/auth/me", {
      method: "GET",
    });
  },

  forgotPassword: async (email: string) => {
    return apiRequest<{ success: boolean; message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, newPassword: string, confirmPassword: string) => {
    return apiRequest<{ success: boolean; message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword, confirmPassword }),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    return apiRequest<{ success: boolean; message: string }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
  },

  reauthenticate: async (password: string) => {
    return apiRequest<{
      success: boolean;
      gracePeriodExpiresAt: string;
    }>("/auth/reauthenticate", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
  },

  extendSession: async () => {
    return apiRequest<{
      success: boolean;
      session: {
        expiresAt: string;
      };
    }>("/auth/session/extend", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  checkUsername: async (username: string) => {
    return apiRequest<{
      available: boolean;
      username: string;
      message?: string;
    }>(`/admin/users/check-username/${encodeURIComponent(username)}`, {
      method: "GET",
    });
  },
};

// Registration API
export const registrationApi = {
  registerEntity: async (data: {
    entity: {
      name: string;
      type: string;
      registrationNumber: string;
      contactEmail: string;
      contactPhone: string;
    };
    primaryContact: {
      fullName: string;
      email: string;
      phone: string;
    };
    initialUser: {
      username: string;
      email: string;
      password: string;
      confirmPassword: string;
    };
  }) => {
    return apiRequest<{
      success: boolean;
      message: string;
      data: {
        entity: {
          id: string;
          name: string;
          type: string;
          registrationNumber: string;
          contactEmail: string;
          contactPhone: string;
          createdAt: string;
        };
        user: {
          id: string;
          username: string;
          email: string;
          role: string;
          entityId: string;
          requiresPasswordChange: boolean;
          createdAt: string;
        };
        credentials: {
          username: string;
          password: string | null;
        };
      };
    }>("/admin/entities/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  createUser: async (data: {
    fullName: string;
    username: string;
    email: string;
    phone?: string;
    role: string;
    entityId?: string;
    password: string;
    confirmPassword: string;
    requirePasswordChange: boolean;
  }) => {
    return apiRequest<{
      success: boolean;
      message: string;
      data: {
        user: {
          id: string;
          username: string;
          email: string;
          fullName: string;
          role: string;
          entityId?: string;
          requiresPasswordChange: boolean;
          createdAt: string;
        };
        credentials: {
          username: string;
          password: string | null;
        };
      };
    }>("/admin/users/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getEntities: async (status: "active" | "inactive" | "all" = "active", search?: string) => {
    const params = new URLSearchParams({ status });
    if (search) {
      params.append("search", search);
    }
    return apiRequest<{
      entities: Array<{
        id: string;
        name: string;
        type: string;
        registrationNumber: string;
        status: "active" | "inactive";
      }>;
      total: number;
      page: number;
      limit: number;
    }>(`/admin/entities/all?${params.toString()}`, {
      method: "GET",
    });
  },
};
