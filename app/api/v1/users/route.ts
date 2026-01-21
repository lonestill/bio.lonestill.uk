import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, profiles, profileViews, BadgeType } from "@/db/schema";
import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { validateApiToken } from "@/lib/api-auth";

// Cache for 5 minutes
const CACHE_MAX_AGE = 300;
const STALE_WHILE_REVALIDATE = 600;

export async function GET(request: NextRequest) {
  // Validate API token
  const auth = await validateApiToken(request);
  if (!auth.valid) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.statusCode }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);
  const offset = parseInt(searchParams.get("offset") || "0");
  const sortBy = searchParams.get("sort") || "views"; // views, created, uid
  const query = searchParams.get("q")?.trim();
  const badge = searchParams.get("badge") as BadgeType | null;
  const hasAvatar = searchParams.get("hasAvatar") === "true";
  const minViews = parseInt(searchParams.get("minViews") || "0");
  const createdAfter = searchParams.get("createdAfter")
    ? new Date(searchParams.get("createdAfter") || "")
    : null;

  try {
    const filters: any[] = [];

    if (query) {
      filters.push(
        or(
          like(users.username, `%${query}%`),
          like(profiles.displayName, `%${query}%`)
        )
      );
    }

    if (badge) {
      filters.push(
        sql`EXISTS (SELECT 1 FROM json_each(${users.badges}) WHERE json_each.value = ${badge})`
      );
    }

    if (hasAvatar) {
      filters.push(sql`${profiles.avatarUrl} IS NOT NULL`);
    }

    if (!Number.isNaN(minViews) && minViews > 0) {
      filters.push(
        sql`(SELECT COUNT(DISTINCT ${profileViews.visitorHash}) FROM ${profileViews} WHERE ${profileViews.profileUserId} = ${users.id}) >= ${minViews}`
      );
    }

    if (createdAfter && !Number.isNaN(createdAfter.getTime())) {
      filters.push(sql`${users.createdAt} >= ${createdAfter}`);
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    // Get users with view counts
    let usersQuery = db
      .select({
        id: users.id,
        username: users.username,
        uid: users.uid,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
        badges: users.badges,
        createdAt: users.createdAt,
        viewCount: sql<number>`(
          SELECT COUNT(DISTINCT ${profileViews.visitorHash}) 
          FROM ${profileViews} 
          WHERE ${profileViews.profileUserId} = ${users.id}
        )`.as("view_count"),
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId));

    if (whereClause) {
      usersQuery = usersQuery.where(whereClause);
    }

    const usersWithViews = await usersQuery
      .orderBy(
        sortBy === "created"
          ? desc(users.createdAt)
          : sortBy === "uid"
          ? desc(users.uid)
          : desc(sql`view_count`)
      )
      .limit(limit)
      .offset(offset)
      .all();

    // Get total count
    let totalQuery = db.select({ count: sql<number>`COUNT(*)` }).from(users);

    if (whereClause) {
      totalQuery = totalQuery.leftJoin(profiles, eq(users.id, profiles.userId)).where(whereClause);
    }

    const totalResult = await totalQuery.get();

    const total = totalResult?.count || 0;

    const response = {
      data: usersWithViews.map((u) => ({
        username: u.username,
        uid: u.uid,
        displayName: u.displayName || u.username,
        avatar: u.avatarUrl,
        badges: u.badges || [],
        stats: {
          views: u.viewCount,
          createdAt: u.createdAt?.toISOString() || null,
        },
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
        "CDN-Cache-Control": `public, max-age=${CACHE_MAX_AGE}`,
        "Vercel-CDN-Cache-Control": `public, max-age=${CACHE_MAX_AGE}`,
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
