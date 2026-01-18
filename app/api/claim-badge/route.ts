import { lucia } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-config";
import { db } from "@/db";
import { users, BadgeType } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Valid secret badges that can be claimed via API
const CLAIMABLE_BADGES: Record<string, BadgeType> = {
  hacker: "hacker",
};

export async function POST(request: NextRequest) {
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

    const { badge } = await request.json();

    if (!badge || !CLAIMABLE_BADGES[badge]) {
      return NextResponse.json({ error: "Invalid badge" }, { status: 400 });
    }

    const badgeType = CLAIMABLE_BADGES[badge];

    // Get current user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .get();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already has badge
    const currentBadges: BadgeType[] = user.badges || [];
    if (currentBadges.includes(badgeType)) {
      return NextResponse.json({ 
        success: false, 
        message: "You already have this badge",
        badge: badgeType 
      });
    }

    // Add badge
    const newBadges = [...currentBadges, badgeType];
    await db
      .update(users)
      .set({ badges: newBadges })
      .where(eq(users.id, session.userId));

    return NextResponse.json({ 
      success: true, 
      message: `🎉 Badge "${badgeType}" unlocked!`,
      badge: badgeType 
    });
  } catch (error) {
    console.error("Error claiming badge:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
