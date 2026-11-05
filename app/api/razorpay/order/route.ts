// app/api/razorpay/order/route.ts
// Client sends { amount }, expects { order: { id, amount, currency } }
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const MAX_AMOUNT = 20000; // set above your highest possible order total

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();

    if (!Number.isInteger(amount) || amount < 1 || amount > MAX_AMOUNT) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    return NextResponse.json({ order });
  } catch (e) {
    console.error("[razorpay/order]", e);
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }
}