"use server";

import { lucia } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-config";
import { db } from "@/db";
import { users, profiles, sessions, profileViews, linkClicks, guestbookMessages, apiTokens, spotifyTokens, BadgeType } from "@/db/schema";
import { eq, sql, desc, and, gte, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Argon2id } from "oslo/password";
import { nanoid } from "nanoid";

// Helper function to check if user is admin
async function checkAdminAccess() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const sessionId = sessionCookie?.value ?? null;

  if (!sessionId) {
    throw new Error("Не авторизован");
  }

  const { session, user } = await lucia.validateSession(sessionId);

  if (!session) {
    throw new Error("Сессия недействительна");
  }

  if (user.role !== "admin") {
    throw new Error("Доступ запрещен");
  }

  return { session, user };
}

// Get all users with their profiles
export async function getAllUsers() {
  await checkAdminAccess();

  const allUsers = await db
    .select({
      id: users.id,
      uid: users.uid,
      username: users.username,
      email: users.email,
      role: users.role,
      badges: users.badges,
      createdAt: users.createdAt,
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl,
      views: profiles.views,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .orderBy(desc(users.createdAt));

  return allUsers;
}

// Update user role
export async function updateUserRole(userId: string, newRole: string) {
  await checkAdminAccess();

  if (!["user", "admin", "premium"].includes(newRole)) {
    throw new Error("Недопустимая роль");
  }

  await db.update(users).set({ role: newRole }).where(eq(users.id, userId));
  revalidatePath("/admin");
  return { success: true };
}

// Update user badges
export async function updateUserBadges(userId: string, badges: BadgeType[]) {
  await checkAdminAccess();

  const validBadges: BadgeType[] = [
    "bughunter",
    "hacker",
    "early_adopter",
    "premium",
    "localhost",
    "hello_kitty",
  ];
  const filteredBadges = badges.filter((b) => validBadges.includes(b));

  await db.update(users).set({ badges: filteredBadges }).where(eq(users.id, userId));
  revalidatePath("/admin");
  return { success: true };
}

// Delete user completely
export async function deleteUser(userId: string) {
  const { user: adminUser } = await checkAdminAccess();

  // Prevent self-deletion
  if (userId === adminUser.id) {
    throw new Error("Нельзя удалить самого себя");
  }

  // Delete user (cascades to profiles, sessions, etc.)
  await db.delete(users).where(eq(users.id, userId));
  revalidatePath("/admin");
  return { success: true };
}

// Create new user
export async function createUser(data: {
  username: string;
  email?: string;
  password: string;
  role: string;
}) {
  await checkAdminAccess();

  const { username, email, password, role } = data;

  // Check if username exists
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.username, username.toLowerCase()))
    .get();

  if (existing) {
    throw new Error("Пользователь с таким именем уже существует");
  }

  const passwordHash = await new Argon2id().hash(password);
  const userId = nanoid();

  // Get next UID
  const maxUid = await db
    .select({ maxUid: sql<number>`MAX(${users.uid})` })
    .from(users)
    .get();
  const nextUid = (maxUid?.maxUid || 0) + 1;

  await db.insert(users).values({
    id: userId,
    uid: nextUid,
    username: username.toLowerCase(),
    email: email || null,
    passwordHash,
    role,
  });

  // Create profile
  await db.insert(profiles).values({
    userId,
    displayName: username,
    views: 0,
  });

  revalidatePath("/admin");
  return { success: true, userId };
}

// Update user details
export async function updateUser(
  userId: string,
  data: {
    username?: string;
    email?: string;
    password?: string;
    displayName?: string;
  }
) {
  await checkAdminAccess();

  if (data.username) {
    // Check if new username is taken by another user
    const existing = await db
      .select()
      .from(users)
      .where(and(eq(users.username, data.username.toLowerCase())))
      .get();

    if (existing && existing.id !== userId) {
      throw new Error("Это имя пользователя уже занято");
    }

    await db
      .update(users)
      .set({ username: data.username.toLowerCase() })
      .where(eq(users.id, userId));
  }

  if (data.email !== undefined) {
    await db
      .update(users)
      .set({ email: data.email || null })
      .where(eq(users.id, userId));
  }

  if (data.password) {
    const passwordHash = await new Argon2id().hash(data.password);
    await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
  }

  if (data.displayName !== undefined) {
    await db
      .update(profiles)
      .set({ displayName: data.displayName || null })
      .where(eq(profiles.userId, userId));
  }

  revalidatePath("/admin");
  return { success: true };
}

// Get global analytics
export async function getGlobalAnalytics() {
  await checkAdminAccess();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Total users
  const totalUsersResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users)
    .get();
  const totalUsers = totalUsersResult?.count || 0;

  // Users created today
  const usersToday = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users)
    .where(gte(users.createdAt, today))
    .get();

  // Users created this week
  const usersThisWeek = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users)
    .where(gte(users.createdAt, weekAgo))
    .get();

  // Total profile views
  const totalViewsResult = await db
    .select({ total: sql<number>`SUM(${profiles.views})` })
    .from(profiles)
    .get();
  const totalViews = totalViewsResult?.total || 0;

  // Views today
  const viewsToday = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(profileViews)
    .where(gte(profileViews.viewedAt, today))
    .get();

  // Views this week
  const viewsThisWeek = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(profileViews)
    .where(gte(profileViews.viewedAt, weekAgo))
    .get();

  // Total link clicks
  const totalClicksResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(linkClicks)
    .get();
  const totalClicks = totalClicksResult?.count || 0;

  // Clicks today
  const clicksToday = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(linkClicks)
    .where(gte(linkClicks.clickedAt, today))
    .get();

  // Total guestbook messages
  const totalMessagesResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(guestbookMessages)
    .get();
  const totalMessages = totalMessagesResult?.count || 0;

  // Messages today
  const messagesToday = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(guestbookMessages)
    .where(gte(guestbookMessages.createdAt, today))
    .get();

  // Active API tokens
  const activeTokensResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(apiTokens)
    .get();
  const activeTokens = activeTokensResult?.count || 0;

  // Spotify connections
  const spotifyConnectionsResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(spotifyTokens)
    .get();
  const spotifyConnections = spotifyConnectionsResult?.count || 0;

  // Premium users
  const premiumUsersResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users)
    .where(eq(users.role, "premium"))
    .get();
  const premiumUsers = premiumUsersResult?.count || 0;

  // Admin users
  const adminUsersResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users)
    .where(eq(users.role, "admin"))
    .get();
  const adminUsers = adminUsersResult?.count || 0;

  // Recent registrations (last 7 days, by day)
  const recentRegistrations = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    
    const count = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(and(gte(users.createdAt, dayStart), lt(users.createdAt, dayEnd)))
      .get();
    
    recentRegistrations.push({
      date: dayStart.toISOString().split("T")[0],
      count: count?.count || 0,
    });
  }

  // Top users by views
  const topUsersByViews = await db
    .select({
      username: users.username,
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl,
      views: profiles.views,
    })
    .from(profiles)
    .innerJoin(users, eq(profiles.userId, users.id))
    .orderBy(desc(profiles.views))
    .limit(10);

  return {
    totalUsers,
    usersToday: usersToday?.count || 0,
    usersThisWeek: usersThisWeek?.count || 0,
    totalViews,
    viewsToday: viewsToday?.count || 0,
    viewsThisWeek: viewsThisWeek?.count || 0,
    totalClicks,
    clicksToday: clicksToday?.count || 0,
    totalMessages,
    messagesToday: messagesToday?.count || 0,
    activeTokens,
    spotifyConnections,
    premiumUsers,
    adminUsers,
    recentRegistrations,
    topUsersByViews,
  };
}

// Get all guestbook messages
export async function getAllGuestbookMessages() {
  await checkAdminAccess();

  const messages = await db
    .select({
      id: guestbookMessages.id,
      profileUserId: guestbookMessages.profileUserId,
      authorId: guestbookMessages.authorId,
      message: guestbookMessages.message,
      createdAt: guestbookMessages.createdAt,
      profileUsername: profiles.displayName,
      authorUsername: users.username,
    })
    .from(guestbookMessages)
    .leftJoin(profiles, eq(guestbookMessages.profileUserId, profiles.userId))
    .leftJoin(users, eq(guestbookMessages.authorId, users.id))
    .orderBy(desc(guestbookMessages.createdAt))
    .limit(100);

  return messages;
}

// Delete guestbook message
export async function deleteGuestbookMessage(messageId: number) {
  await checkAdminAccess();

  await db.delete(guestbookMessages).where(eq(guestbookMessages.id, messageId));
  revalidatePath("/admin");
  return { success: true };
}

// Get all sessions
export async function getAllSessions() {
  await checkAdminAccess();

  const allSessions = await db
    .select({
      id: sessions.id,
      userId: sessions.userId,
      expiresAt: sessions.expiresAt,
      username: users.username,
    })
    .from(sessions)
    .leftJoin(users, eq(sessions.userId, users.id))
    .orderBy(desc(sessions.expiresAt));

  return allSessions;
}

// Invalidate session
export async function invalidateSession(sessionId: string) {
  await checkAdminAccess();

  await lucia.invalidateSession(sessionId);
  revalidatePath("/admin");
  return { success: true };
}

// Invalidate all user sessions
export async function invalidateUserSessions(userId: string) {
  await checkAdminAccess();

  await lucia.invalidateUserSessions(userId);
  revalidatePath("/admin");
  return { success: true };
}

// Get all API tokens
export async function getAllApiTokens() {
  await checkAdminAccess();

  const tokens = await db
    .select({
      id: apiTokens.id,
      userId: apiTokens.userId,
      name: apiTokens.name,
      lastUsedAt: apiTokens.lastUsedAt,
      createdAt: apiTokens.createdAt,
      expiresAt: apiTokens.expiresAt,
      rateLimit: apiTokens.rateLimit,
      requestCount: apiTokens.requestCount,
      username: users.username,
    })
    .from(apiTokens)
    .leftJoin(users, eq(apiTokens.userId, users.id))
    .orderBy(desc(apiTokens.createdAt));

  return tokens;
}

// Delete API token
export async function deleteApiToken(tokenId: string) {
  await checkAdminAccess();

  await db.delete(apiTokens).where(eq(apiTokens.id, tokenId));
  revalidatePath("/admin");
  return { success: true };
}

// Update API token rate limit
export async function updateApiTokenRateLimit(tokenId: string, rateLimit: number) {
  await checkAdminAccess();

  await db.update(apiTokens).set({ rateLimit }).where(eq(apiTokens.id, tokenId));
  revalidatePath("/admin");
  return { success: true };
}

// Reset user profile views
export async function resetUserViews(userId: string) {
  await checkAdminAccess();

  await db.update(profiles).set({ views: 0 }).where(eq(profiles.userId, userId));
  await db.delete(profileViews).where(eq(profileViews.profileUserId, userId));
  await db.delete(linkClicks).where(eq(linkClicks.profileUserId, userId));
  revalidatePath("/admin");
  return { success: true };
}

// Cleanup old analytics data
export async function cleanupOldAnalytics(daysOld: number = 90) {
  await checkAdminAccess();

  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

  const deletedViews = await db
    .delete(profileViews)
    .where(lt(profileViews.viewedAt, cutoffDate));

  const deletedClicks = await db
    .delete(linkClicks)
    .where(lt(linkClicks.clickedAt, cutoffDate));

  revalidatePath("/admin");
  return { success: true };
}

// Ban user (set a special role or delete)
export async function banUser(userId: string, deleteAccount: boolean = false) {
  const { user: adminUser } = await checkAdminAccess();

  if (userId === adminUser.id) {
    throw new Error("Нельзя забанить самого себя");
  }

  if (deleteAccount) {
    await db.delete(users).where(eq(users.id, userId));
  } else {
    await db.update(users).set({ role: "banned" }).where(eq(users.id, userId));
    await lucia.invalidateUserSessions(userId);
  }

  revalidatePath("/admin");
  return { success: true };
}

// Unban user
export async function unbanUser(userId: string) {
  await checkAdminAccess();

  await db.update(users).set({ role: "user" }).where(eq(users.id, userId));
  revalidatePath("/admin");
  return { success: true };
}

// Get system stats
export async function getSystemStats() {
  await checkAdminAccess();

  const dbStats = {
    users: await db.select({ count: sql<number>`COUNT(*)` }).from(users).get(),
    profiles: await db.select({ count: sql<number>`COUNT(*)` }).from(profiles).get(),
    sessions: await db.select({ count: sql<number>`COUNT(*)` }).from(sessions).get(),
    profileViews: await db.select({ count: sql<number>`COUNT(*)` }).from(profileViews).get(),
    linkClicks: await db.select({ count: sql<number>`COUNT(*)` }).from(linkClicks).get(),
    guestbookMessages: await db.select({ count: sql<number>`COUNT(*)` }).from(guestbookMessages).get(),
    apiTokens: await db.select({ count: sql<number>`COUNT(*)` }).from(apiTokens).get(),
    spotifyTokens: await db.select({ count: sql<number>`COUNT(*)` }).from(spotifyTokens).get(),
  };

  return {
    tables: {
      users: dbStats.users?.count || 0,
      profiles: dbStats.profiles?.count || 0,
      sessions: dbStats.sessions?.count || 0,
      profileViews: dbStats.profileViews?.count || 0,
      linkClicks: dbStats.linkClicks?.count || 0,
      guestbookMessages: dbStats.guestbookMessages?.count || 0,
      apiTokens: dbStats.apiTokens?.count || 0,
      spotifyTokens: dbStats.spotifyTokens?.count || 0,
    },
  };
}

// Boost unique views (profile views)
export async function boostUniqueViews(userId: string, amount: number) {
  await checkAdminAccess();

  if (amount <= 0) {
    throw new Error("Количество должно быть больше 0");
  }

  // Check if user profile exists
  const profile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .get();

  if (!profile) {
    throw new Error("Профиль пользователя не найден");
  }

  // Generate unique visitor hashes for each view
  const profileViews_data = Array.from({ length: amount }, (_, i) => ({
    profileUserId: userId,
    visitorHash: `admin_boost_${Date.now()}_${i}`,
    viewedAt: new Date(),
  }));

  // Insert all views at once
  await db.insert(profileViews).values(profileViews_data);

  revalidatePath("/admin");
  return { success: true, amount };
}

// Boost simple views (profile.views counter)
export async function boostSimpleViews(userId: string, amount: number) {
  await checkAdminAccess();

  if (amount <= 0) {
    throw new Error("Количество должно быть больше 0");
  }

  // Check if user profile exists
  const profile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .get();

  if (!profile) {
    throw new Error("Профиль пользователя не найден");
  }

  // Update views counter
  const newViews = (profile.views || 0) + amount;
  await db
    .update(profiles)
    .set({ views: newViews })
    .where(eq(profiles.userId, userId));

  revalidatePath("/admin");
  return { success: true, amount, newTotal: newViews };
}

// Get profile views details
export async function getUserViewsDetails(userId: string) {
  await checkAdminAccess();

  const profile = await db
    .select({
      userId: profiles.userId,
      displayName: profiles.displayName,
      views: profiles.views,
    })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .get();

  if (!profile) {
    throw new Error("Профиль пользователя не найден");
  }

  // Get count of unique profile views
  const uniqueViews = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(profileViews)
    .where(eq(profileViews.profileUserId, userId))
    .get();

  // Get recent views
  const recentViews = await db
    .select({
      visitorHash: profileViews.visitorHash,
      viewedAt: profileViews.viewedAt,
    })
    .from(profileViews)
    .where(eq(profileViews.profileUserId, userId))
    .orderBy(desc(profileViews.viewedAt))
    .limit(20);

  return {
    profile,
    uniqueViewsCount: uniqueViews?.count || 0,
    simpleViewsCount: profile.views || 0,
    recentViews,
  };
}
