import { db } from "@/db";
import { apiTokens } from "@/db/schema";
import { eq, and, gt, sql } from "drizzle-orm";

export interface ApiAuthResult {
  valid: boolean;
  userId?: string;
  error?: string;
  statusCode?: number;
}

// Hash the token for storage/comparison (Web Crypto API for Edge compatibility)
export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Generate a new API token
export function generateApiToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "bio_";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Validate API token from request
export async function validateApiToken(request: Request): Promise<ApiAuthResult> {
  const authHeader = request.headers.get("Authorization");
  
  if (!authHeader) {
    return { valid: false, error: "Missing Authorization header", statusCode: 401 };
  }

  const token = authHeader.startsWith("Bearer ") 
    ? authHeader.slice(7) 
    : authHeader;

  if (!token || !token.startsWith("bio_")) {
    return { valid: false, error: "Invalid token format", statusCode: 401 };
  }

  const hashedToken = await hashToken(token);

  try {
    const tokenRecord = await db
      .select()
      .from(apiTokens)
      .where(eq(apiTokens.token, hashedToken))
      .get();

    if (!tokenRecord) {
      return { valid: false, error: "Invalid API token", statusCode: 401 };
    }

    // Check expiration
    if (tokenRecord.expiresAt && new Date(tokenRecord.expiresAt) < new Date()) {
      return { valid: false, error: "API token has expired", statusCode: 401 };
    }

    // Check rate limit
    const now = new Date();
    const resetTime = tokenRecord.requestCountResetAt 
      ? new Date(tokenRecord.requestCountResetAt)
      : null;

    // Reset counter if it's a new day
    if (!resetTime || resetTime < new Date(now.setHours(0, 0, 0, 0))) {
      await db
        .update(apiTokens)
        .set({ 
          requestCount: 1, 
          requestCountResetAt: new Date(),
          lastUsedAt: new Date()
        })
        .where(eq(apiTokens.id, tokenRecord.id));
    } else {
      // Check if over limit
      if (tokenRecord.requestCount >= tokenRecord.rateLimit) {
        return { 
          valid: false, 
          error: `Rate limit exceeded (${tokenRecord.rateLimit}/day)`, 
          statusCode: 429 
        };
      }

      // Increment counter
      await db
        .update(apiTokens)
        .set({ 
          requestCount: tokenRecord.requestCount + 1,
          lastUsedAt: new Date()
        })
        .where(eq(apiTokens.id, tokenRecord.id));
    }

    return { valid: true, userId: tokenRecord.userId };
  } catch (error) {
    console.error("API auth error:", error);
    return { valid: false, error: "Authentication failed", statusCode: 500 };
  }
}

// Rate limit headers
export function getRateLimitHeaders(remaining: number, limit: number, reset: Date): HeadersInit {
  return {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": Math.max(0, remaining).toString(),
    "X-RateLimit-Reset": Math.floor(reset.getTime() / 1000).toString(),
  };
}
