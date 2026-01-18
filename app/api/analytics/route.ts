import { db } from "@/db";
import { profiles, profileViews, linkClicks } from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { lucia } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-config";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    const sessionId = sessionCookie?.value ?? null;
    
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { session } = await lucia.validateSession(sessionId);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.userId))
      .get();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get today's date for filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get unique views today
    const uniqueViewsTodayResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(profileViews)
      .where(
        and(
          eq(profileViews.profileUserId, profile.userId),
          gte(profileViews.viewedAt, today)
        )
      )
      .get();

    // Get total unique views (all time)
    const totalUniqueViewsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(profileViews)
      .where(eq(profileViews.profileUserId, profile.userId))
      .get();

    // Get link clicks for each link
    const linkClickCounts: Record<number, number> = {};
    if (profile.modules?.socials) {
      for (let i = 0; i < profile.modules.socials.length; i++) {
        const clicksResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(linkClicks)
          .where(
            and(
              eq(linkClicks.profileUserId, profile.userId),
              eq(linkClicks.linkIndex, i),
              gte(linkClicks.clickedAt, today)
            )
          )
          .get();
        
        linkClickCounts[i] = clicksResult?.count || 0;
      }
    }

    // Calculate CTR (click-through rate)
    const totalClicks = Object.values(linkClickCounts).reduce((sum, count) => sum + count, 0);
    const uniqueViewsToday = uniqueViewsTodayResult?.count || 0;
    const totalUniqueViews = totalUniqueViewsResult?.count || 0;
    const ctr = uniqueViewsToday > 0
      ? Math.round((totalClicks / uniqueViewsToday) * 100)
      : 0;

    return NextResponse.json({
      totalViews: Number(profile.views) || 0,
      uniqueVisitorsToday: Number(uniqueViewsToday) || 0,
      uniqueVisitorsAllTime: Number(totalUniqueViews) || 0,
      ctr: Number(ctr) || 0,
      linkClicks: linkClickCounts,
    });
  } catch (error: any) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
