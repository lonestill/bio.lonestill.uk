import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { BadgeType, profiles, profileViews, users } from "@/db/schema";
import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { validateApiToken } from "@/lib/api-auth";

const CACHE_MAX_AGE = 60;
const STALE_WHILE_REVALIDATE = 300;

export async function GET(request: NextRequest) {
  const auth = await validateApiToken(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: auth.statusCode });
  }

  const searchParams = request.nextUrl.searchParams;
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
  const offset = parseInt(searchParams.get("offset") || "0");
  const windowDays = Math.min(parseInt(searchParams.get("windowDays") || "7"), 30);
  const badge = searchParams.get("badge") as BadgeType | null;
  const query = searchParams.get("q")?.trim();

  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  const filters: any[] = [];

  if (query) {
    filters.push(or(like(users.username, `%${query}%`), like(profiles.displayName, `%${query}%`)));
  }

  if (badge) {
    filters.push(sql`EXISTS (SELECT 1 FROM json_each(${users.badges}) WHERE json_each.value = ${badge})`);
  }

  const whereClause = filters.length ? and(...filters) : undefined;

  let baseQuery = db
    .select({
      id: users.id,
      username: users.username,
      uid: users.uid,
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl,
      badges: users.badges,
      createdAt: users.createdAt,
      recentViews: sql<number>`(
        SELECT COUNT(DISTINCT ${profileViews.visitorHash})
        FROM ${profileViews}
        WHERE ${profileViews.profileUserId} = ${users.id}
          AND ${profileViews.viewedAt} >= ${since}
      )`.as("recent_views"),
      allTimeViews: sql<number>`(
        SELECT COUNT(DISTINCT ${profileViews.visitorHash})
        FROM ${profileViews}
        WHERE ${profileViews.profileUserId} = ${users.id}
      )`.as("all_time_views"),
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId));

  if (whereClause) {
    baseQuery = baseQuery.where(whereClause);
  }

  const rows = await baseQuery
    .orderBy(desc(sql`recent_views`), desc(users.createdAt))
    .limit(limit)
    .offset(offset)
    .all();

  let totalQuery = db.select({ count: sql<number>`COUNT(*)` }).from(users);
  if (whereClause) {
    totalQuery = totalQuery.leftJoin(profiles, eq(users.id, profiles.userId)).where(whereClause);
  }
  const totalResult = await totalQuery.get();
  const total = totalResult?.count || 0;

  const data = rows.map((u) => ({
    username: u.username,
    uid: u.uid,
    displayName: u.displayName || u.username,
    avatar: u.avatarUrl,
    badges: u.badges || [],
    stats: {
      views: {
        window: u.recentViews,
        allTime: u.allTimeViews,
      },
      windowDays,
      createdAt: u.createdAt?.toISOString() || null,
    },
  }));

  return NextResponse.json(
    {
      data,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      windowDays,
    },
    {
      headers: {
        "Cache-Control": `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
        "CDN-Cache-Control": `public, max-age=${CACHE_MAX_AGE}`,
        "Vercel-CDN-Cache-Control": `public, max-age=${CACHE_MAX_AGE}`,
      },
    }
  );
}
