import { db } from "@/db";
import { 
  pageViews, 
  userEvents, 
  userSessions, 
  analyticsEvents,
  users,
  profiles 
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { 
  hashIP, 
  getClientIP, 
  parseUserAgent, 
  getGeoFromIP 
} from "@/lib/analytics";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Handle empty body or non-JSON content
    let body;
    try {
      const text = await req.text();
      if (!text || text.trim() === '') {
        return NextResponse.json({ success: true }); // Silent ignore empty requests
      }
      body = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const {
      type, // 'pageview' | 'event' | 'session' | 'custom'
      sessionId,
      username,
      path,
      referrer,
      eventType,
      eventName,
      eventData,
      elementId,
      elementClass,
      elementText,
      screenWidth,
      screenHeight,
      timeOnPage,
      category,
      action,
      label,
      value,
      metadata,
    } = body;

    // Get headers
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const clientIP = getClientIP(headersList);
    const visitorHash = hashIP(clientIP);

    // Parse device info
    const deviceInfo = parseUserAgent(userAgent);

    // Get geo info (optional)
    const geoInfo = await getGeoFromIP(clientIP);

    // Find user if username provided
    let profileUserId: string | undefined;
    if (username) {
      const user = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, username))
        .get();
      
      if (user) {
        profileUserId = user.id;
      }
    }

    // Handle different tracking types
    switch (type) {
      case "pageview":
        // Track page view
        await db.insert(pageViews).values({
          sessionId: sessionId || `session-${Date.now()}`,
          profileUserId,
          visitorHash,
          path: path || "/",
          referrer: referrer || null,
          userAgent,
          browser: deviceInfo.browser,
          browserVersion: deviceInfo.browserVersion,
          os: deviceInfo.os,
          osVersion: deviceInfo.osVersion,
          device: deviceInfo.device,
          screenWidth: screenWidth || null,
          screenHeight: screenHeight || null,
          country: geoInfo.country || null,
          city: geoInfo.city || null,
          timeOnPage: timeOnPage || null,
          viewedAt: new Date(),
        });

        // Update or create session
        const existingSession = await db
          .select()
          .from(userSessions)
          .where(eq(userSessions.sessionId, sessionId))
          .get();

        if (existingSession) {
          // Update existing session
          await db
            .update(userSessions)
            .set({
              pageViews: (existingSession.pageViews || 0) + 1,
              exitPage: path,
              endedAt: new Date(),
              duration: Math.floor(
                (new Date().getTime() - existingSession.startedAt.getTime()) / 1000
              ),
            })
            .where(eq(userSessions.sessionId, sessionId));
        } else {
          // Create new session
          await db.insert(userSessions).values({
            sessionId: sessionId || `session-${Date.now()}`,
            profileUserId,
            visitorHash,
            startedAt: new Date(),
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            device: deviceInfo.device,
            country: geoInfo.country || null,
            pageViews: 1,
            events: 0,
            entryPage: path,
            exitPage: path,
            referrer: referrer || null,
          });
        }
        break;

      case "event":
        // Track user event
        await db.insert(userEvents).values({
          sessionId: sessionId || `session-${Date.now()}`,
          profileUserId,
          visitorHash,
          eventType: eventType || "click",
          eventName: eventName || "unknown",
          elementId: elementId || null,
          elementClass: elementClass || null,
          elementText: elementText || null,
          eventData: eventData || null,
          pageUrl: path || "/",
          eventedAt: new Date(),
        });

        // Update session events count
        const session = await db
          .select()
          .from(userSessions)
          .where(eq(userSessions.sessionId, sessionId))
          .get();

        if (session) {
          await db
            .update(userSessions)
            .set({
              events: (session.events || 0) + 1,
              endedAt: new Date(),
            })
            .where(eq(userSessions.sessionId, sessionId));
        }
        break;

      case "custom":
        // Track custom analytics event
        await db.insert(analyticsEvents).values({
          profileUserId,
          eventCategory: category || "engagement",
          eventAction: action || "unknown",
          eventLabel: label || null,
          eventValue: value || null,
          metadata: metadata || null,
          createdAt: new Date(),
        });
        break;

      case "session":
        // Update session end
        const sessionToUpdate = await db
          .select()
          .from(userSessions)
          .where(eq(userSessions.sessionId, sessionId))
          .get();

        if (sessionToUpdate) {
          await db
            .update(userSessions)
            .set({
              endedAt: new Date(),
              duration: Math.floor(
                (new Date().getTime() - sessionToUpdate.startedAt.getTime()) / 1000
              ),
            })
            .where(eq(userSessions.sessionId, sessionId));
        }
        break;

      default:
        return NextResponse.json(
          { error: "Invalid tracking type" },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to track analytics:", error);
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    );
  }
}
