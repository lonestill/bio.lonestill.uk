import { lucia } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-config";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
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

  const { session } = await lucia.validateSession(sessionId);

  if (!session) {
    redirect("/login");
  }

  // Check if user is banned
  const user = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.userId))
    .get();

  if (!user || user.role === "banned") {
    // Invalidate session and redirect to banned page
    await lucia.invalidateSession(session.id);
    redirect("/banned");
  }

  return (
    <div className="relative min-h-screen bg-[#050505] text-white noise-overlay">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-violet-600/8 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-purple-500/6 rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: '4s' }} />
        
        {/* Grid pattern - same as main page */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
}
