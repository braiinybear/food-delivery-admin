/**
 * API client for communicating with the NestJS backend.
 * 
 * Since the admin frontend and backend are
 * on different origins, session cookies set by Better Auth on the backend
 * domain are NOT visible to the admin app's proxy/middleware.
 * 
 * Solution: Store the Bearer token in a cookie (for proxy) and localStorage
 * (for the API client). User data is also cached in localStorage for instant
 * session restoration on refresh.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── Token & Session Storage ───────────────────────────────────────────────────

const TOKEN_COOKIE_NAME = "admin_session_token";
const TOKEN_STORAGE_KEY = "admin_session_token";
const USER_STORAGE_KEY = "admin_user_data";

/** Read token from localStorage (primary) or cookie (fallback) */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    // Primary: localStorage
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) return token;
    // Fallback: cookie
    const match = document.cookie.match(
      new RegExp(`(?:^|;\\s*)${TOKEN_COOKIE_NAME}=([^;]*)`)
    );
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

/** Store token in BOTH cookie (for proxy/middleware) and localStorage (for API) */
export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  // Cookie: for the proxy to detect auth state on navigation
  const maxAge = 7 * 24 * 60 * 60; // 7 days
  document.cookie = `${TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  // localStorage: reliable storage that survives page refresh
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // localStorage might be full or disabled
  }
}

/** Clear token from both cookie and localStorage */
export function clearStoredToken(): void {
  if (typeof window === "undefined") return;
  document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; max-age=0`;
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Cache the user object in localStorage for instant restore on refresh */
export function setStoredUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
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

// ─── API Client ────────────────────────────────────────────────────────────────

interface FetchOptions extends RequestInit {
  body?: string | FormData;
}

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

async function apiRequest<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Attach stored Bearer token if available
  const token = getStoredToken();
  const authHeaders: Record<string, string> = {};
  if (token) {
    authHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }
    throw new ApiError(
      (errorData as { message?: string })?.message || "Request failed",
      response.status,
      errorData
    );
  }

  // Handle empty responses (like sign-out)
  const text = await response.text();
  if (!text) return {} as T;

  return JSON.parse(text) as T;
}

// ─── Auth API ──────────────────────────────────────────────────────────────────

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

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export const authApi = {
  signUp: async (data: {
    email: string;
    password: string;
    name: string;
  }): Promise<AuthSession> => {
    const result = await apiRequest<AuthSession>("/api/auth/sign-up/email", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (result.token) {
      setStoredToken(result.token);
      if (result.user) setStoredUser(result.user);
    }
    return result;
  },

  signIn: async (data: {
    email: string;
    password: string;
  }): Promise<AuthSession> => {
    const result = await apiRequest<AuthSession>("/api/auth/sign-in/email", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (result.token) {
      setStoredToken(result.token);
      if (result.user) setStoredUser(result.user);
    }
    return result;
  },

  signOut: async (): Promise<{ success: boolean }> => {
    try {
      const result = await apiRequest<{ success: boolean }>("/api/auth/sign-out", {
        method: "POST",
      });
      return result;
    } finally {
      // Always clear local state, even if the API call fails
      clearStoredToken();
    }
  },

  getSession: (): Promise<AuthUser> => {
    return apiRequest("/api/auth/me");
  },

  sendOTP: (phoneNumber: string): Promise<{ success: boolean }> =>
    apiRequest("/api/auth/phone-number/send-otp", {
      method: "POST",
      body: JSON.stringify({ phoneNumber }),
    }),

  verifyOTP: async (data: {
    phoneNumber: string;
    code: string;
  }): Promise<AuthSession> => {
    const result = await apiRequest<AuthSession>("/api/auth/phone-number/verify", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (result.token) {
      setStoredToken(result.token);
      if (result.user) setStoredUser(result.user);
    }
    return result;
  },

  socialSignIn: (data: {
    provider: "google";
    callbackURL?: string;
  }): Promise<{ url: string; redirect: boolean }> =>
    apiRequest("/api/auth/sign-in/social", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export { ApiError };
export default apiRequest;
