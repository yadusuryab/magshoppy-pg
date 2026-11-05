// app/api/razorpay/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { serverClient } from "@/lib/sanity-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(raw)
    .digest("hex");

    console.log("sig:", signature.slice(0, 8), "exp:", expected.slice(0, 8), "secretLen:", process.env.RAZORPAY_WEBHOOK_SECRET?.length);


  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(raw);
  const payment = event?.payload?.payment?.entity;
  if (!payment?.order_id) return NextResponse.json({ ok: true });

  const razorpayOrderId = payment.order_id;
  const razorpayPaymentId = payment.id;
  const sanityOrderId = payment.notes?.sanityOrderId;

  const order = sanityOrderId
    ? await serverClient.fetch(
        `*[_type == "order" && _id == $id][0]{ _id, paymentStatus }`,
        { id: sanityOrderId }
      )
    : await serverClient.fetch(
        `*[_type == "order" && razorpayOrderId == $rid][0]{ _id, paymentStatus }`,
        { rid: razorpayOrderId }
      );

  if (!order) {
    console.warn("[webhook] No Sanity order for", razorpayOrderId);
    return NextResponse.json({ ok: true });
  }

  if (event.event === "payment.captured" && order.paymentStatus !== "paid") {
    await serverClient
      .patch(order._id)
      .set({
        paymentStatus: "paid",
        razorpayPaymentId,
        paidAt: new Date().toISOString(),
        paidVia: "webhook",
      })
      .commit();
  }

  if (event.event === "payment.failed") {
    await serverClient
      .patch(order._id)
      .set({
        paymentStatus: "failed",
        razorpayPaymentId,
        failedAt: new Date().toISOString(),
      })
      .commit();
  }

  return NextResponse.json({ ok: true });
}