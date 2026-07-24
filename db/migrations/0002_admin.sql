-- Admin Dashboard Migration
-- Adds user suspension support and admin operation audit log

-- 1. Add suspended_at to users (NULL = active, timestamp = suspended)
ALTER TABLE users ADD COLUMN suspended_at TEXT DEFAULT NULL;

-- 2. Admin operation log
CREATE TABLE IF NOT EXISTS admin_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id TEXT NOT NULL,
    target_user_id TEXT,
    action TEXT NOT NULL,
    detail TEXT,
    ip_address TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for admin_logs
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target ON admin_logs(target_user_id);
