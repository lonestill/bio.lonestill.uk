import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, profiles, profileViews, BadgeType } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { validateApiToken } from "@/lib/api-auth";

// Cache for 60 seconds on Vercel Edge
const CACHE_MAX_AGE = 60;
const STALE_WHILE_REVALIDATE = 300;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  // Validate API token
  const auth = await validateApiToken(request);
  if (!auth.valid) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.statusCode }
    );
  }

  const { username } = await params;

  try {
    // Fetch user and profile data
    const data = await db
      .select({
        user: users,
        profile: profiles,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.username, username))
      .get();

    if (!data) {
      return NextResponse.json(
        { error: "User not found" },
        { 
          status: 404,
          headers: {
            "Cache-Control": `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
          }
        }
      );
    }

    // Get unique views count
    const viewsResult = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${profileViews.visitorHash})` })
      .from(profileViews)
      .where(eq(profileViews.profileUserId, data.user.id))
      .get();

    const uniqueViews = viewsResult?.count || 0;

    // Build response
    const response = {
      username: data.user.username,
      uid: data.user.uid,
      displayName: data.profile?.displayName || data.user.username,
      bio: data.profile?.bioText || null,
      avatar: data.profile?.avatarUrl || null,
      background: data.profile?.backgroundUrl || null,
      badges: (data.user.badges || []) as BadgeType[],
      stats: {
        views: uniqueViews,
        createdAt: data.user.createdAt?.toISOString() || null,
      },
      theme: {
        colors: data.profile?.themeConfig?.colors || null,
        opacity: data.profile?.themeConfig?.opacity ?? null,
        blur: data.profile?.themeConfig?.blur ?? null,
      },
      socials: (data.profile?.modules as any)?.socials || [],
      connections: {
        github: (data.profile?.modules as any)?.github?.enabled 
          ? { username: (data.profile?.modules as any)?.github?.username }
          : null,
        spotify: (data.profile?.modules as any)?.spotify?.connected 
          ? { enabled: (data.profile?.modules as any)?.spotify?.enabled }
          : null,
      },
    };

    return NextResponse.json(
      { data: response },
      {
        headers: {
          "Cache-Control": `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
          "CDN-Cache-Control": `public, max-age=${CACHE_MAX_AGE * 2}`,
          "Vercel-CDN-Cache-Control": `public, max-age=${CACHE_MAX_AGE * 2}`,
        },
      }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
