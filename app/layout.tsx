import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { QueryProvider } from "@/lib/query-provider";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Braiiny Food Admin",
  description: "Centralized admin dashboard for managing restaurants, orders, users, and platform analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full antialiased font-sans">

        <QueryProvider>
          <AuthProvider>
            <ThemeProvider>
              <Toaster position="top-right" richColors />
              {children}
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>

      </body>
    </html>
  );
}
