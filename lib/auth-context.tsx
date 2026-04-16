"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  authApi,
  clearStoredToken,
  getStoredToken,
  getStoredUser,
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

  const refreshSession = useCallback(async () => {
    // 1) If there's no token at all, user is not logged in
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      return;
    }

    // 2) Restore the cached user immediately (instant UI, no flicker)
    const cachedUser = getStoredUser();
    if (cachedUser && cachedUser.role === "ADMIN") {
      setUser(cachedUser);
    }

    // 3) Validate in the background — update or revoke as needed
    try {
      const freshUser = await authApi.getSession();
      if (freshUser && freshUser.role === "ADMIN") {
        setUser(freshUser);
        setStoredUser(freshUser); // refresh the cache
      } else if (freshUser) {
        // Logged in but not an admin
        setUser(null);
        clearStoredToken();
      }
    } catch {
      // If the API call fails (network error, 401, etc.), keep the cached
      // user so the dashboard stays visible. The next real API call will
      // catch an expired session and redirect then.
      if (!cachedUser) {
        // No cached user and API failed → genuinely not authenticated
        setUser(null);
        clearStoredToken();
      }
      // If we DO have a cached user, just keep showing them.
      // Their token might still be valid; a transient error shouldn't log them out.
    }
  }, []);

  useEffect(() => {
    refreshSession()
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [refreshSession]);

  const signIn = async (email: string, password: string) => {
    const result = await authApi.signIn({ email, password });
    if (result.user.role !== "ADMIN") {
      await authApi.signOut().catch(() => {});
      throw new Error("Only administrators can access this panel.");
    }
    setUser(result.user);
  };

  const signUp = async (name: string, email: string, password: string) => {
    const result = await authApi.signUp({ email, password, name });
    if (result.user.role !== "ADMIN") {
      await authApi.signOut().catch(() => {});
      throw new Error(
        "Account created. Please contact a system administrator to grant admin access."
      );
    }
    setUser(result.user);
  };

  const signOut = async () => {
    try {
      await authApi.signOut();
    } catch {
      clearStoredToken();
    }
    setUser(null);
  };

  const sendOTP = async (phoneNumber: string) => {
    await authApi.sendOTP(phoneNumber);
  };

  const verifyOTP = async (phoneNumber: string, code: string) => {
    const result = await authApi.verifyOTP({ phoneNumber, code });
    if (result.user.role !== "ADMIN") {
      await authApi.signOut().catch(() => {});
      throw new Error("Only administrators can access this panel.");
    }
    setUser(result.user);
  };

  const socialSignIn = async (provider: "google") => {
    const result = await authApi.socialSignIn({
      provider,
      callbackURL: `${window.location.origin}/auth/callback`,
    });
    if (result.url) {
      window.location.href = result.url;
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
