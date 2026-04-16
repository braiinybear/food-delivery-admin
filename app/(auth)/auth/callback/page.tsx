"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

/**
 * This page handles the redirect from Google OAuth.
 * After Google redirects back, the session cookie is already set by the backend.
 * We just need to refresh the session and redirect appropriately.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const { refreshSession, isAuthenticated } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await refreshSession();
      } catch (err) {
        if (err instanceof Error && err.message === "ACCESS_DENIED") {
          setError("Only administrators can access this panel.");
          setTimeout(() => router.push("/sign-in"), 3000);
          return;
        }
        setError("Authentication failed. Redirecting...");
        setTimeout(() => router.push("/sign-in"), 2000);
      }
    };

    handleCallback();
  }, [refreshSession, router]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="loading-screen">
      {error ? (
        <>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
            }}
          >
            ⚠️
          </div>
          <p className="loading-text" style={{ color: "#FCA5A5" }}>
            {error}
          </p>
        </>
      ) : (
        <>
          <div className="loading-spinner" />
          <p className="loading-text">Completing authentication...</p>
        </>
      )}
    </div>
  );
}
