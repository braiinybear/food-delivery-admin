"use client";

import { useState } from "react";
import { useSignIn } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: signIn, isPending, error } = useSignIn();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔐 Login attempt with:", { email, password: "***" });
    
    if (!email || !password) {
      console.error("❌ Email and password are required");
      return;
    }

    signIn(
      { email, password },
      {
        onSuccess: (data: any) => {
          console.log("✅ Login successful:", data);
          router.push("/");
        },
        onError: (err: any) => {
          console.error("❌ Login error:", err);
        },
      }
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-lg shadow-md border border-gray-100">
        <h1 className="text-2xl font-bold text-center text-gray-900">Login to Admin</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <Input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">
                {(error as any)?.response?.data?.message || 
                 (error as any)?.message || 
                 "Login failed. Please check your credentials."}
              </p>
              <p className="text-red-600 text-xs mt-1">
                {typeof error === 'string' ? error : ''}
              </p>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Logging in..." : "Login"}
          </Button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-600 font-semibold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
