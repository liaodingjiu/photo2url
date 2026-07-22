import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";

export const runtime = "edge";

/**
 * POST /api/webhook/clerk
 * Handle Clerk user.created events to sync D1 and claim pending subscriptions.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    // 1. Verify webhook signature
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json({ error: "missing headers" }, { status: 400 });
    }
    if (!secret) {
      console.error("[clerk-webhook] Webhook secret not configured");
      return NextResponse.json({ error: "not configured" }, { status: 500 });
    }

    try {
      const wh = new Webhook(secret);
      wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch {
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }

    // 2. Handle events
    const event = JSON.parse(body);
    const eventType = event.type;

    if (eventType !== "user.created") {
      return NextResponse.json({ received: true });
    }

    const userId = event.data.id;
    const emailObj = event.data.email_addresses?.[0];
    const email = emailObj?.email_address;
    if (!userId || !email) {
      return NextResponse.json({ error: "missing user data" }, { status: 400 });
    }

    const db = (process.env as any).DB;
    if (!db) {
      return NextResponse.json({ error: "database unavailable" }, { status: 500 });
    }

    // 3. Upsert user with real email
    await db
      .prepare(
        `INSERT INTO users (id, email, plan_type)
         VALUES (?, ?, 'free')
         ON CONFLICT(id) DO UPDATE SET email = ?`
      )
      .bind(userId, email, email)
      .run();

    // 4. Check for pending subscription (guest checkout matched by email)
    const pending = await db
      .prepare(
        `SELECT * FROM pending_subscriptions
         WHERE email = ? AND status = 'pending'
         ORDER BY created_at DESC LIMIT 1`
      )
      .bind(email)
      .first();

    if (pending) {
      const planType = (pending as any).plan_type;
      const lemonSubId = (pending as any).lemon_sub_id;

      await db
        .prepare("UPDATE users SET plan_type = ? WHERE id = ?")
        .bind(planType, userId)
        .run();

      await db
        .prepare(
          `UPDATE pending_subscriptions SET status = 'claimed' WHERE id = ?`
        )
        .bind((pending as any).id)
        .run();

      console.log(
        `[clerk-webhook] user.created: ${email} → claimed plan=${planType} sub=${lemonSubId}`
      );
    } else {
      console.log(`[clerk-webhook] user.created: ${email} → free`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[clerk-webhook] Error:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
