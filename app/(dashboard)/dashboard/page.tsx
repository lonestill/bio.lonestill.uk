import { lucia } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-config";
import { db } from "@/db";
import { profiles, users, profileViews, linkClicks, BadgeType } from "@/db/schema";
import { eq, sql, and, gte } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { StatsBar } from "@/components/dashboard/stats-bar";
import { ProfilePanel } from "@/components/dashboard/profile-panel";
import { DesignPanel } from "@/components/dashboard/design-panel";
import { EffectsPanel } from "@/components/dashboard/effects-panel";
import { LinksPanel } from "@/components/dashboard/links-panel";
import { AnalyticsPanel } from "@/components/dashboard/analytics-panel";
import { AdvancedAnalyticsPanel } from "@/components/dashboard/advanced-analytics-panel";
import { BadgesPanel } from "@/components/dashboard/badges-panel";
import { ConnectionsPanel } from "@/components/dashboard/connections-panel";
import { ApiPanel } from "@/components/dashboard/api-panel";
import { BadgeSettingsPanel } from "@/components/dashboard";
import { SecurityPanel } from "@/components/dashboard/security-panel";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
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
  const activeTab = params.tab || "profile";

  // Get real analytics from database
  // Total views (from profile counter)
  const totalViews = typeof profile.views === 'number' ? profile.views : Number(profile.views) || 0;
  
  // Unique visitors (count distinct visitor hashes from profileViews)
  const uniqueVisitorsResult = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${profileViews.visitorHash})` })
    .from(profileViews)
    .where(eq(profileViews.profileUserId, session.userId))
    .get();
  const uniqueVisitors = uniqueVisitorsResult?.count || 0;
  
  // Total link clicks
  const totalClicksResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(linkClicks)
    .where(eq(linkClicks.profileUserId, session.userId))
    .get();
  const totalClicks = totalClicksResult?.count || 0;
  
  // CTR = (clicks / views) * 100
  const ctr = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

  // User badges
  const userBadges: BadgeType[] = user.badges || [];

  const renderPanel = () => {
    switch (activeTab) {
      case "profile":
        return <ProfilePanel profile={profile} />;
      case "design":
        return <DesignPanel profile={profile} />;
      case "effects":
        return <EffectsPanel profile={profile} userRole={user.role} />;
      case "links":
        return <LinksPanel profile={profile} />;
      case "connections":
        return <ConnectionsPanel profile={profile} />;
      case "badges":
        return <BadgesPanel userBadges={userBadges} username={user.username} profile={profile} />;
      case "api":
        return <ApiPanel />;
      case "security":
        return <SecurityPanel />;
      case "analytics":
        return <AnalyticsPanel profile={profile} />;
      case "advanced-analytics":
        return <AdvancedAnalyticsPanel />;
      case "premium-badge":
        return <BadgeSettingsPanel profile={profile} userBadges={userBadges} />;
      default:
        return <ProfilePanel profile={profile} />;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar 
        username={user.username} 
        displayName={profile.displayName ?? undefined}
        avatarUrl={profile.avatarUrl ?? undefined}
        userRole={user.role}
      />

      {/* Main Content */}
      <div className="flex-1 ml-[260px]">
        {/* Header Stats */}
        <div className="p-6 border-b border-purple-500/10">
          <div className="mb-6">
            <h1 className="text-2xl font-mono font-bold text-white">
              Добро пожаловать, {profile.displayName || user.username}!
            </h1>
            <p className="text-neutral-500 font-mono mt-1">
              Управляйте своей страницей и отслеживайте статистику
            </p>
          </div>
          <StatsBar 
            totalViews={totalViews}
            uniqueVisitors={uniqueVisitors}
            linkClicks={totalClicks}
            ctr={ctr}
          />
        </div>

        {/* Content Area */}
        <div className="p-6">
          <div className="glass rounded-2xl p-6">
            {renderPanel()}
          </div>
        </div>
      </div>
    </div>
  );
}
