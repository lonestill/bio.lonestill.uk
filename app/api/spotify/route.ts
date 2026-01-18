import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { spotifyTokens, profiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

async function refreshAccessToken(userId: string, refreshToken: string): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  try {
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();

    if (!data.access_token) {
      console.error("Failed to refresh Spotify token:", data);
      return null;
    }

    // Update tokens in database
    const expiresAt = new Date(Date.now() + data.expires_in * 1000);
    await db
      .update(spotifyTokens)
      .set({
        accessToken: data.access_token,
        expiresAt,
        ...(data.refresh_token ? { refreshToken: data.refresh_token } : {}),
      })
      .where(eq(spotifyTokens.userId, userId));

    return data.access_token;
  } catch (error) {
    console.error("Error refreshing Spotify token:", error);
    return null;
  }
}

async function getValidAccessToken(userId: string): Promise<string | null> {
  const tokenRecord = await db
    .select()
    .from(spotifyTokens)
    .where(eq(spotifyTokens.userId, userId))
    .get();

  if (!tokenRecord) return null;

  // Check if token is expired (with 5 minute buffer)
  const isExpired = new Date(tokenRecord.expiresAt).getTime() < Date.now() + 5 * 60 * 1000;

  if (isExpired) {
    return await refreshAccessToken(userId, tokenRecord.refreshToken);
  }

  return tokenRecord.accessToken;
}

export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    // Get user by username
    const user = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .get();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if Spotify is enabled in profile
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .get();

    const modules = (profile?.modules || {}) as any;
    if (!modules.spotify?.enabled) {
      return NextResponse.json({ error: "Spotify not enabled" }, { status: 404 });
    }

    // Get valid access token
    const accessToken = await getValidAccessToken(user.id);

    if (!accessToken) {
      return NextResponse.json({ error: "Spotify not connected" }, { status: 404 });
    }

    // Fetch currently playing
    const currentlyPlayingResponse = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        next: { revalidate: 30 }, // Cache for 30 seconds
      }
    );

    let currentlyPlaying = null;
    if (currentlyPlayingResponse.status === 200) {
      const data = await currentlyPlayingResponse.json();
      if (data && data.item) {
        currentlyPlaying = {
          isPlaying: data.is_playing,
          name: data.item.name,
          artist: data.item.artists?.map((a: any) => a.name).join(", "),
          album: data.item.album?.name,
          albumArt: data.item.album?.images?.[0]?.url,
          url: data.item.external_urls?.spotify,
          duration: data.item.duration_ms,
          progress: data.progress_ms,
        };
      }
    }

    // If not currently playing, get recently played
    let recentlyPlayed = null;
    if (!currentlyPlaying) {
      const recentResponse = await fetch(
        "https://api.spotify.com/v1/me/player/recently-played?limit=1",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          next: { revalidate: 60 }, // Cache for 1 minute
        }
      );

      if (recentResponse.ok) {
        const data = await recentResponse.json();
        if (data.items && data.items.length > 0) {
          const track = data.items[0].track;
          recentlyPlayed = {
            name: track.name,
            artist: track.artists?.map((a: any) => a.name).join(", "),
            album: track.album?.name,
            albumArt: track.album?.images?.[0]?.url,
            url: track.external_urls?.spotify,
            playedAt: data.items[0].played_at,
          };
        }
      }
    }

    // Get top tracks for display
    const topTracksResponse = await fetch(
      "https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=short_term",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    let topTracks: any[] = [];
    if (topTracksResponse.ok) {
      const data = await topTracksResponse.json();
      topTracks = (data.items || []).map((track: any) => ({
        name: track.name,
        artist: track.artists?.map((a: any) => a.name).join(", "),
        albumArt: track.album?.images?.[2]?.url || track.album?.images?.[0]?.url,
        url: track.external_urls?.spotify,
      }));
    }

    return NextResponse.json({
      currentlyPlaying,
      recentlyPlayed,
      topTracks,
      spotifyUsername: modules.spotify?.username,
    });
  } catch (error: any) {
    console.error("Spotify API error:", error);
    return NextResponse.json({ error: "Failed to fetch Spotify data" }, { status: 500 });
  }
}
