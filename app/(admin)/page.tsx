import { redirect } from "next/navigation";

/**
 * Root `/` route — always redirects to /dashboard.
 * The proxy middleware handles unauthenticated users (sends them to /sign-in).
 */
export default function RootPage() {
  redirect("/dashboard");
}
