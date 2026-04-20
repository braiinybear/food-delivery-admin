import axios, { AxiosRequestConfig } from "axios";

/**
 * API helpers for the admin panel.
 * 
 * Uses the Better Auth client for auth operations, with localStorage-based
 * persistence for cross-origin support (Render HTTPS → localhost HTTP).
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// ─── Token & Session Storage ───────────────────────────────────────────────────
// Since cross-origin cookies won't work (different domains + HTTP/HTTPS mismatch),
// we store the session token and user data in localStorage + a cookie for the proxy.

const TOKEN_COOKIE_NAME = "admin_session_token";
const TOKEN_STORAGE_KEY = "admin_session_token";
const USER_STORAGE_KEY = "admin_user_data";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  image?: string;
  role: string;
  referralCode?: string;
  createdAt: string;
}

/** Read token from localStorage (primary) or cookie (fallback) */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) return token;
    const match = document.cookie.match(
      new RegExp(`(?:^|;\\s*)${TOKEN_COOKIE_NAME}=([^;]*)`)
    );
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

/** Store token in BOTH cookie (for the proxy) and localStorage (reliable) */
export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  const maxAge = 7 * 24 * 60 * 60;
  document.cookie = `${TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch { /* ignore */ }
}

/** Clear token from both cookie and localStorage */
export function clearStoredToken(): void {
  if (typeof window === "undefined") return;
  document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; max-age=0`;
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch { /* ignore */ }
}

/** Cache user data in localStorage for instant restore on refresh */
export function setStoredUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch { /* ignore */ }
}

/** Get cached user from localStorage */
export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

// ─── Authenticated API request helper ──────────────────────────────────────────
// For non-auth API calls (admin endpoints), attach the Bearer token.

class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: AxiosRequestConfig = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const token = getStoredToken();
  const authHeaders: Record<string, string> = {};
  if (token) {
    authHeaders["Authorization"] = `Bearer ${token}`;
  }

  // Debug — remove once confirmed working
  console.debug("[apiRequest]", endpoint, "| token:", token ? "✓ present" : "✗ MISSING");

  // Separate caller headers so spreading ...options below doesn't clobber Authorization
  const { headers: callerHeaders, ...restOptions } = options;

  try {
    const response = await axios<T>({
      url,
      ...restOptions,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...(callerHeaders as Record<string, string> | undefined),
      },
    });

    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status ?? 0;
      const errorData: unknown = err.response?.data ?? { message: err.message };
      throw new ApiError(
        (errorData as { message?: string })?.message || "Request failed",
        status,
        errorData
      );
    }
    throw err;
  }
}

export { ApiError };
