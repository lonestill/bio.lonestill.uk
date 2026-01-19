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

/**
 * Parse user agent to extract browser, OS, and device info
 */
export interface DeviceInfo {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: "desktop" | "mobile" | "tablet";
}

export function parseUserAgent(userAgent: string): DeviceInfo {
  const ua = userAgent.toLowerCase();
  
  // Default values
  let browser = "Unknown";
  let browserVersion = "";
  let os = "Unknown";
  let osVersion = "";
  let device: "desktop" | "mobile" | "tablet" = "desktop";
  
  // Detect device type
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    device = "mobile";
  } else if (/tablet|ipad|playbook|silk/i.test(ua)) {
    device = "tablet";
  }
  
  // Detect browser
  if (ua.includes("edg/")) {
    browser = "Edge";
    browserVersion = extractVersion(ua, "edg/");
  } else if (ua.includes("chrome/") && !ua.includes("edg/")) {
    browser = "Chrome";
    browserVersion = extractVersion(ua, "chrome/");
  } else if (ua.includes("firefox/")) {
    browser = "Firefox";
    browserVersion = extractVersion(ua, "firefox/");
  } else if (ua.includes("safari/") && !ua.includes("chrome/")) {
    browser = "Safari";
    browserVersion = extractVersion(ua, "version/");
  } else if (ua.includes("opera/") || ua.includes("opr/")) {
    browser = "Opera";
    browserVersion = extractVersion(ua, ua.includes("opr/") ? "opr/" : "opera/");
  } else if (ua.includes("trident/")) {
    browser = "IE";
    browserVersion = extractVersion(ua, "rv:");
  }
  
  // Detect OS
  if (ua.includes("windows nt 10")) {
    os = "Windows";
    osVersion = "10";
  } else if (ua.includes("windows nt 6.3")) {
    os = "Windows";
    osVersion = "8.1";
  } else if (ua.includes("windows nt 6.2")) {
    os = "Windows";
    osVersion = "8";
  } else if (ua.includes("windows nt 6.1")) {
    os = "Windows";
    osVersion = "7";
  } else if (ua.includes("windows")) {
    os = "Windows";
  } else if (ua.includes("mac os x")) {
    os = "macOS";
    const match = ua.match(/mac os x (\d+[._]\d+)/);
    if (match) {
      osVersion = match[1].replace("_", ".");
    }
  } else if (ua.includes("android")) {
    os = "Android";
    const match = ua.match(/android (\d+\.?\d*)/);
    if (match) {
      osVersion = match[1];
    }
  } else if (ua.includes("iphone") || ua.includes("ipad")) {
    os = ua.includes("iphone") ? "iOS" : "iPadOS";
    const match = ua.match(/os (\d+[._]\d+)/);
    if (match) {
      osVersion = match[1].replace("_", ".");
    }
  } else if (ua.includes("linux")) {
    os = "Linux";
  }
  
  return {
    browser,
    browserVersion,
    os,
    osVersion,
    device,
  };
}

function extractVersion(ua: string, keyword: string): string {
  const index = ua.indexOf(keyword);
  if (index === -1) return "";
  
  const start = index + keyword.length;
  const version = ua.substring(start).split(/[^\d.]/)[0];
  return version;
}

/**
 * Generate unique session ID
 */
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get or create session ID from cookies/localStorage
 * This should be called on the client side
 */
export function getSessionId(): string {
  if (typeof window === "undefined") return generateSessionId();
  
  // Try to get from sessionStorage first
  let sessionId = sessionStorage.getItem("analytics_session_id");
  
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  
  return sessionId;
}

/**
 * Get geographic info from IP (placeholder - would need external service like ipapi.co)
 */
export interface GeoInfo {
  country?: string;
  city?: string;
}

export async function getGeoFromIP(ip: string): Promise<GeoInfo> {
  // This is a placeholder. In production, you'd use a service like:
  // - ipapi.co
  // - ip-api.com
  // - maxmind GeoIP
  
  try {
    // Example with ipapi.co (free tier available)
    // const response = await fetch(`https://ipapi.co/${ip}/json/`);
    // const data = await response.json();
    // return {
    //   country: data.country_name,
    //   city: data.city,
    // };
    
    // For now, return empty
    return {};
  } catch (error) {
    console.error("Failed to get geo info:", error);
    return {};
  }
}

