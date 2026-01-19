import { lucia } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-config";
import { db } from "@/db";
import { profiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AdminSidebar,
  OverviewPanel,
  UsersPanel,
  AnalyticsAdminPanel,
  GuestbookPanel,
  TokensPanel,
  SystemPanel,
  TicketsPanel,
} from "@/components/admin";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AdminPage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const sessionId = sessionCookie?.value ?? null;

  if (!sessionId) {
    redirect("/login");
  }

  const { session, user: authUser } = await lucia.validateSession(sessionId);

  if (!session) {
    redirect("/login");
  }

  // Double-check admin access
  if (authUser.role !== "admin") {
    redirect("/dashboard");
  }

  const profile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, session.userId))
    .get();

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .get();

  if (!profile || !user) {
    redirect("/login");
  }

  const params = await searchParams;
  const activeTab = params.tab || "overview";

  const renderPanel = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewPanel />;
      case "users":
        return <UsersPanel />;
      case "tickets":
        return <TicketsPanel />;
      case "analytics":
        return <AnalyticsAdminPanel />;
      case "guestbook":
        return <GuestbookPanel />;
      case "tokens":
        return <TokensPanel />;
      case "system":
        return <SystemPanel />;
      default:
        return <OverviewPanel />;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Admin Sidebar */}
      <AdminSidebar
        username={user.username}
        displayName={profile.displayName ?? undefined}
        avatarUrl={profile.avatarUrl ?? undefined}
      />

      {/* Main Content */}
      <div className="flex-1 ml-[260px]">
        {/* Header */}
        <div className="p-6 border-b border-red-500/10">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <h1 className="text-2xl font-mono font-bold text-white">
              Админ-панель
            </h1>
          </div>
          <p className="text-neutral-500 font-mono mt-1 ml-6">
            Полное управление платформой
          </p>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <div className="bg-neutral-900/30 backdrop-blur-xl border border-neutral-800 rounded-2xl p-6">
            {renderPanel()}
          </div>
        </div>
      </div>
    </div>
  );
}
