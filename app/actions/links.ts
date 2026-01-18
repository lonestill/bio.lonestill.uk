"use server";

import { lucia } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-config";
import { db } from "@/db";
import { profiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

interface Link {
  platform: string;
  url: string;
  label: string;
}

export async function updateLinks(links: Link[]) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    const sessionId = sessionCookie?.value ?? null;
    
    if (!sessionId) {
      return { error: "Unauthorized" };
    }
    
    const { session } = await lucia.validateSession(sessionId);
    
    if (!session) {
      return { error: "Unauthorized" };
    }

    const currentProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.userId))
      .get();

    if (!currentProfile) {
      return { error: "Profile not found" };
    }

    const existingModules = currentProfile.modules || {};
    
    await db
      .update(profiles)
      .set({
        modules: {
          ...existingModules,
          socials: links,
        },
      })
      .where(eq(profiles.userId, session.userId));

    const user = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.id, session.userId))
      .get();

    if (user) {
      revalidatePath('/dashboard', 'page');
      revalidatePath(`/${user.username}`, 'page');
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating links:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}
