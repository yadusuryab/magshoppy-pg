// app/api/razorpay/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  CheckoutError,
  settlePayment,
  verifyPaymentSignature,
} from "@/lib/checkout-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();

    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string"
    ) {
      return NextResponse.json({ success: false, error: "Bad request" }, { status: 400 });
    }

    if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }

    const result = await settlePayment(razorpay_order_id, razorpay_payment_id);
    if (result.state === "failed") {
      return NextResponse.json({ success: false, error: "Payment not completed" }, { status: 402 });
    }
    // "pending" = authorized, webhook will mark paid on capture
    return NextResponse.json({
      success: true,
      pending: result.state === "pending",
      orderId: result.orderId,
    });
  } catch (err: any) {
    if (err instanceof CheckoutError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[razorpay/verify]", err);
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
  }
}