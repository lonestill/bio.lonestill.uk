import { lucia } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const sessionId = sessionCookie?.value ?? null;

  if (!sessionId) {
    redirect("/login");
  }

  const { session, user } = await lucia.validateSession(sessionId);

  if (!session) {
    redirect("/login");
  }

  // Check if user is admin
  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
