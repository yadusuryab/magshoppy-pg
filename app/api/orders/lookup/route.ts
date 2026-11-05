import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanityClient";

export async function GET(request: NextRequest) {
  const paymentId = request.nextUrl.searchParams.get("payment_id");

  if (!paymentId) {
    return NextResponse.json({ error: "Missing payment_id" }, { status: 400 });
  }

  try {
    const order = await client.fetch(
      `*[_type == "order" && razorpayPaymentId == $paymentId][0]{
        orderId,
        items[]{ productName, size, price, isFreeItem, imageUrl },
        customerName,
        contact1,
        address,
        district,
        state,
        pincode,
        landmark,
        shippingMethod,
        shoeCleanerAddon,
        freeSocksOffer,
        subtotal,
        shippingCharge,
        totalAmount,
        expectedDeliveryLabel,
        razorpayPaymentId,
        paymentStatus,
        fulfillmentStatus,
        createdAt
      }`,
      { paymentId },
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (err) {
    console.error("Order lookup error:", err);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}