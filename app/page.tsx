"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LogOut,
  BarChart3,
  Users,
  Store,
  ClipboardList,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/sign-in");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/sign-in");
    } catch {
      // Force redirect even if sign-out fails
      router.push("/sign-in");
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <div className="dashboard-layout">
      {/* ─── Top Bar ───────────────────────────────────────────────────────── */}
      <div className="dashboard-topbar">
        <div className="logo">
          <div className="logo-icon">🍕</div>
          <span>Braiiny Food Admin</span>
        </div>
        <div className="user-menu">
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.email}</div>
          </div>
          <button
            className="btn-signout"
            onClick={handleSignOut}
            id="signout-btn"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>

      {/* ─── Content ───────────────────────────────────────────────────────── */}
      <div className="dashboard-content">
        <div className="welcome-card" style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "var(--gradient-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck size={24} color="white" />
            </div>
            <div>
              <h1>Welcome, {user.name?.split(" ")[0] || "Admin"}!</h1>
              <p style={{ margin: 0 }}>
                You&apos;re signed in as <strong>{user.role}</strong>
              </p>
            </div>
          </div>
          <p>
            Manage your food delivery platform from this centralized dashboard.
            Monitor orders, approve partners, and track platform analytics.
          </p>
        </div>

        {/* Quick Access Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1rem",
          }}
        >
          {[
            {
              icon: <BarChart3 size={22} />,
              title: "Analytics",
              desc: "View platform stats & revenue",
              color: "#6366F1",
            },
            {
              icon: <Users size={22} />,
              title: "Users",
              desc: "Manage users & roles",
              color: "#8B5CF6",
            },
            {
              icon: <Store size={22} />,
              title: "Restaurants",
              desc: "Approve & manage restaurants",
              color: "#F97316",
            },
            {
              icon: <ClipboardList size={22} />,
              title: "Orders",
              desc: "Track all platform orders",
              color: "#22C55E",
            },
            {
              icon: <TrendingUp size={22} />,
              title: "Revenue",
              desc: "Financial reports & payouts",
              color: "#F59E0B",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="welcome-card"
              style={{
                cursor: "pointer",
                transition: "all 0.3s ease",
                animationDelay: "0.1s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = item.color;
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "";
                (e.currentTarget as HTMLElement).style.transform = "";
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: `${item.color}15`,
                  border: `1px solid ${item.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: item.color,
                  marginBottom: "0.75rem",
                }}
              >
                {item.icon}
              </div>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: "0.25rem",
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-secondary)",
                  margin: 0,
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
