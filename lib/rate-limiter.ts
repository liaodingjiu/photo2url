/**
 * In-memory rate limiter for admin API routes.
 * Tracks requests per admin user, resets every 60 seconds.
 * Edge-compatible (no external dependencies).
 */

const store = new Map<string, { count: number; resetAt: number }>();

// Cleanup stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

/**
 * Check if a request should be rate-limited.
 * @param key - Unique identifier (typically admin userId)
 * @param maxRequests - Max requests per window (default 60)
 * @param windowMs - Time window in ms (default 60000 = 1 minute)
 * @returns true if allowed, false if rate-limited
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 60,
  windowMs: number = 60_000
): boolean {
  cleanup();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}
