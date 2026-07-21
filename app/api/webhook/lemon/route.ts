import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

/**
 * POST /api/webhook/lemon
 * Handle Lemon Squeezy subscription events.
 * Webhook URL: https://photo2url.com/api/webhook/lemon
 *
 * Uses Web Crypto API for Edge Runtime compatibility.
 */

// HMAC-SHA256 signature verification using Web Crypto API
async function verifySignature(
  payload: string,
  secret: string,
  signature: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sigBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );

  const expected = Array.from(new Uint8Array(sigBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expected === signature;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-signature");

    // 1. Verify webhook signature
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("[lemon-webhook] Webhook secret not configured");
      return NextResponse.json({ error: "not configured" }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: "missing signature" }, { status: 401 });
    }

    const isValid = await verifySignature(body, secret, signature);
    if (!isValid) {
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }

    // 2. Parse event
    const event = JSON.parse(body);
    const eventName = event.meta?.event_name;
    const customData = event.meta?.custom_data || {};
    const userId = customData.user_id;

    if (!userId) {
      console.warn("[lemon-webhook] No user_id in custom_data — skipping");
      return NextResponse.json({ skipped: true });
    }

    const db = (process.env as any).DB;
    if (!db) {
      return NextResponse.json(
        { error: "database unavailable" },
        { status: 500 }
      );
    }

    // 3. Handle events
    switch (eventName) {
      case "subscription_created":
      case "subscription_updated": {
        const sub = event.data;
        const planType = mapVariantToPlan(sub.attributes.variant_id);

        // Upsert user plan
        await db
          .prepare(
            `INSERT INTO users (id, email, plan_type)
             VALUES (?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET plan_type = ?`
          )
          .bind(userId, sub.attributes.user_email, planType, planType)
          .run();

        // Upsert subscription
        await db
          .prepare(
            `INSERT INTO subscriptions (id, user_id, lemon_sub_id, status, current_period_end)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET status = ?, current_period_end = ?`
          )
          .bind(
            sub.id,
            userId,
            String(sub.id),
            sub.attributes.status,
            sub.attributes.ends_at || sub.attributes.renews_at || "",
            sub.attributes.status,
            sub.attributes.ends_at || sub.attributes.renews_at || ""
          )
          .run();

        console.log(
          `[lemon-webhook] ${eventName}: user=${userId} plan=${planType}`
        );
        break;
      }

      case "subscription_cancelled":
      case "subscription_expired": {
        await db
          .prepare("UPDATE users SET plan_type = 'free' WHERE id = ?")
          .bind(userId)
          .run();

        console.log(
          `[lemon-webhook] ${eventName}: user=${userId} reverted to free`
        );
        break;
      }

      default:
        console.log(`[lemon-webhook] Unhandled event: ${eventName}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[lemon-webhook] Error:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

function mapVariantToPlan(variantId: string): string {
  const plusVariant = process.env.LEMON_SQUEEZY_PLUS_VARIANT_ID;
  const enterpriseVariant = process.env.LEMON_SQUEEZY_ENTERPRISE_VARIANT_ID;

  if (variantId === enterpriseVariant) return "enterprise";
  if (variantId === plusVariant) return "plus";
  return "free";
}
