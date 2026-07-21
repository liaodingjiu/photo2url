import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// ==================== Users ====================
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  planType: text("plan_type").default("free").notNull(), // 'free' | 'plus' | 'enterprise'
  storageUsed: integer("storage_used").default(0).notNull(),
  apiKey: text("api_key").unique(),
  createdAt: text("created_at").default("sql`(datetime('now'))`"),
});

// ==================== Files ====================
export const files = sqliteTable("files", {
  id: text("id").primaryKey(),
  userId: text("user_id"), // NULL for guest
  cookieId: text("cookie_id"), // Guest tracking
  r2Key: text("r2_key").notNull(),
  originalName: text("original_name"),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  createdAt: text("created_at").default("sql`(datetime('now'))`"),
  expiresAt: text("expires_at"), // NULL = permanent (Plus/Enterprise)
});

// ==================== Subscriptions ====================
export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  lemonSubId: text("lemon_sub_id").notNull(),
  status: text("status").notNull(), // 'active' | 'canceled' | 'past_due' | 'expired'
  currentPeriodEnd: text("current_period_end").notNull(),
  createdAt: text("created_at").default("sql`(datetime('now'))`"),
});

// ==================== Pending Subscriptions ====================
// Stores purchases from unauthenticated users, matched by email on sign-up
export const pendingSubscriptions = sqliteTable("pending_subscriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  planType: text("plan_type").notNull(), // 'plus' | 'enterprise'
  lemonSubId: text("lemon_sub_id").notNull(),
  status: text("status").notNull().default("pending"), // 'pending' | 'claimed' | 'expired'
  createdAt: text("created_at").default("sql`(datetime('now'))`"),
});

// ==================== Upload Counts ====================
export const uploadCounts = sqliteTable("upload_counts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cookieId: text("cookie_id").notNull(),
  ip: text("ip").notNull(),
  uploadDate: text("upload_date").notNull(), // 'YYYY-MM-DD'
  count: integer("count").default(1).notNull(),
});
