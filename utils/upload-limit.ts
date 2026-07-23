/**
 * Upload limits for each plan tier.
 * All sizes in bytes.
 */

export const UPLOAD_LIMITS = {
  free: {
    fileSizeLimit: 3 * 1024 * 1024,       // 3 MB
    dailyUploadLimit: 15,
    storageLimit: 200 * 1024 * 1024,       // 200 MB
    expiresDays: 180,
  },
  plus: {
    fileSizeLimit: 50 * 1024 * 1024,       // 50 MB
    dailyUploadLimit: 1000,
    storageLimit: 100 * 1024 * 1024 * 1024, // 100 GB
    expiresDays: null,                      // Permanent
  },
  enterprise: {
    fileSizeLimit: 256 * 1024 * 1024,       // 256 MB
    dailyUploadLimit: Infinity,            // Unlimited
    storageLimit: 200 * 1024 * 1024 * 1024, // 200 GB
    expiresDays: null,                      // Permanent
  },
} as const;

export type PlanType = keyof typeof UPLOAD_LIMITS;

/** Guest/Free tier: Turnstile kicks in after this many uploads */
export const TURNSTILE_THRESHOLD = 9;

/** IP-level hard cap (per day) — safety net beyond cookie tracking */
export const IP_DAILY_HARD_LIMIT = 50;

export interface UploadQuota {
  /** Max file size in bytes */
  fileSizeLimit: number;
  /** Max uploads per day */
  dailyUploadLimit: number;
  /** Total storage limit in bytes */
  storageLimit: number;
  /** Days until file expires (null = permanent) */
  expiresDays: number | null;
}

export function getUploadQuota(planType: string): UploadQuota {
  const type = (planType || "free") as PlanType;
  return UPLOAD_LIMITS[type] || UPLOAD_LIMITS.free;
}
