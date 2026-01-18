import { NextRequest, NextResponse } from "next/server";

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
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = getRedirectUri(request);
  
  if (!clientId) {
    return NextResponse.json({ error: "GitHub OAuth not configured" }, { status: 500 });
  }

  // Log for debugging (remove in production)
  if (process.env.NODE_ENV === "development") {
    console.log("GitHub OAuth redirect_uri:", redirectUri);
  }

  const state = Math.random().toString(36).substring(7);
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user&state=${state}`;
  
  const response = NextResponse.redirect(authUrl);
  response.cookies.set("github_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
  });
  
  return response;
}
