// app/api/checkout/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { serverClient } from "@/lib/sanity-server";

export const runtime = "nodejs";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string"
    ) {
      return NextResponse.json({ success: false, error: "Bad request" }, { status: 400 });
    }

    // 1. Verify signature
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }

    // 2. Find the Sanity order
    const sanityOrder = await serverClient.fetch(
      `*[_type == "order" && razorpayOrderId == $rid][0]{ _id, paymentStatus }`,
      { rid: razorpay_order_id }
    );
    if (!sanityOrder) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // 3. Idempotency — already marked paid by webhook
    if (sanityOrder.paymentStatus === "paid") {
      return NextResponse.json({ success: true, orderId: sanityOrder._id });
    }

    // 4. Confirm with Razorpay (don't trust the client that it "succeeded")
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (payment.order_id !== razorpay_order_id) {
      return NextResponse.json({ success: false, error: "Order mismatch" }, { status: 400 });
    }
    const isCaptured = payment.status === "captured";
    const isAuthorized = payment.status === "authorized";
    if (!isCaptured && !isAuthorized) {
      return NextResponse.json({ success: false, error: `Payment ${payment.status}` }, { status: 402 });
    }

    // 5. Update Sanity order
    await serverClient
      .patch(sanityOrder._id)
      .set({
        paymentStatus: isCaptured ? "paid" : "pending",
        razorpayPaymentId: razorpay_payment_id,
        paidAt: isCaptured ? new Date().toISOString() : undefined,
      })
      .commit();

    return NextResponse.json({ success: true, orderId: sanityOrder._id });
  } catch (e: any) {
    console.error("[checkout/verify]", e);
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
  }
}