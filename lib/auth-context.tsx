"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authClient } from "./auth-client";
import {
  clearStoredToken,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
  type AuthUser,
} from "./api";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendOTP: (phoneNumber: string) => Promise<void>;
  verifyOTP: (phoneNumber: string, code: string) => Promise<void>;
  socialSignIn: (provider: "google") => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Session Restore ─────────────────────────────────────────────────────────
  const refreshSession = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      return;
    }

    // Instantly restore cached user (no network needed)
    const cachedUser = getStoredUser();
    if (cachedUser && cachedUser.role === "ADMIN") {
      setUser(cachedUser);
    }

    // Background validation via Better Auth client
    try {
      const { data } = await authClient.getSession({
        fetchOptions: {
          headers: { Authorization: `Bearer ${token}` },
        },
      });

      // Better Auth's client types don't include custom fields like 'role',
      // but the backend returns them at runtime.
      const userWithRole = data?.user as unknown as AuthUser | undefined;
      if (userWithRole && userWithRole.role === "ADMIN") {
        setUser(userWithRole);
        setStoredUser(userWithRole);
      } else if (data?.user) {
        // Not an admin
        setUser(null);
        clearStoredToken();
      }
    } catch {
      // Keep cached user on transient failures
      if (!cachedUser) {
        setUser(null);
        clearStoredToken();
      }
    }
  }, []);

  useEffect(() => {
    refreshSession()
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [refreshSession]);

  // ─── Sign In (Email + Password) ──────────────────────────────────────────────
  const signIn = async (email: string, password: string) => {
    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) throw new Error(error.message || "Sign in failed.");
    if (!data?.user) throw new Error("Sign in failed — no user returned.");

    const authUser = data.user as unknown as AuthUser;
    if (authUser.role !== "ADMIN") {
      await authClient.signOut().catch(() => {});
      clearStoredToken();
      throw new Error("Only administrators can access this panel.");
    }

    if (data.token) setStoredToken(data.token);
    setStoredUser(authUser);
    setUser(authUser);
  };

  // ─── Sign Up (Email + Password) ──────────────────────────────────────────────
  const signUp = async (name: string, email: string, password: string) => {
    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name,
    });

    if (error) throw new Error(error.message || "Sign up failed.");
    if (!data?.user) throw new Error("Sign up failed — no user returned.");

    const authUser = data.user as unknown as AuthUser;
    if (authUser.role !== "ADMIN") {
      await authClient.signOut().catch(() => {});
      clearStoredToken();
      throw new Error(
        "Account created. Please contact a system administrator to grant admin access."
      );
    }

    if (data.token) setStoredToken(data.token);
    setStoredUser(authUser);
    setUser(authUser);
  };

  // ─── Sign Out ────────────────────────────────────────────────────────────────
  const signOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          headers: {
            Authorization: `Bearer ${getStoredToken() || ""}`,
          },
        },
      });
    } catch {
      // ignore
    }
    clearStoredToken();
    setUser(null);
  };

  // ─── Phone OTP ───────────────────────────────────────────────────────────────
  const sendOTP = async (phoneNumber: string) => {
    const { error } = await authClient.phoneNumber.sendOtp({
      phoneNumber,
    });
    if (error) throw new Error(error.message || "Failed to send OTP.");
  };

  const verifyOTP = async (phoneNumber: string, code: string) => {
    const { data, error } = await authClient.phoneNumber.verify({
      phoneNumber,
      code,
    });

    if (error) throw new Error(error.message || "OTP verification failed.");
    if (!data) throw new Error("Verification failed — no data returned.");

    // The verify response includes token + user
    const responseData = data as unknown as { token?: string; user?: AuthUser };

    if (responseData.user && responseData.user.role !== "ADMIN") {
      await authClient.signOut().catch(() => {});
      clearStoredToken();
      throw new Error("Only administrators can access this panel.");
    }

    if (responseData.token) setStoredToken(responseData.token);
    if (responseData.user) {
      setStoredUser(responseData.user);
      setUser(responseData.user);
    }
  };

  // ─── Google Social Sign In ───────────────────────────────────────────────────
  const socialSignIn = async (provider: "google") => {
    const { data, error } = await authClient.signIn.social({
      provider,
      callbackURL: `${window.location.origin}/auth/callback`,
    });

    if (error) throw new Error(error.message || "Social sign in failed.");
    if (data?.url) {
      window.location.href = data.url;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        sendOTP,
        verifyOTP,
        socialSignIn,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
