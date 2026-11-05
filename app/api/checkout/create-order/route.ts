import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { serverClient } from "@/lib/sanity-server";
import { priceCart, generateOrderId } from "@/lib/checkout-pricing";
import { validateCustomer } from "@/lib/checkout-validation";

export const runtime = "nodejs";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      lines,
      customerDetails,
      shippingMethod,
      addShoeCleaner,
      freeSocksOffer,
    } = body ?? {};

    // Anything other than "one-pair" is treated as two pair (original behavior)
    const offerType = body?.offerType === "one-pair" ? "one-pair" : "two-pair";
    const isOnePair = offerType === "one-pair";

    // ---- 1. Validate inputs ----
    if (!Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // One pair offer: exactly one paid line, never a free item
    if (isOnePair && (lines.length !== 1 || lines[0]?.isFreeItem)) {
      return NextResponse.json(
        { error: "Invalid one pair order" },
        { status: 400 },
      );
    }

    if (shippingMethod !== "online" && shippingMethod !== "cod") {
      return NextResponse.json(
        { error: "Invalid shipping method" },
        { status: 400 },
      );
    }
    const custErrors = validateCustomer(customerDetails ?? {});
    if (custErrors.length) {
      return NextResponse.json(
        { error: "Invalid customer details", details: custErrors },
        { status: 400 },
      );
    }

    // ---- 2. Re-price server-side ----
    const priced = await priceCart(serverClient, lines, {
      shippingMethod,
      addShoeCleaner: !!addShoeCleaner,
      offerType,
    } as Parameters<typeof priceCart>[2] & { offerType: typeof offerType });

    // ---- 3. Create Sanity order (payment pending) ----
    const orderId = generateOrderId();
    const sanityDoc = {
      _type: "order",
      orderId,
      offerType, // 👈 saved so you can see which offer the order used
      items: priced.items.map((it) => ({
        _key: it.productId + it.size,
        _type: "orderItem",
        productId: it.productId,
        productName: it.productName,
        imageUrl: it.imageUrl,
        size: it.size,
        price: it.price,
        isFreeItem: it.isFreeItem,
      })),
      customerName: customerDetails.name,
      instagramId: customerDetails.instagramId || "",
      contact1: customerDetails.contact1,
      contact2: customerDetails.contact2 || "",
      address: customerDetails.address,
      district: customerDetails.district,
      state: customerDetails.state,
      pincode: customerDetails.pincode,
      landmark: customerDetails.landmark || "",
      shippingMethod,
      shoeCleanerAddon: !!addShoeCleaner,
      freeSocksOffer: !!freeSocksOffer,
      subtotal: priced.subtotal,
      shippingCharge: priced.shippingCharge,
      totalAmount: priced.totalAmount,
      expectedDeliveryLabel: body.expectedDeliveryLabel || "",
      paymentStatus: "pending",
      fulfillmentStatus: "pending",
      createdAt: new Date().toISOString(),
    };
    const created = await serverClient.create(sanityDoc);

    // ---- 4. Create Razorpay order ----
    const rzpOrder = await razorpay.orders.create({
      amount: priced.paymentAmount * 100,
      currency: "INR",
      receipt: orderId,
      notes: {
        sanityOrderId: created._id,
        sanityOrderId_human: orderId,
        offerType,
        isCod: String(priced.isCod),
        remainingAmount: String(priced.remainingAmount),
      },
    });

    // ---- 5. Save Razorpay order id on Sanity order ----
    await serverClient
      .patch(created._id)
      .set({ razorpayOrderId: rzpOrder.id })
      .commit();

    return NextResponse.json({
      orderId: created._id,
      humanOrderId: orderId,
      razorpayOrder: {
        id: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
      },
      // returned for display only — never trust these on later requests
      paymentAmount: priced.paymentAmount,
      totalAmount: priced.totalAmount,
      remainingAmount: priced.remainingAmount,
    });
  } catch (e: any) {
    console.error("[checkout/create-order]", e);
    return NextResponse.json(
      { error: e.message || "Could not create order" },
      { status: 500 },
    );
  }
}
