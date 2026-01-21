import { db } from "@/db";
import {
  pageViews,
  userEvents,
  userSessions,
  profileViews,
  linkClicks,
  users,
  profiles,
} from "@/db/schema";
import { eq, and, gte, lte, sql, desc, isNotNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { lucia } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-config";

export async function GET(req: NextRequest) {
  try {
    // Validate admin
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    const sessionId = sessionCookie?.value ?? null;
    
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { session, user } = await lucia.validateSession(sessionId);
    
    if (!session || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const adminUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .get();

    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get("timeRange") || "7d";
    const groupBy = searchParams.get("groupBy") || "day";

    // Calculate time range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case "24h":
        startDate.setHours(now.getHours() - 24);
        break;
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "all":
        startDate = new Date(0);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // === GLOBAL SITE STATISTICS ===

    // Total page views (all pages)
    const totalPageViews = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(pageViews)
      .where(gte(pageViews.viewedAt, startDate))
      .get();

    // Unique visitors
    const uniqueVisitors = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${pageViews.visitorHash})` })
      .from(pageViews)
      .where(gte(pageViews.viewedAt, startDate))
      .get();

    // Total events
    const totalEvents = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(userEvents)
      .where(gte(userEvents.eventedAt, startDate))
      .get();

    // Total sessions
    const totalSessions = await db
      .select({ 
        count: sql<number>`COUNT(*)`,
        avgDuration: sql<number>`AVG(${userSessions.duration})`,
        avgPageViews: sql<number>`AVG(${userSessions.pageViews})`,
      })
      .from(userSessions)
      .where(gte(userSessions.startedAt, startDate))
      .get();

    // === TIME SERIES DATA ===
    let timeSeriesQuery;
    switch (groupBy) {
      case "hour":
        timeSeriesQuery = sql<string>`strftime('%Y-%m-%d %H:00', ${pageViews.viewedAt})`;
        break;
      case "day":
        timeSeriesQuery = sql<string>`strftime('%Y-%m-%d', ${pageViews.viewedAt})`;
        break;
      case "week":
        timeSeriesQuery = sql<string>`strftime('%Y-W%W', ${pageViews.viewedAt})`;
        break;
      case "month":
        timeSeriesQuery = sql<string>`strftime('%Y-%m', ${pageViews.viewedAt})`;
        break;
      default:
        timeSeriesQuery = sql<string>`strftime('%Y-%m-%d', ${pageViews.viewedAt})`;
    }

    const timeSeriesData = await db
      .select({
        period: timeSeriesQuery,
        pageViews: sql<number>`COUNT(*)`,
        uniqueVisitors: sql<number>`COUNT(DISTINCT ${pageViews.visitorHash})`,
      })
      .from(pageViews)
      .where(gte(pageViews.viewedAt, startDate))
      .groupBy(timeSeriesQuery)
      .orderBy(timeSeriesQuery);

    // === TOP PAGES (ALL SITE) ===
    const topPages = await db
      .select({
        path: pageViews.path,
        views: sql<number>`COUNT(*)`,
        uniqueVisitors: sql<number>`COUNT(DISTINCT ${pageViews.visitorHash})`,
        avgTimeOnPage: sql<number>`AVG(${pageViews.timeOnPage})`,
      })
      .from(pageViews)
      .where(gte(pageViews.viewedAt, startDate))
      .groupBy(pageViews.path)
      .orderBy(desc(sql<number>`COUNT(*)`))
      .limit(20);

    // === TOP USER PROFILES ===
    const topProfiles = await db
      .select({
        userId: pageViews.profileUserId,
        username: users.username,
        displayName: profiles.displayName,
        views: sql<number>`COUNT(*)`,
        uniqueVisitors: sql<number>`COUNT(DISTINCT ${pageViews.visitorHash})`,
      })
      .from(pageViews)
      .leftJoin(users, eq(pageViews.profileUserId, users.id))
      .leftJoin(profiles, eq(pageViews.profileUserId, profiles.userId))
      .where(and(
        gte(pageViews.viewedAt, startDate),
        isNotNull(pageViews.profileUserId)
      ))
      .groupBy(pageViews.profileUserId, users.username, profiles.displayName)
      .orderBy(desc(sql<number>`COUNT(*)`))
      .limit(20);

    // === DEVICES ===
    const deviceStats = await db
      .select({
        device: pageViews.device,
        count: sql<number>`COUNT(*)`,
      })
      .from(pageViews)
      .where(gte(pageViews.viewedAt, startDate))
      .groupBy(pageViews.device);

    // === BROWSERS ===
    const browserStats = await db
      .select({
        browser: pageViews.browser,
        count: sql<number>`COUNT(*)`,
      })
      .from(pageViews)
      .where(gte(pageViews.viewedAt, startDate))
      .groupBy(pageViews.browser)
      .orderBy(desc(sql<number>`COUNT(*)`))
      .limit(10);

    // === OPERATING SYSTEMS ===
    const osStats = await db
      .select({
        os: pageViews.os,
        count: sql<number>`COUNT(*)`,
      })
      .from(pageViews)
      .where(gte(pageViews.viewedAt, startDate))
      .groupBy(pageViews.os)
      .orderBy(desc(sql<number>`COUNT(*)`));

    // === GEOGRAPHIC ===
    const geoStats = await db
      .select({
        country: pageViews.country,
        count: sql<number>`COUNT(*)`,
      })
      .from(pageViews)
      .where(and(
        gte(pageViews.viewedAt, startDate),
        isNotNull(pageViews.country)
      ))
      .groupBy(pageViews.country)
      .orderBy(desc(sql<number>`COUNT(*)`))
      .limit(20);

    // === TOP EVENTS ===
    const topEvents = await db
      .select({
        eventName: userEvents.eventName,
        eventType: userEvents.eventType,
        count: sql<number>`COUNT(*)`,
      })
      .from(userEvents)
      .where(gte(userEvents.eventedAt, startDate))
      .groupBy(userEvents.eventName, userEvents.eventType)
      .orderBy(desc(sql<number>`COUNT(*)`))
      .limit(30);

    // === REFERRERS ===
    const referrerStats = await db
      .select({
        referrer: pageViews.referrer,
        count: sql<number>`COUNT(*)`,
      })
      .from(pageViews)
      .where(and(
        gte(pageViews.viewedAt, startDate),
        isNotNull(pageViews.referrer),
        sql`${pageViews.referrer} != ''`
      ))
      .groupBy(pageViews.referrer)
      .orderBy(desc(sql<number>`COUNT(*)`))
      .limit(20);

    // === RECENT SESSIONS ===
    const recentSessions = await db
      .select({
        sessionId: userSessions.sessionId,
        startedAt: userSessions.startedAt,
        duration: userSessions.duration,
        pageViews: userSessions.pageViews,
        events: userSessions.events,
        device: userSessions.device,
        browser: userSessions.browser,
        country: userSessions.country,
        entryPage: userSessions.entryPage,
      })
      .from(userSessions)
      .where(gte(userSessions.startedAt, startDate))
      .orderBy(desc(userSessions.startedAt))
      .limit(50);

    // === USER STATISTICS ===
    const totalUsers = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .get();

    // Active users = уникальные залогиненные пользователи с неистекшими сессиями
    const activeUsers = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${sessions.userId})` })
      .from(sessions)
      .where(gte(sessions.expiresAt, now))
      .get();

    return NextResponse.json({
      overview: {
        totalPageViews: Number(totalPageViews?.count || 0),
        uniqueVisitors: Number(uniqueVisitors?.count || 0),
        totalEvents: Number(totalEvents?.count || 0),
        totalSessions: Number(totalSessions?.count || 0),
        avgSessionDuration: Math.round(Number(totalSessions?.avgDuration || 0)),
        avgPageViewsPerSession: Number(totalSessions?.avgPageViews || 0).toFixed(1),
        totalUsers: Number(totalUsers?.count || 0),
        activeUsers: Number(activeUsers?.count || 0),
      },
      timeSeries: timeSeriesData.map(row => ({
        period: row.period,
        pageViews: Number(row.pageViews),
        uniqueVisitors: Number(row.uniqueVisitors),
      })),
      topPages: topPages.map(row => ({
        path: row.path,
        views: Number(row.views),
        uniqueVisitors: Number(row.uniqueVisitors),
        avgTimeOnPage: Math.round(Number(row.avgTimeOnPage || 0)),
      })),
      topProfiles: topProfiles.map(row => ({
        userId: row.userId,
        username: row.username,
        displayName: row.displayName,
        views: Number(row.views),
        uniqueVisitors: Number(row.uniqueVisitors),
      })),
      devices: deviceStats.map(row => ({
        device: row.device || "unknown",
        count: Number(row.count),
      })),
      browsers: browserStats.map(row => ({
        browser: row.browser || "unknown",
        count: Number(row.count),
      })),
      operatingSystems: osStats.map(row => ({
        os: row.os || "unknown",
        count: Number(row.count),
      })),
      geographic: geoStats.map(row => ({
        country: row.country,
        count: Number(row.count),
      })),
      topEvents: topEvents.map(row => ({
        eventName: row.eventName,
        eventType: row.eventType,
        count: Number(row.count),
      })),
      referrers: referrerStats.map(row => ({
        referrer: row.referrer,
        count: Number(row.count),
      })),
      recentSessions: recentSessions.map(row => ({
        sessionId: row.sessionId,
        startedAt: row.startedAt,
        duration: row.duration,
        pageViews: row.pageViews,
        events: row.events,
        device: row.device,
        browser: row.browser,
        country: row.country,
        entryPage: row.entryPage,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch admin analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
