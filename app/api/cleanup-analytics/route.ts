import { db } from "@/db";
import { profileViews, linkClicks } from "@/db/schema";
import { lt } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * Cleanup old analytics data (older than 1 day)
 * This should be called once per day via a cron job or scheduled task
 */
export async function POST(request: Request) {
  try {
    // Only allow this endpoint to be called with a secret key
    const authHeader = request.headers.get("authorization");
    const secretKey = process.env.ANALYTICS_CLEANUP_SECRET;
    
    if (!secretKey || authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete records older than 1 day
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Clean up old profile views
    const deletedViews = await db
      .delete(profileViews)
      .where(lt(profileViews.viewedAt, oneDayAgo));

    // Clean up old link clicks
    const deletedClicks = await db
      .delete(linkClicks)
      .where(lt(linkClicks.clickedAt, oneDayAgo));

    return NextResponse.json({
      success: true,
      message: "Analytics cleanup completed",
      deletedViews: deletedViews.rowsAffected || 0,
      deletedClicks: deletedClicks.rowsAffected || 0,
    });
  } catch (error: any) {
    console.error("Error cleaning up analytics:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cleanup analytics" },
      { status: 500 }
    );
  }
}
