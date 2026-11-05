import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanityClient";

export async function GET(request: NextRequest) {
  const contact1 = request.nextUrl.searchParams.get("contact1")?.trim();
  const pincode = request.nextUrl.searchParams.get("pincode")?.trim();

  if (!contact1) {
    return NextResponse.json({ error: "Missing contact1" }, { status: 400 });
  }

  // Normalize phone: strip spaces, dashes, leading +91/0 so "9876543210"
  // matches "+91 98765 43210" etc. Adjust to match how numbers are stored.
  const normalize = (v: string) =>
    v.replace(/[\s-]/g, "").replace(/^(\+91|0)/, "");
  const normalizedContact = normalize(contact1);

  try {
    const orders = await client.fetch(
      `*[_type == "order" && (contact1 == $contact1 || contact1 match $contactPattern)] | order(createdAt desc) {
        orderId,
        items[]{
          productName,
          size,
          price,
          isFreeItem,
          "imageUrl": imageUrl.asset->url,
          "productId": coalesce(product._ref, productId)
        },
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
        paymentStatus,
        fulfillmentStatus,
        createdAt
      }`,
      { contact1: normalizedContact, contactPattern: `*${normalizedContact}` },
    );

    if (!orders?.length) {
      return NextResponse.json(
        { error: "No orders found for this number" },
        { status: 404 },
      );
    }

    // Optional second factor: if pincode is supplied, filter down to orders
    // matching it, so a bare phone number can't pull up a full address.
    const filtered = pincode
      ? orders.filter((o: any) => o.pincode?.toString().trim() === pincode)
      : orders;

    if (pincode && !filtered.length) {
      return NextResponse.json(
        { error: "No orders match that phone number and pincode" },
        { status: 404 },
      );
    }

    return NextResponse.json({ orders: filtered });
  } catch (err) {
    console.error("Order tracking error:", err);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
