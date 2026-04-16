"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Shield,
  BarChart3,
  Users,
  ChevronRight,
} from "lucide-react";

type AuthMode = "signin" | "signup";
type AuthMethod = "email" | "phone";

export default function SignInPage() {
  const router = useRouter();
  const { signIn, signUp, sendOTP, verifyOTP, socialSignIn, isAuthenticated, isLoading } = useAuth();

  // ─── State ───────────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<AuthMode>("signin");
  const [method, setMethod] = useState<AuthMethod>("email");

  // Email form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Phone form
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // UI state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setSubmitting(true);

    try {
      if (mode === "signin") {
        await signIn(email, password);
        router.push("/");
      } else {
        await signUp(name, email, password);
        router.push("/");
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOTP = async () => {
    clearMessages();
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }

    setSubmitting(true);
    try {
      const fullPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+91${phoneNumber}`;
      await sendOTP(fullPhone);
      setOtpSent(true);
      setResendTimer(60);
      setSuccess("OTP sent successfully!");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to send OTP. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOTP = async () => {
    clearMessages();
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setSubmitting(true);
    try {
      const fullPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+91${phoneNumber}`;
      await verifyOTP(fullPhone, code);
      router.push("/");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Invalid OTP. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp(["", "", "", "", "", ""]);
    await handleSendOTP();
  };

  const handleOtpChange = useCallback((index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^[0-9]$/.test(value)) return;

    setOtp((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || "";
    }
    setOtp(newOtp);

    const focusIndex = Math.min(pasted.length, 5);
    otpRefs.current[focusIndex]?.focus();
  }, [otp]);

  const handleGoogleSignIn = async () => {
    clearMessages();
    try {
      await socialSignIn("google");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Google sign-in failed."
      );
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    clearMessages();
    setOtpSent(false);
    setOtp(["", "", "", "", "", ""]);
  };

  // ─── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p className="loading-text">Loading admin panel...</p>
      </div>
    );
  }

  if (isAuthenticated) return null;

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="auth-container">
      {/* ─── Left Brand Panel ──────────────────────────────────────────────── */}
      <div className="auth-brand-panel">
        <div className="brand-content">
          <div className="brand-logo">🍕</div>
          <h1>Braiiny Food</h1>
          <p>
            Your centralized admin dashboard to manage restaurants, orders,
            users, and platform analytics.
          </p>
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">
                <BarChart3 size={18} />
              </div>
              <span>Real-time analytics & revenue tracking</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <Users size={18} />
              </div>
              <span>User management & role control</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <Shield size={18} />
              </div>
              <span>Partner request approvals</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right Form Panel ──────────────────────────────────────────────── */}
      <div className="auth-form-panel">
        <div className="auth-bg-orb auth-bg-orb-1" />
        <div className="auth-bg-orb auth-bg-orb-2" />

        <div className="auth-form-wrapper">
          {/* Mobile Logo */}
          <div className="auth-form-header">
            <div className="mobile-logo">
              <div className="mobile-logo-icon">🍕</div>
              <span className="mobile-logo-text">Braiiny Food Admin</span>
            </div>
            <h2>
              {mode === "signin" ? "Welcome back" : "Create an account"}
            </h2>
            <p>
              {mode === "signin"
                ? "Sign in to access the admin dashboard"
                : "Register for admin access"}
            </p>
          </div>

          {/* Sign In / Sign Up Tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === "signin" ? "active" : ""}`}
              onClick={() => switchMode("signin")}
              id="tab-signin"
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => switchMode("signup")}
              id="tab-signup"
            >
              Sign Up
            </button>
          </div>

          {/* Method Tabs */}
          <div className="method-tabs">
            <button
              className={`method-tab ${method === "email" ? "active" : ""}`}
              onClick={() => {
                setMethod("email");
                clearMessages();
                setOtpSent(false);
              }}
              id="method-email"
            >
              <Mail size={16} />
              Email
            </button>
            <button
              className={`method-tab ${method === "phone" ? "active" : ""}`}
              onClick={() => {
                setMethod("phone");
                clearMessages();
              }}
              id="method-phone"
            >
              <Phone size={16} />
              Phone OTP
            </button>
          </div>

          {/* Error & Success Messages */}
          {error && (
            <div className="error-message" role="alert">
              <AlertCircle />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="success-message" role="status">
              <CheckCircle2 />
              <span>{success}</span>
            </div>
          )}

          {/* ─── Email Form ───────────────────────────────────────────────── */}
          {method === "email" && (
            <form onSubmit={handleEmailSubmit} id="email-auth-form">
              {mode === "signup" && (
                <div className="form-group">
                  <label className="form-label" htmlFor="name-input">
                    Full Name
                  </label>
                  <div className="form-input-wrapper">
                    <input
                      id="name-input"
                      type="text"
                      className="form-input"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoComplete="name"
                    />
                    <User className="input-icon" />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="email-input">
                  Email Address
                </label>
                <div className="form-input-wrapper">
                  <input
                    id="email-input"
                    type="email"
                    className="form-input"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                  <Mail className="input-icon" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password-input">
                  Password
                </label>
                <div className="form-input-wrapper">
                  <input
                    id="password-input"
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder={
                      mode === "signup"
                        ? "Min. 8 characters"
                        : "Enter your password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={mode === "signup" ? 8 : undefined}
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                  />
                  <Lock className="input-icon" />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
                id="email-submit-btn"
              >
                {submitting && <span className="spinner" />}
                {mode === "signin" ? "Sign In" : "Create Account"}
                {!submitting && <ChevronRight size={18} style={{ display: "inline", verticalAlign: "middle", marginLeft: 6 }} />}
              </button>
            </form>
          )}

          {/* ─── Phone Form ───────────────────────────────────────────────── */}
          {method === "phone" && !otpSent && (
            <div>
              <div className="form-group">
                <label className="form-label" htmlFor="phone-input">
                  Phone Number
                </label>
                <div className="phone-input-group">
                  <div className="phone-prefix">🇮🇳 +91</div>
                  <div className="form-input-wrapper" style={{ flex: 1 }}>
                    <input
                      id="phone-input"
                      type="tel"
                      className="form-input"
                      placeholder="9876543210"
                      value={phoneNumber}
                      onChange={(e) =>
                        setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      maxLength={10}
                      autoComplete="tel"
                      style={{ paddingLeft: "0.875rem" }}
                    />
                  </div>
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={handleSendOTP}
                disabled={submitting || phoneNumber.length < 10}
                id="send-otp-btn"
              >
                {submitting && <span className="spinner" />}
                Send OTP
                {!submitting && <ChevronRight size={18} style={{ display: "inline", verticalAlign: "middle", marginLeft: 6 }} />}
              </button>
            </div>
          )}

          {/* ─── OTP Verification ─────────────────────────────────────────── */}
          {method === "phone" && otpSent && (
            <div>
              <p
                style={{
                  textAlign: "center",
                  color: "var(--text-secondary)",
                  fontSize: "0.875rem",
                  marginBottom: "0.5rem",
                }}
              >
                Enter the 6-digit code sent to
              </p>
              <p
                style={{
                  textAlign: "center",
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  fontSize: "1rem",
                  marginBottom: "0.25rem",
                }}
              >
                +91 {phoneNumber}
              </p>

              <div className="otp-inputs" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className={`otp-input ${digit ? "filled" : ""}`}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    id={`otp-input-${i}`}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <button
                className="btn-primary"
                onClick={handleVerifyOTP}
                disabled={submitting || otp.join("").length !== 6}
                id="verify-otp-btn"
              >
                {submitting && <span className="spinner" />}
                Verify & Sign In
              </button>

              <div className="resend-timer">
                {resendTimer > 0 ? (
                  <span>Resend OTP in {resendTimer}s</span>
                ) : (
                  <button onClick={handleResendOTP} disabled={submitting}>
                    Resend OTP
                  </button>
                )}
              </div>

              <div className="auth-footer" style={{ marginTop: "1rem" }}>
                <button
                  onClick={() => {
                    setOtpSent(false);
                    setOtp(["", "", "", "", "", ""]);
                    clearMessages();
                  }}
                >
                  ← Change phone number
                </button>
              </div>
            </div>
          )}

          {/* ─── Social Sign In ───────────────────────────────────────────── */}
          {method === "email" && (
            <>
              <div className="divider">
                <div className="divider-line" />
                <span className="divider-text">or continue with</span>
                <div className="divider-line" />
              </div>

              <button
                className="btn-social"
                onClick={handleGoogleSignIn}
                id="google-signin-btn"
                type="button"
              >
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
            </>
          )}

          {/* ─── Footer ───────────────────────────────────────────────────── */}
          <div className="auth-footer">
            {mode === "signin" ? (
              <span>
                Don&apos;t have an account?{" "}
                <button onClick={() => switchMode("signup")}>Sign Up</button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button onClick={() => switchMode("signin")}>Sign In</button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
