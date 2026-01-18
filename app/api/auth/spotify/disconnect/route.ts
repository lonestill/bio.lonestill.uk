import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";
import { db } from "@/db";
import { spotifyTokens } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete Spotify tokens from database
    await db.delete(spotifyTokens).where(eq(spotifyTokens.userId, session.userId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Spotify disconnect error:", error);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }
}
