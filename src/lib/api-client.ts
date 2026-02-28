/**
 * API client wrapper for making HTTP requests
 */


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://liberia-suptech.onrender.com";

const TOKEN_KEY = "suptech_access_token";
const REMEMBER_ME_KEY = "suptech_remember_me";

function getStoredToken(): string | null {
  try {
    if (localStorage.getItem(REMEMBER_ME_KEY) === "true") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

interface ApiClientResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiClientResponse<T>> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    const token = getStoredToken();
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const url = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "omit",
    });

    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const data = isJson ? await response.json().catch(() => ({})) : {};

    if (!response.ok) {
      throw new Error(
        data?.message || data?.error?.message || response.statusText || "Request failed"
      );
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  async get<T>(endpoint: string): Promise<ApiClientResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiClientResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiClientResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiClientResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
