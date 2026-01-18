import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Badge types
export type BadgeType = "bughunter" | "hacker" | "early_adopter" | "premium";

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

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type ProfileView = typeof profileViews.$inferSelect;
export type LinkClick = typeof linkClicks.$inferSelect;