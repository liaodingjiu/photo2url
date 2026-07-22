import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";
import {
  ALLOWED_MIME_TYPES,
  validateMagicBytes,
  mimeToExtension,
} from "@/utils/magic-bytes";
import {
  getUploadQuota,
  TURNSTILE_THRESHOLD,
  IP_DAILY_HARD_LIMIT,
} from "@/utils/upload-limit";

// Cloudflare Turnstile verification endpoint
const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Cookie name for guest tracking
const GUEST_COOKIE = "p2u_guest_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    // ================================================================
    // 1. Extract form data
    // ================================================================
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const turnstileToken = formData.get("cf-turnstile-response") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "no_file", message: "No file provided" },
        { status: 400 }
      );
    }

    // ================================================================
    // 2. Cookie / IP tracking
    // ================================================================
    let cookieId = request.cookies.get(GUEST_COOKIE)?.value;
    const isNewCookie = !cookieId;
    if (!cookieId) {
      cookieId = uuidv4();
    }

    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";

    // ================================================================
    // 3. Get user info (authenticated or guest)
    // ================================================================
    let clerkUserId: string | null = null;
    try {
      const { userId } = await auth();
      clerkUserId = userId ?? null;
    } catch {
      // Clerk not configured or auth failed — continue as guest
    }

    // Determine plan type and quota
    const planType = clerkUserId ? await getUserPlanType(clerkUserId) : "free";
    const quota = getUploadQuota(planType);

    // ================================================================
    // 4. Rate limit check (cookie + IP)
    // ================================================================
    const today = new Date().toISOString().split("T")[0]; // 'YYYY-MM-DD'

    // Check D1 for today's count
    const existingCount = await getTodayUploadCount(cookieId, ip, today);
    const cookieCount = existingCount?.cookie_count || 0;
    const ipCount = existingCount?.ip_count || 0;

    // Turnstile check: required after threshold (free/guest only)
    if (planType === "free" && cookieCount >= TURNSTILE_THRESHOLD) {
      if (!turnstileToken) {
        return NextResponse.json(
          {
            success: false,
            error: "turnstile_required",
            message: "Turnstile verification required",
          },
          { status: 400 }
        );
      }

      const turnstileValid = await verifyTurnstile(turnstileToken, ip);
      if (!turnstileValid) {
        return NextResponse.json(
          {
            success: false,
            error: "turnstile_failed",
            message: "Verification failed, please try again",
          },
          { status: 400 }
        );
      }
    }

    // Cookie limit (daily)
    if (cookieCount >= quota.dailyUploadLimit) {
      return NextResponse.json(
        {
          success: false,
          error: "daily_limit",
          message: `Daily upload limit reached (${quota.dailyUploadLimit} uploads/day)`,
        },
        { status: 429 }
      );
    }

    // IP hard limit (safety net)
    if (ipCount >= IP_DAILY_HARD_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          error: "ip_limit",
          message: "Upload limit exceeded for this network",
        },
        { status: 429 }
      );
    }

    // ================================================================
    // 5. File validation
    // ================================================================
    // 5a. MIME type check
    if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
      return NextResponse.json(
        {
          success: false,
          error: "invalid_type",
          message: `Unsupported file type: ${file.type}. Allowed: PNG, JPG, WEBP, GIF`,
        },
        { status: 400 }
      );
    }

    // 5b. Magic bytes check
    const fileBuffer = await file.arrayBuffer();
    if (!validateMagicBytes(fileBuffer, file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "invalid_file",
          message: "File content doesn't match its type. Please upload a valid image.",
        },
        { status: 400 }
      );
    }

    // 5c. File size check
    if (file.size > quota.fileSizeLimit) {
      const maxMB = Math.round(quota.fileSizeLimit / (1024 * 1024));
      return NextResponse.json(
        {
          success: false,
          error: "file_too_large",
          message: `File exceeds maximum size of ${maxMB} MB`,
        },
        { status: 400 }
      );
    }

    // ================================================================
    // 6. Storage limit check
    // ================================================================
    const currentStorage = await getCurrentStorage(clerkUserId, cookieId);
    if (currentStorage + file.size > quota.storageLimit) {
      const limitGB = Math.round(quota.storageLimit / (1024 * 1024 * 1024));
      return NextResponse.json(
        {
          success: false,
          error: "storage_full",
          message: `Storage limit reached (${limitGB} GB). Please upgrade your plan.`,
        },
        { status: 400 }
      );
    }

    // ================================================================
    // 7. R2 Upload
    // ================================================================
    const fileId = uuidv4();
    const ext = mimeToExtension(file.type);
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const r2Key = `uploads/${year}/${month}/${fileId}.${ext}`;

    // Access R2 binding (injected by Cloudflare Pages)
    // In local dev with wrangler, this comes from platform proxy
    const bucket = (process.env as any).BUCKET;
    if (!bucket) {
      // Fallback: try getting from platform context
      // For local dev without wrangler, return mock response
      console.warn("[R2] BUCKET binding not available — using mock");
    } else {
      await bucket.put(r2Key, fileBuffer, {
        httpMetadata: { contentType: file.type },
      });
    }

    // ================================================================
    // 8. D1 Write
    // ================================================================
    const expiresAt =
      quota.expiresDays !== null
        ? new Date(Date.now() + quota.expiresDays * 86400000)
            .toISOString()
            .split("T")[0]
        : null;

    await insertFileRecord({
      id: fileId,
      userId: clerkUserId || null,
      cookieId,
      r2Key,
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      expiresAt,
    });

    // Update user storage (if logged in)
    if (clerkUserId) {
      await incrementUserStorage(clerkUserId, file.size);
    }

    // ================================================================
    // 9. Update upload count
    // ================================================================
    await incrementUploadCount(cookieId, ip, today);

    // ================================================================
    // 10. Response
    // ================================================================
    const cdnDomain = process.env.CDN_DOMAIN || "cdn.photo2url.com";
    const appUrl = process.env.APP_URL || "https://photo2url.com";
    const url = `https://${cdnDomain}/${r2Key}`;
    const preview = `${appUrl}/i/${fileId}`;

    const response = NextResponse.json({
      success: true,
      url,
      preview,
      markdown: `![${file.name || "image"}](${url})`,
      html: `<img src="${url}" alt="${file.name || "image"}" />`,
      file: {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
      },
    });

    // Set guest cookie
    if (isNewCookie) {
      response.cookies.set(GUEST_COOKIE, cookieId!, {
        maxAge: COOKIE_MAX_AGE,
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("[upload] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "server_error",
        message: "Upload failed. Please try again later.",
      },
      { status: 500 }
    );
  }
}

// ================================================================
// Helper functions — interact with D1
// ================================================================

async function getUserPlanType(userId: string): Promise<string> {
  try {
    const db = (process.env as any).DB;
    if (!db) return "free";

    // Try to find existing user
    const result = await db
      .prepare("SELECT plan_type FROM users WHERE id = ?")
      .bind(userId)
      .first();

    if (result) {
      return result.plan_type || "free";
    }

    // User not found — lazy sync from Clerk to D1
    await db
      .prepare(
        "INSERT OR IGNORE INTO users (id, email, plan_type, storage_used) VALUES (?, ?, 'free', 0)"
      )
      .bind(userId, `clerk_${userId}@placeholder`)
      .run();

    return "free";
  } catch {
    return "free";
  }
}

interface CountResult {
  cookie_count?: number;
  ip_count?: number;
}

async function getTodayUploadCount(
  cookieId: string,
  ip: string,
  date: string
): Promise<CountResult | null> {
  try {
    const db = (process.env as any).DB;
    if (!db) return null;

    const cookieResult = await db
      .prepare(
        "SELECT COALESCE(SUM(count), 0) as cookie_count FROM upload_counts WHERE cookie_id = ? AND upload_date = ?"
      )
      .bind(cookieId, date)
      .first();

    const ipResult = await db
      .prepare(
        "SELECT COALESCE(SUM(count), 0) as ip_count FROM upload_counts WHERE ip = ? AND upload_date = ?"
      )
      .bind(ip, date)
      .first();

    return {
      cookie_count: (cookieResult as any)?.cookie_count || 0,
      ip_count: (ipResult as any)?.ip_count || 0,
    };
  } catch {
    return null;
  }
}

async function getCurrentStorage(
  userId: string | null,
  cookieId: string
): Promise<number> {
  try {
    const db = (process.env as any).DB;
    if (!db) return 0;

    const field = userId ? "user_id" : "cookie_id";
    const value = userId || cookieId;

    const result = await db
      .prepare(
        `SELECT COALESCE(SUM(file_size), 0) as total FROM files WHERE ${field} = ?`
      )
      .bind(value)
      .first();

    return (result as any)?.total || 0;
  } catch {
    return 0;
  }
}

async function insertFileRecord(params: {
  id: string;
  userId: string | null;
  cookieId: string;
  r2Key: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  expiresAt: string | null;
}): Promise<void> {
  try {
    const db = (process.env as any).DB;
    if (!db) return;

    await db
      .prepare(
        `INSERT INTO files (id, user_id, cookie_id, r2_key, original_name, file_size, mime_type, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        params.id,
        params.userId,
        params.cookieId,
        params.r2Key,
        params.originalName,
        params.fileSize,
        params.mimeType,
        params.expiresAt
      )
      .run();
  } catch (error) {
    console.error("[insertFileRecord] Error:", error);
  }
}

async function incrementUserStorage(userId: string, bytes: number) {
  try {
    const db = (process.env as any).DB;
    if (!db) return;
    await db
      .prepare(
        "UPDATE users SET storage_used = storage_used + ? WHERE id = ?"
      )
      .bind(bytes, userId)
      .run();
  } catch (error) {
    console.error("[incrementUserStorage] Error:", error);
  }
}

async function incrementUploadCount(
  cookieId: string,
  ip: string,
  date: string
) {
  try {
    const db = (process.env as any).DB;
    if (!db) return;

    await db
      .prepare(
        `INSERT INTO upload_counts (cookie_id, ip, upload_date, count)
         VALUES (?, ?, ?, 1)
         ON CONFLICT (cookie_id, ip, upload_date)
         DO UPDATE SET count = count + 1`
      )
      .bind(cookieId, ip, date)
      .run();
  } catch (error) {
    console.error("[incrementUploadCount] Error:", error);
  }
}

async function verifyTurnstile(
  token: string,
  ip: string
): Promise<boolean> {
  try {
    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
      console.warn("[Turnstile] Secret key not configured");
      return true; // Allow in dev without Turnstile
    }

    const formData = new FormData();
    formData.append("secret", secretKey);
    formData.append("response", token);
    formData.append("remoteip", ip);

    const result = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body: formData,
    });

    const data = (await result.json()) as { success: boolean };
    return data.success;
  } catch (error) {
    console.error("[Turnstile] Verification error:", error);
    return false;
  }
}
