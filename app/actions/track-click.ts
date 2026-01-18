"use server";

import { db } from "@/db";
import { linkClicks, profiles, users } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { headers } from "next/headers";
import { hashIP, getClientIP } from "@/lib/analytics";

export async function trackLinkClick(username: string, linkIndex: number) {
  try {
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .get();

    if (!user) {
      return { error: "User not found" };
    }

    const profile = await db
      .select({ userId: profiles.userId })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .get();

    if (!profile) {
      return { error: "Profile not found" };
    }

    // Get client IP and hash it
    const headersList = await headers();
    const clientIP = getClientIP(headersList);
    const visitorHash = hashIP(clientIP);

    // Check if this visitor already clicked this link today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Math.floor(today.getTime() / 1000);

    const existingClick = await db
      .select()
      .from(linkClicks)
      .where(
        and(
          eq(linkClicks.profileUserId, profile.userId),
          eq(linkClicks.linkIndex, linkIndex),
          eq(linkClicks.visitorHash, visitorHash),
          gte(linkClicks.clickedAt, new Date(todayTimestamp * 1000))
        )
      )
      .get();

    // Only track if this is a unique click today
    if (!existingClick) {
      await db.insert(linkClicks).values({
        profileUserId: profile.userId,
        linkIndex: linkIndex,
        visitorHash: visitorHash,
        clickedAt: new Date(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to track link click:", error);
    return { error: "Failed to track click" };
  }
}
