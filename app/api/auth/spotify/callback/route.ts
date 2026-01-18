import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth-utils";
import { db } from "@/db";
import { spotifyTokens, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

function getRedirectUri(request: NextRequest): string {
  if (process.env.SPOTIFY_REDIRECT_URI) {
    return process.env.SPOTIFY_REDIRECT_URI;
  }
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/spotify/callback`;
  }
  const origin = request.nextUrl.origin;
  return `${origin}/api/auth/spotify/callback`;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    const cookieStore = await cookies();
    const storedState = cookieStore.get("spotify_oauth_state")?.value;

    // Handle Spotify errors
    if (error) {
      return NextResponse.redirect(
        new URL(`/dashboard?tab=connections&error=${error}`, request.nextUrl.origin)
      );
    }

    // Validate state
    if (!code || !state || state !== storedState) {
      return NextResponse.redirect(
        new URL("/dashboard?tab=connections&error=invalid_state", request.nextUrl.origin)
      );
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = getRedirectUri(request);

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        new URL("/dashboard?tab=connections&error=not_configured", request.nextUrl.origin)
      );
    }

    // Exchange code for tokens
    const tokenResponse = await fetch(SPOTIFY_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error("Spotify token error:", tokenData);
      return NextResponse.redirect(
        new URL("/dashboard?tab=connections&error=token_failed", request.nextUrl.origin)
      );
    }

    // Get user info from Spotify
    const userResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const spotifyUser = await userResponse.json();

    if (!spotifyUser.id) {
      return NextResponse.redirect(
        new URL("/dashboard?tab=connections&error=user_fetch_failed", request.nextUrl.origin)
      );
    }

    // Get current session
    const session = await getSession();
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.nextUrl.origin));
    }

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    // Save tokens to database
    await db
      .insert(spotifyTokens)
      .values({
        userId: session.userId,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt,
        spotifyUserId: spotifyUser.id,
        spotifyDisplayName: spotifyUser.display_name,
      })
      .onConflictDoUpdate({
        target: spotifyTokens.userId,
        set: {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresAt,
          spotifyUserId: spotifyUser.id,
          spotifyDisplayName: spotifyUser.display_name,
        },
      });

    // Update profile modules
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.userId))
      .get();

    if (profile) {
      const modules = (profile.modules || {}) as any;
      const updatedModules = {
        ...modules,
        spotify: {
          ...modules.spotify,
          connected: true,
          username: spotifyUser.display_name || spotifyUser.id,
          enabled: modules.spotify?.enabled !== false,
        },
      };

      await db
        .update(profiles)
        .set({ modules: updatedModules })
        .where(eq(profiles.userId, session.userId));
    }

    // Clear OAuth state cookie
    cookieStore.delete("spotify_oauth_state");

    return NextResponse.redirect(
      new URL("/dashboard?tab=connections&success=spotify_connected", request.nextUrl.origin)
    );
  } catch (error: any) {
    console.error("Spotify OAuth error:", error);
    return NextResponse.redirect(
      new URL("/dashboard?tab=connections&error=oauth_failed", request.nextUrl.origin)
    );
  }
}
