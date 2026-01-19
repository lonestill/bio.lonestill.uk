import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Badge types
export type BadgeType = "bughunter" | "hacker" | "early_adopter" | "premium" | "localhost";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  uid: integer("uid"), // Numeric user ID for display (unique via index)
  username: text("username").notNull().unique(),
  email: text("email"),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"), // 'user' | 'admin' | 'premium'
  badges: text("badges", { mode: "json" }).$type<BadgeType[]>(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at").notNull(),
});

export const profiles = sqliteTable("profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  displayName: text("display_name"),
  views: integer("views").notNull().default(0),
  bioText: text("bio_text"),
  avatarUrl: text("avatar_url"),
  backgroundUrl: text("background_url"),
  themeConfig: text("theme_config", { mode: "json" }).$type<{
    colors?: {
      primary?: string;
      secondary?: string;
      text?: string;
      background?: string;
    };
    opacity?: number;
    blur?: number;
  }>(),
  modules: text("modules", { mode: "json" }).$type<{
    music?: {
      url?: string;
      volume?: number;
      autoplay?: boolean;
    };
    socials?: Array<{
      platform: string;
      url: string;
      label: string;
    }>;
    effects?: {
      snow?: boolean;
      scanlines?: boolean;
      cursor?: string;
    };
  }>(),
});

// Analytics tables
export const profileViews = sqliteTable("profile_views", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  profileUserId: text("profile_user_id")
    .notNull()
    .references(() => profiles.userId, { onDelete: "cascade" }),
  visitorHash: text("visitor_hash").notNull(), // Hashed IP address
  viewedAt: integer("viewed_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const linkClicks = sqliteTable("link_clicks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  profileUserId: text("profile_user_id")
    .notNull()
    .references(() => profiles.userId, { onDelete: "cascade" }),
  linkIndex: integer("link_index").notNull(), // Index of link in socials array
  visitorHash: text("visitor_hash").notNull(), // Hashed IP address
  clickedAt: integer("clicked_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Spotify tokens table
export const spotifyTokens = sqliteTable("spotify_tokens", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  spotifyUserId: text("spotify_user_id"),
  spotifyDisplayName: text("spotify_display_name"),
});

// API tokens table
export const apiTokens = sqliteTable("api_tokens", {
  id: text("id").primaryKey(), // Token ID (for management)
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(), // The actual API token (hashed)
  name: text("name").notNull(), // User-friendly name
  lastUsedAt: integer("last_used_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  expiresAt: integer("expires_at", { mode: "timestamp" }), // Optional expiration
  rateLimit: integer("rate_limit").notNull().default(1000), // Requests per day
  requestCount: integer("request_count").notNull().default(0), // Today's requests
  requestCountResetAt: integer("request_count_reset_at", { mode: "timestamp" }),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type ProfileView = typeof profileViews.$inferSelect;
export type LinkClick = typeof linkClicks.$inferSelect;
export type SpotifyToken = typeof spotifyTokens.$inferSelect;
export type ApiToken = typeof apiTokens.$inferSelect;