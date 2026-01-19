import { db } from "@/db";
import {
  pageViews,
  userEvents,
  userSessions,
  analyticsEvents,
  users,
} from "@/db/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Validate user is authenticated
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get("timeRange") || "7d"; // 24h, 7d, 30d, 90d, all
    const groupBy = searchParams.get("groupBy") || "day"; // hour, day, week, month
    const eventType = searchParams.get("eventType"); // filter by event type
    const device = searchParams.get("device"); // filter by device
    const browser = searchParams.get("browser"); // filter by browser

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

    // Build base query conditions
    const baseConditions = [
      eq(pageViews.profileUserId, user.id),
      gte(pageViews.viewedAt, startDate),
    ];

    // Get page views statistics
    const pageViewsData = await db
      .select({
        path: pageViews.path,
        count: sql<number>`COUNT(*)`,
        uniqueVisitors: sql<number>`COUNT(DISTINCT ${pageViews.visitorHash})`,
        avgTimeOnPage: sql<number>`AVG(${pageViews.timeOnPage})`,
      })
      .from(pageViews)
      .where(and(...baseConditions))
      .groupBy(pageViews.path)
      .orderBy(desc(sql<number>`COUNT(*)`));

    // Get device statistics
    const deviceStats = await db
      .select({
        device: pageViews.device,
        count: sql<number>`COUNT(*)`,
      })
      .from(pageViews)
      .where(and(...baseConditions))
      .groupBy(pageViews.device);

    // Get browser statistics
    const browserStats = await db
      .select({
        browser: pageViews.browser,
        count: sql<number>`COUNT(*)`,
      })
      .from(pageViews)
      .where(and(...baseConditions))
      .groupBy(pageViews.browser)
      .orderBy(desc(sql<number>`COUNT(*)`))
      .limit(10);

    // Get OS statistics
    const osStats = await db
      .select({
        os: pageViews.os,
        count: sql<number>`COUNT(*)`,
      })
      .from(pageViews)
      .where(and(...baseConditions))
      .groupBy(pageViews.os)
      .orderBy(desc(sql<number>`COUNT(*)`));

    // Get geographic statistics
    const geoStats = await db
      .select({
        country: pageViews.country,
        count: sql<number>`COUNT(*)`,
      })
      .from(pageViews)
      .where(and(...baseConditions, sql`${pageViews.country} IS NOT NULL`))
      .groupBy(pageViews.country)
      .orderBy(desc(sql<number>`COUNT(*)`))
      .limit(10);

    // Get time series data for chart
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
      .where(and(...baseConditions))
      .groupBy(timeSeriesQuery)
      .orderBy(timeSeriesQuery);

    // Get top events
    const eventConditions = [
      eq(userEvents.profileUserId, user.id),
      gte(userEvents.eventedAt, startDate),
    ];

    if (eventType) {
      eventConditions.push(eq(userEvents.eventType, eventType as any));
    }

    const topEvents = await db
      .select({
        eventName: userEvents.eventName,
        eventType: userEvents.eventType,
        count: sql<number>`COUNT(*)`,
      })
      .from(userEvents)
      .where(and(...eventConditions))
      .groupBy(userEvents.eventName, userEvents.eventType)
      .orderBy(desc(sql<number>`COUNT(*)`))
      .limit(20);

    // Get session statistics
    const sessionStats = await db
      .select({
        totalSessions: sql<number>`COUNT(*)`,
        avgDuration: sql<number>`AVG(${userSessions.duration})`,
        avgPageViews: sql<number>`AVG(${userSessions.pageViews})`,
        avgEvents: sql<number>`AVG(${userSessions.events})`,
      })
      .from(userSessions)
      .where(
        and(
          eq(userSessions.profileUserId, user.id),
          gte(userSessions.startedAt, startDate)
        )
      )
      .get();

    // Get referrer statistics
    const referrerStats = await db
      .select({
        referrer: pageViews.referrer,
        count: sql<number>`COUNT(*)`,
      })
      .from(pageViews)
      .where(and(...baseConditions, sql`${pageViews.referrer} IS NOT NULL AND ${pageViews.referrer} != ''`))
      .groupBy(pageViews.referrer)
      .orderBy(desc(sql<number>`COUNT(*)`))
      .limit(10);

    // Get total metrics
    const totalPageViews = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(pageViews)
      .where(and(...baseConditions))
      .get();

    const uniqueVisitors = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${pageViews.visitorHash})` })
      .from(pageViews)
      .where(and(...baseConditions))
      .get();

    const totalEvents = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(userEvents)
      .where(and(...eventConditions))
      .get();

    return NextResponse.json({
      overview: {
        totalPageViews: Number(totalPageViews?.count || 0),
        uniqueVisitors: Number(uniqueVisitors?.count || 0),
        totalEvents: Number(totalEvents?.count || 0),
        totalSessions: Number(sessionStats?.totalSessions || 0),
        avgSessionDuration: Math.round(Number(sessionStats?.avgDuration || 0)),
        avgPageViewsPerSession: Number(sessionStats?.avgPageViews || 0).toFixed(1),
        avgEventsPerSession: Number(sessionStats?.avgEvents || 0).toFixed(1),
      },
      pageViews: pageViewsData.map(row => ({
        path: row.path,
        views: Number(row.count),
        uniqueVisitors: Number(row.uniqueVisitors),
        avgTimeOnPage: Math.round(Number(row.avgTimeOnPage || 0)),
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
        country: row.country || "unknown",
        count: Number(row.count),
      })),
      timeSeries: timeSeriesData.map(row => ({
        period: row.period,
        pageViews: Number(row.pageViews),
        uniqueVisitors: Number(row.uniqueVisitors),
      })),
      topEvents: topEvents.map(row => ({
        eventName: row.eventName,
        eventType: row.eventType,
        count: Number(row.count),
      })),
      referrers: referrerStats.map(row => ({
        referrer: row.referrer || "direct",
        count: Number(row.count),
      })),
    });
  } catch (error) {
    console.error("Failed to fetch advanced analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
