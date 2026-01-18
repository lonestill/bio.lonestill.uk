"use server";

import { db } from "@/db";
import { profiles, users, profileViews } from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { hashIP, getClientIP } from "@/lib/analytics";

export async function incrementView(username: string) {
  try {
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .get();

    if (!user) {
      return { error: "User not found" };
    }

    // Get client IP and hash it
    const headersList = await headers();
    const clientIP = getClientIP(headersList);
    const visitorHash = hashIP(clientIP);

    // Check if this visitor already viewed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Math.floor(today.getTime() / 1000);

    const existingView = await db
      .select()
      .from(profileViews)
      .where(
        and(
          eq(profileViews.profileUserId, user.id),
          eq(profileViews.visitorHash, visitorHash),
          gte(profileViews.viewedAt, new Date(todayTimestamp * 1000))
        )
      )
      .get();

    // Increment total views counter using SQL to avoid type issues
    await db
      .update(profiles)
      .set({ views: sql`COALESCE(${profiles.views}, 0) + 1` })
      .where(eq(profiles.userId, user.id));

    // Get updated views count for logging
    const updatedProfile = await db
      .select({ views: profiles.views })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .get();
    
    const currentViews = Number(updatedProfile?.views) || 0;

    // Only track unique view if this visitor hasn't viewed today
    if (!existingView) {
      // Insert unique view record
      await db.insert(profileViews).values({
        profileUserId: user.id,
        visitorHash: visitorHash,
        viewedAt: new Date(),
      });

      console.log(`✅ Tracked view for user ${username} (unique today, IP hash: ${visitorHash.substring(0, 8)}...), total views: ${currentViews + 1}`);
    } else {
      console.log(`✅ Tracked view for user ${username} (duplicate today, IP hash: ${visitorHash.substring(0, 8)}...), total views: ${currentViews + 1}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to increment view counter:", error);
    return { error: "Failed to increment view" };
  }
}