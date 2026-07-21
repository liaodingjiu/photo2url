-- photo2url D1 Database Schema
-- Cloudflare D1 (SQLite-compatible)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    plan_type TEXT DEFAULT 'free', -- 'free', 'plus', 'enterprise'
    storage_used INTEGER DEFAULT 0, -- Total used bytes
    api_key TEXT UNIQUE,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 2. Files Metadata Table
CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    user_id TEXT, -- NULL for Guest/Anonymous users
    cookie_id TEXT, -- Cookie-based tracking for guests (new for MVP)
    r2_key TEXT NOT NULL,
    original_name TEXT,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT, -- 30 days for Free/Guest, NULL for Plus/Enterprise
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- 3. Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    lemon_sub_id TEXT NOT NULL,
    status TEXT NOT NULL, -- 'active', 'canceled', 'past_due', 'expired'
    current_period_end TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- 4. Upload Counts Table (for rate limiting)
CREATE TABLE IF NOT EXISTS upload_counts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cookie_id TEXT NOT NULL,
    ip TEXT NOT NULL,
    upload_date TEXT NOT NULL, -- 'YYYY-MM-DD'
    count INTEGER DEFAULT 1,
    UNIQUE(cookie_id, ip, upload_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_cookie_id ON files(cookie_id);
CREATE INDEX IF NOT EXISTS idx_files_expires_at ON files(expires_at);
CREATE INDEX IF NOT EXISTS idx_upload_counts_date ON upload_counts(upload_date);
CREATE INDEX IF NOT EXISTS idx_upload_counts_cookie ON upload_counts(cookie_id, upload_date);
CREATE INDEX IF NOT EXISTS idx_upload_counts_ip ON upload_counts(ip, upload_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
