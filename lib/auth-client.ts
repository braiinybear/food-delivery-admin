import { createAuthClient } from "better-auth/react";
import { phoneNumberClient } from "better-auth/client/plugins";

/**
 * Better Auth client configured to talk to the remote NestJS backend.
 * 
 * The backend runs on Render (HTTPS) while the admin app runs on localhost (HTTP).
 * Since cross-origin cookies don't work across different schemes, we supplement
 * with localStorage-based token persistence in auth-context.tsx.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [phoneNumberClient()],
});
