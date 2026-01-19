import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { guestbookMessages, users, profiles } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getSession } from "@/lib/auth-utils";

// Get messages for a profile
export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username");
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "20"), 50);

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  try {
    // Get user ID by username
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .get();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if guestbook is enabled
    const profile = await db
      .select({ modules: profiles.modules })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .get();

    const modules = (profile?.modules || {}) as any;
    if (!modules.guestbook?.enabled) {
      return NextResponse.json({ error: "Guestbook disabled" }, { status: 404 });
    }

    // Get messages with author info
    const messages = await db
      .select({
        id: guestbookMessages.id,
        message: guestbookMessages.message,
        createdAt: guestbookMessages.createdAt,
        authorId: guestbookMessages.authorId,
        authorUsername: users.username,
        authorAvatar: profiles.avatarUrl,
        authorDisplayName: profiles.displayName,
      })
      .from(guestbookMessages)
      .innerJoin(users, eq(guestbookMessages.authorId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(guestbookMessages.profileUserId, user.id))
      .orderBy(desc(guestbookMessages.createdAt))
      .limit(limit)
      .all();

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        message: m.message,
        createdAt: m.createdAt?.toISOString(),
        author: {
          username: m.authorUsername,
          displayName: m.authorDisplayName || m.authorUsername,
          avatar: m.authorAvatar,
        },
      })),
    });
  } catch (error) {
    console.error("Guestbook fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// Post a new message
export async function POST(request: NextRequest) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  try {
    const { username, message } = await request.json();

    if (!username || !message) {
      return NextResponse.json({ error: "Username and message required" }, { status: 400 });
    }

    // Validate message length
    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 1 || trimmedMessage.length > 280) {
      return NextResponse.json({ error: "Message must be 1-280 characters" }, { status: 400 });
    }

    // Get profile user ID
    const profileUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .get();

    if (!profileUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if guestbook is enabled
    const profile = await db
      .select({ modules: profiles.modules })
      .from(profiles)
      .where(eq(profiles.userId, profileUser.id))
      .get();

    const modules = (profile?.modules || {}) as any;
    if (!modules.guestbook?.enabled) {
      return NextResponse.json({ error: "Guestbook disabled" }, { status: 403 });
    }

    // Prevent self-posting if disabled
    if (profileUser.id === session.userId && !modules.guestbook?.allowSelfPost) {
      return NextResponse.json({ error: "Cannot post on your own guestbook" }, { status: 403 });
    }

    // Insert message
    await db.insert(guestbookMessages).values({
      profileUserId: profileUser.id,
      authorId: session.userId,
      message: trimmedMessage,
    });

    // Get author info for response
    const author = await db
      .select({
        username: users.username,
        displayName: profiles.displayName,
        avatar: profiles.avatarUrl,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.id, session.userId))
      .get();

    return NextResponse.json({
      success: true,
      message: {
        message: trimmedMessage,
        createdAt: new Date().toISOString(),
        author: {
          username: author?.username,
          displayName: author?.displayName || author?.username,
          avatar: author?.avatar,
        },
      },
    });
  } catch (error) {
    console.error("Guestbook post error:", error);
    return NextResponse.json({ error: "Failed to post message" }, { status: 500 });
  }
}

// Delete a message (owner or profile owner)
export async function DELETE(request: NextRequest) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  try {
    const { messageId } = await request.json();

    if (!messageId) {
      return NextResponse.json({ error: "Message ID required" }, { status: 400 });
    }

    // Get message
    const message = await db
      .select()
      .from(guestbookMessages)
      .where(eq(guestbookMessages.id, messageId))
      .get();

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check permissions (author or profile owner)
    if (message.authorId !== session.userId && message.profileUserId !== session.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await db.delete(guestbookMessages).where(eq(guestbookMessages.id, messageId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Guestbook delete error:", error);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}
