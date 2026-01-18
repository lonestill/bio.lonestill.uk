import { cookies } from "next/headers";
import { lucia } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-config";

export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const sessionId = sessionCookie?.value ?? null;
  
  if (!sessionId) {
    return null;
  }
  
  const { session } = await lucia.validateSession(sessionId);
  return session;
}
