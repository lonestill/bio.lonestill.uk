"use server";

import { lucia } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-config";
import { db } from "@/db";
import { profiles, users } from "@/db/schema";
import { updateProfileSchema } from "@/lib/validation";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateProfile(
  prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  try {
    console.log("=== UPDATE PROFILE START ===");
    console.log("FormData entries:", Array.from(formData.entries()));
    
    // Get session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    const sessionId = sessionCookie?.value ?? null;
    console.log("Session ID exists:", !!sessionId);
    
    if (!sessionId) {
      return { error: "Unauthorized" };
    }
    const { session } = await lucia.validateSession(sessionId);

    if (!session) {
      return { error: "Unauthorized" };
    }

    // Get current profile to merge with existing data
    const currentProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.userId))
      .get();

    if (!currentProfile) {
      return { error: "Profile not found" };
    }

    // Handle music URL and effects separately
    const musicUrl = formData.get("musicUrl");
    const musicVolume = formData.get("musicVolume");
    const musicAutoplay = formData.get("musicAutoplay");
    const effectsJson = formData.get("effectsJson");
    const modulesJson = formData.get("modulesJson");
    
    console.log("Music URL from form:", musicUrl);
    console.log("Music volume:", musicVolume);
    console.log("Music autoplay:", musicAutoplay);
    console.log("Effects JSON:", effectsJson);
    console.log("Modules JSON:", modulesJson);
    
    const existingModules = currentProfile.modules || {};
    
    // Parse modulesJson if provided (from new ProfileSettings)
    let updatedModules = existingModules;
    if (modulesJson) {
      try {
        updatedModules = JSON.parse(modulesJson as string);
      } catch (e) {
        console.error("Failed to parse modulesJson:", e);
      }
    }

    const rawDisplayName = formData.get("displayName");
    const rawBioText = formData.get("bioText");
    const rawAvatarUrl = formData.get("avatarUrl");
    const rawBackgroundUrl = formData.get("backgroundUrl");
    const rawThemeConfig = formData.get("themeConfig");
    
    console.log("Raw form values:");
    console.log("  displayName:", rawDisplayName, "| type:", typeof rawDisplayName, "| length:", (rawDisplayName as string)?.length);
    console.log("  bioText:", rawBioText?.toString().substring(0, 50), "| type:", typeof rawBioText, "| length:", (rawBioText as string)?.length);
    console.log("  avatarUrl:", rawAvatarUrl, "| type:", typeof rawAvatarUrl, "| empty:", rawAvatarUrl === "");
    console.log("  backgroundUrl:", rawBackgroundUrl, "| type:", typeof rawBackgroundUrl, "| empty:", rawBackgroundUrl === "");
    console.log("  musicUrl:", musicUrl, "| type:", typeof musicUrl, "| empty:", musicUrl === "");

    // Store raw values to know if field was explicitly cleared
    const hasDisplayName = rawDisplayName !== null;
    const hasBioText = rawBioText !== null;
    const hasAvatarUrl = rawAvatarUrl !== null;
    const hasBackgroundUrl = rawBackgroundUrl !== null;
    
    // IMPORTANT: Don't pass modules to validation - it may contain invalid data from DB
    // We'll handle modules separately after validation
    const rawData = {
      displayName: (rawDisplayName as string)?.trim() || undefined,
      bioText: (rawBioText as string)?.trim() || undefined,
      avatarUrl: (rawAvatarUrl as string)?.trim() || undefined,
      backgroundUrl: (rawBackgroundUrl as string)?.trim() || undefined,
      themeConfig: rawThemeConfig
        ? JSON.parse(rawThemeConfig as string)
        : undefined,
      // modules removed from validation - handled separately
    };

  console.log("Raw data prepared for validation:");
  console.log("  displayName:", rawData.displayName);
  console.log("  bioText:", rawData.bioText?.substring(0, 50));
  console.log("  avatarUrl:", rawData.avatarUrl, "| type:", typeof rawData.avatarUrl, "| is undefined:", rawData.avatarUrl === undefined);
  console.log("  backgroundUrl:", rawBackgroundUrl, "| type:", typeof rawData.backgroundUrl, "| is undefined:", rawData.backgroundUrl === undefined);

  const result = updateProfileSchema.safeParse(rawData);
  
  console.log("Validation result:", {
    success: result.success,
    error: result.error ? result.error.errors.map(e => ({ path: e.path, message: e.message })) : null
  });

  if (!result.success) {
    console.error("Validation failed:", result.error.errors);
    console.error("Full error object:", JSON.stringify(result.error, null, 2));
    return { error: result.error.errors[0].message };
  }

  const data = result.data;
  
  console.log("Validated data:", JSON.stringify(data, null, 2));

  // Merge with existing data - include fields that were in the form
  const updateData: any = {};
  
  // Always update displayName if it was in the form
  if (hasDisplayName) {
    updateData.displayName = data.displayName || null;
    console.log("Adding displayName to updateData:", data.displayName || "null");
  }
  
  // Always update bioText if it was in the form
  if (hasBioText) {
    updateData.bioText = data.bioText || null;
    console.log("Adding bioText to updateData:", data.bioText ? data.bioText.substring(0, 50) : "null");
  }
  
  // Always update avatarUrl if it was in the form
  if (hasAvatarUrl) {
    updateData.avatarUrl = data.avatarUrl || null;
    console.log("Adding avatarUrl to updateData:", data.avatarUrl || "null");
  }
  
  // Always update backgroundUrl if it was in the form
  if (hasBackgroundUrl) {
    updateData.backgroundUrl = data.backgroundUrl || null;
    console.log("Adding backgroundUrl to updateData:", data.backgroundUrl || "null");
  }
  if (data.themeConfig !== undefined) {
    updateData.themeConfig = {
      ...(currentProfile.themeConfig || {}),
      ...data.themeConfig,
    };
    console.log("Adding themeConfig to updateData");
  }
  
  // Handle modules - either from modulesJson (new ProfileSettings) or individual fields (EffectsSettings)
  if (modulesJson) {
    // If modulesJson is provided, use it directly (from new ProfileSettings)
    updateData.modules = updatedModules;
    console.log("Adding modules from modulesJson to updateData:", JSON.stringify(updatedModules));
  } else {
    // Otherwise, handle individual fields (from EffectsSettings or old forms)
    const shouldUpdateModules = musicUrl !== null || effectsJson !== null || musicVolume !== null || musicAutoplay !== null;
    
    if (shouldUpdateModules) {
      const finalModules = { ...existingModules };
      
      // Update music if provided
      if (musicUrl !== null || musicVolume !== null || musicAutoplay !== null) {
        finalModules.music = {
          ...(existingModules.music || {}),
        };
        
        if (musicUrl !== null) {
          const finalMusicUrl = musicUrl.toString().trim() !== "" ? musicUrl.toString().trim() : null;
          finalModules.music.url = finalMusicUrl;
        }
        
        if (musicVolume !== null) {
          const volume = parseInt(musicVolume.toString()) || 30;
          finalModules.music.volume = volume;
        }
        
        if (musicAutoplay !== null) {
          finalModules.music.autoplay = musicAutoplay.toString() === "1";
        }
      }
      
      // Update effects if provided
      if (effectsJson !== null) {
        try {
          const effects = JSON.parse(effectsJson.toString());
          finalModules.effects = {
            ...(existingModules.effects || {}),
            ...effects,
          };
          console.log("Adding modules.effects to updateData:", effects);
        } catch (e) {
          console.error("Failed to parse effects JSON:", e);
        }
      }
      
      updateData.modules = finalModules;
      console.log("Adding modules to updateData:", JSON.stringify(finalModules));
    }
  }

  console.log("Final updateData:", JSON.stringify(updateData, null, 2));
  console.log("UpdateData keys:", Object.keys(updateData));
  console.log("About to execute DB update for userId:", session.userId);

  const updateResult = await db
    .update(profiles)
    .set(updateData)
    .where(eq(profiles.userId, session.userId));
    
  console.log("DB update executed. Checking updated profile...");
  
  // Verify the update
  const updatedProfile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, session.userId))
    .get();
    
  console.log("Updated profile displayName:", updatedProfile?.displayName);
  console.log("Updated profile bioText:", updatedProfile?.bioText?.substring(0, 50));
  console.log("Updated profile avatarUrl:", updatedProfile?.avatarUrl ? "URL present" : "no URL");
  console.log("Updated profile backgroundUrl:", updatedProfile?.backgroundUrl ? "URL present" : "no URL");
  console.log("Updated profile modules.music.url:", updatedProfile?.modules?.music?.url);

  // Revalidate the profile page
  const user = await db
    .select({ username: users.username })
    .from(users)
    .where(eq(users.id, session.userId))
    .get();

  if (user) {
    revalidatePath(`/${user.username}`, 'page');
    revalidatePath('/dashboard', 'page');
  }

  return { success: true };
  } catch (error: any) {
    // NEXT_REDIRECT - это нормальное поведение Next.js, не ошибка
    if (error?.digest === "NEXT_REDIRECT" || error?.message?.includes("NEXT_REDIRECT")) {
      throw error; // Пробрасываем redirect дальше
    }
    console.error("Error in updateProfile function:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}