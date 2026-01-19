import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { apiTokens } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth-utils";
import { generateApiToken, hashToken } from "@/lib/api-auth";
import { nanoid } from "nanoid";

// Get all tokens for authenticated user
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tokens = await db
      .select({
        id: apiTokens.id,
        name: apiTokens.name,
        lastUsedAt: apiTokens.lastUsedAt,
        createdAt: apiTokens.createdAt,
        expiresAt: apiTokens.expiresAt,
        rateLimit: apiTokens.rateLimit,
        requestCount: apiTokens.requestCount,
      })
      .from(apiTokens)
      .where(eq(apiTokens.userId, session.userId))
      .all();

    return NextResponse.json({ 
      tokens: tokens.map(t => ({
        ...t,
        lastUsedAt: t.lastUsedAt?.toISOString() || null,
        createdAt: t.createdAt.toISOString(),
        expiresAt: t.expiresAt?.toISOString() || null,
      }))
    });
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return NextResponse.json({ error: "Failed to fetch tokens" }, { status: 500 });
  }
}

// Create a new token
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = body.name || "API Token";
    const expiresInDays = body.expiresInDays; // Optional: null = never expires

    // Check token limit (max 5 per user)
    const existingTokens = await db
      .select({ id: apiTokens.id })
      .from(apiTokens)
      .where(eq(apiTokens.userId, session.userId))
      .all();

    if (existingTokens.length >= 5) {
      return NextResponse.json(
        { error: "Maximum 5 API tokens allowed per user" },
        { status: 400 }
      );
    }

    // Generate token
    const rawToken = generateApiToken();
    const hashedToken = await hashToken(rawToken);
    const tokenId = nanoid(12);

    // Calculate expiration
    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    await db.insert(apiTokens).values({
      id: tokenId,
      userId: session.userId,
      token: hashedToken,
      name,
      expiresAt,
      rateLimit: 1000,
      requestCount: 0,
    });

    return NextResponse.json({
      token: rawToken, // Only returned once!
      id: tokenId,
      name,
      expiresAt: expiresAt?.toISOString() || null,
      message: "Save this token - it won't be shown again!",
    });
  } catch (error) {
    console.error("Error creating token:", error);
    return NextResponse.json({ error: "Failed to create token" }, { status: 500 });
  }
}

// Delete a token
export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { tokenId } = await request.json();

    if (!tokenId) {
      return NextResponse.json({ error: "Token ID required" }, { status: 400 });
    }

    const result = await db
      .delete(apiTokens)
      .where(
        and(
          eq(apiTokens.id, tokenId),
          eq(apiTokens.userId, session.userId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting token:", error);
    return NextResponse.json({ error: "Failed to delete token" }, { status: 500 });
  }
}
