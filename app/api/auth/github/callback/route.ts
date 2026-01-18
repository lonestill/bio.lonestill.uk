import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth-utils";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

function getRedirectUri(request: NextRequest): string {
  // Use explicit env variable if set
  if (process.env.GITHUB_REDIRECT_URI) {
    return process.env.GITHUB_REDIRECT_URI;
  }
  
  // Use NEXT_PUBLIC_BASE_URL if set
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/github/callback`;
  }
  
  // Fallback to request origin (includes port for localhost)
  const origin = request.nextUrl.origin;
  return `${origin}/api/auth/github/callback`;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    
    const cookieStore = await cookies();
    const storedState = cookieStore.get("github_oauth_state")?.value;

    if (!code || !state || state !== storedState) {
      const redirectUrl = new URL("/dashboard", request.nextUrl.origin);
      redirectUrl.searchParams.set("tab", "connections");
      redirectUrl.searchParams.set("error", "invalid_state");
      redirectUrl.searchParams.set("service", "github");
      return NextResponse.redirect(redirectUrl);
    }

    // Exchange code for access token
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const redirectUri = getRedirectUri(request);
    
    // Log for debugging (remove in production)
    if (process.env.NODE_ENV === "development") {
      console.log("GitHub OAuth callback redirect_uri:", redirectUri);
    }

    if (!clientId || !clientSecret) {
      const redirectUrl = new URL("/dashboard", request.nextUrl.origin);
      redirectUrl.searchParams.set("tab", "connections");
      redirectUrl.searchParams.set("error", "not_configured");
      redirectUrl.searchParams.set("service", "github");
      return NextResponse.redirect(redirectUrl);
    }

    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      const redirectUrl = new URL("/dashboard", request.nextUrl.origin);
      redirectUrl.searchParams.set("tab", "connections");
      redirectUrl.searchParams.set("error", "token_failed");
      redirectUrl.searchParams.set("service", "github");
      return NextResponse.redirect(redirectUrl);
    }

    // Get user info from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const githubUser = await userResponse.json();

    if (!githubUser.login) {
      const redirectUrl = new URL("/dashboard", request.nextUrl.origin);
      redirectUrl.searchParams.set("tab", "connections");
      redirectUrl.searchParams.set("error", "user_fetch_failed");
      redirectUrl.searchParams.set("service", "github");
      return NextResponse.redirect(redirectUrl);
    }

    // Get current session
    const session = await getSession();
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.nextUrl.origin));
    }

    // Update profile with GitHub username
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.userId))
      .get();

    if (profile) {
      const modules = (profile.modules || {}) as any;
      const updatedModules = {
        ...modules,
        github: {
          ...modules.github,
          username: githubUser.login,
          enabled: modules.github?.enabled !== false,
        },
      };

      await db
        .update(profiles)
        .set({ modules: updatedModules })
        .where(eq(profiles.userId, session.userId));
    }

    // Clear state cookie
    cookieStore.delete("github_oauth_state");

    const redirectUrl = new URL("/dashboard", request.nextUrl.origin);
    redirectUrl.searchParams.set("tab", "connections");
    redirectUrl.searchParams.set("success", "connected");
    redirectUrl.searchParams.set("service", "github");
    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error("GitHub OAuth error:", error);
    const redirectUrl = new URL("/dashboard", request.nextUrl.origin);
    redirectUrl.searchParams.set("tab", "connections");
    redirectUrl.searchParams.set("error", "oauth_failed");
    redirectUrl.searchParams.set("service", "github");
    return NextResponse.redirect(redirectUrl);
  }
}
