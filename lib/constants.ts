export const RESERVED_USERNAMES = [
  "dashboard",
  "login",
  "register",
  "signin",
  "signup",
  "api",
  "admin",
  "settings",
  "bio",
  "home",
  "about",
  "terms",
  "privacy",
  "404",
  "500",
  "robots.txt",
  "sitemap.xml",
  "favicon.ico",
] as const;

// Premium features and limits
export const FEATURES = {
  FREE: {
    maxLinks: 10,
    maxBioLength: 500,
    analytics: false,
    customBadge: false,
    removeBranding: false,
    prioritySupport: false,
    earlyAccess: false,
  },
  PREMIUM: {
    maxLinks: Infinity,
    maxBioLength: 2000,
    analytics: true,
    customBadge: true,
    removeBranding: true,
    prioritySupport: true,
    earlyAccess: true,
  },
  ADMIN: {
    maxLinks: Infinity,
    maxBioLength: 5000,
    analytics: true,
    customBadge: true,
    removeBranding: true,
    prioritySupport: true,
    earlyAccess: true,
    adminPanel: true,
  },
} as const;

export function getFeatures(role: string) {
  if (role === "admin") return FEATURES.ADMIN;
  if (role === "premium") return FEATURES.PREMIUM;
  return FEATURES.FREE;
}