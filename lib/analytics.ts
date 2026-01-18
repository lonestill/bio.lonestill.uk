import { createHash } from "crypto";

/**
 * Hash IP address for privacy-preserving analytics
 */
export function hashIP(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

/**
 * Get client IP from headers
 */
export function getClientIP(headers: Headers): string {
  // Try various headers that might contain the real IP
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  const realIP = headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  
  // Fallback to a default value if no IP found
  return "unknown";
}
