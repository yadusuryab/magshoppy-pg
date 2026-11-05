// lib/checkout-server.ts  (server-only)
import "server-only";
import crypto from "crypto";
import Razorpay from "razorpay";
import { serverClient } from "@/lib/sanity-server"; // write-enabled client
import {
  BASE_PRICE,
  COD_CHARGE,
  SHOE_CLEANER_PRICE,
  ONLINE_DELIVERY_MIN_DAYS,
  ONLINE_DELIVERY_MAX_DAYS,
  COD_DELIVERY_MIN_DAYS,
  COD_DELIVERY_MAX_DAYS,
} from "@/lib/checkout-constants";
import { getExpectedDelivery } from "@/lib/checkout-utils";

export const COD_ADVANCE_AMOUNT = 300;

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export class CheckoutError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

/* ---------- signatures ---------- */

const safeEqual = (a: string, b: string) => {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && crypto.timingSafeEqual(A, B);
};

export const verifyPaymentSignature = (
  orderId: string,
  paymentId: string,
  signature: string,
) => {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return safeEqual(expected, signature);
};

export const verifyWebhookSignature = (rawBody: string, signature: string) => {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");
  return safeEqual(expected, signature);
};

/* ---------- input validation ---------- */

const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export const validateCustomer = (raw: any) => {
  const c = {
    name: str(raw?.name, 100),
    contact1: str(raw?.contact1, 10),
    contact2: str(raw?.contact2, 10),
    address: str(raw?.address, 500),
    district: str(raw?.district, 100),
    state: str(raw?.state, 100),
    pincode: str(raw?.pincode, 6),
    landmark: str(raw?.landmark, 200),
    instagramId: str(raw?.instagramId, 100),
  };
  if (c.name.length < 2) throw new CheckoutError("Invalid name");
  if (!/^\d{10}$/.test(c.contact1)) throw new CheckoutError("Invalid phone");
  if (c.contact2 && !/^\d{10}$/.test(c.contact2))
    throw new CheckoutError("Invalid alternate phone");
  if (c.address.length < 5) throw new CheckoutError("Invalid address");
  if (!c.district || !c.state) throw new CheckoutError("Missing district/state");
  if (!/^\d{6}$/.test(c.pincode)) throw new CheckoutError("Invalid pincode");
  return c;
};

/* ---------- pricing (single source of truth) ---------- */

export const buildOrder = async (body: any) => {
  const customer = validateCustomer(body?.customerDetails);

  const shippingMethod = body?.shippingMethod;
  if (shippingMethod !== "online" && shippingMethod !== "cod")
    throw new CheckoutError("Invalid shipping method");

  const items = body?.items;
  if (!Array.isArray(items) || items.length < 1 || items.length > 2)
    throw new CheckoutError("Invalid cart");
  for (const i of items) {
    if (typeof i?.productId !== "string" || !i.productId)
      throw new CheckoutError("Invalid product");
  }

  const ids = [...new Set(items.map((i: any) => i.productId as string))];
  const [products, settings] = await Promise.all([
    serverClient.fetch(
      `*[_type == "product" && _id in $ids]{ _id, price, name, "imageUrl": image.asset->url, buyOneGetOne }`,
      { ids },
    ),
    serverClient.fetch(
      `*[_type == "settings"][0]{ freeSocksOffer, shoeCleanerAddon }`,
    ),
  ]);
  const map = new Map<string, any>(products.map((p: any) => [p._id, p]));

  const main = map.get(items[0].productId);
  if (!main) throw new CheckoutError("Product not found");

  const wantsFree = items.length === 2;
  if (wantsFree && !main.buyOneGetOne)
    throw new CheckoutError("Offer not applicable");
  const free = wantsFree ? map.get(items[1].productId) : null;
  if (wantsFree && !free) throw new CheckoutError("Free product not found");

  const price1 = main.price || BASE_PRICE;
  const price2 = free ? free.price || BASE_PRICE : 0;
  // Same formula as the client: base price + upgrade deltas only
  const subtotal =
    BASE_PRICE +
    Math.max(0, price1 - BASE_PRICE) +
    (free ? Math.max(0, price2 - BASE_PRICE) : 0);

  const isCod = shippingMethod === "cod";
  const shippingCharge = isCod ? COD_CHARGE : 0;
  const shoeCleanerAddon = !!settings?.shoeCleanerAddon && !!body?.addShoeCleaner;
  const cleanerCharge = shoeCleanerAddon ? SHOE_CLEANER_PRICE : 0;
  const totalAmount = subtotal + shippingCharge + cleanerCharge;
  const advancePaid = isCod ? COD_ADVANCE_AMOUNT : totalAmount;
  const remainingAmount = isCod ? totalAmount - COD_ADVANCE_AMOUNT : 0;
  if (advancePaid < 1) throw new CheckoutError("Invalid amount");

  const delivery = isCod
    ? getExpectedDelivery(COD_DELIVERY_MIN_DAYS, COD_DELIVERY_MAX_DAYS, new Date())
    : getExpectedDelivery(ONLINE_DELIVERY_MIN_DAYS, ONLINE_DELIVERY_MAX_DAYS, new Date());

  const line = (p: any, size: unknown, isFreeItem: boolean) => ({
    _key: `${p._id}-${isFreeItem ? "free" : "main"}`,
    _type: "orderItem",
    productId: p._id,
    productName: p.name,
    imageUrl: p.imageUrl,
    size: str(size, 10),
    price: p.price || BASE_PRICE,
    isFreeItem,
  });

  return {
    customer,
    shippingMethod,
    isCod,
    shoeCleanerAddon,
    freeSocksOffer: !!settings?.freeSocksOffer,
    lineItems: [
      line(main, items[0].size, false),
      ...(free ? [line(free, items[1].size, true)] : []),
    ],
    subtotal,
    shippingCharge,
    cleanerCharge,
    totalAmount,
    advancePaid,
    remainingAmount,
    expectedDeliveryLabel: delivery.label,
  };
};

export const newOrderRef = () =>
  `FX-${Date.now().toString(36).toUpperCase()}${crypto
    .randomBytes(2)
    .toString("hex")
    .toUpperCase()}`;

/* ---------- settlement (used by verify AND webhook; idempotent) ---------- */

export type SettleResult =
  | { state: "paid"; orderId: string }
  | { state: "pending"; orderId: string }
  | { state: "failed" };

export const settlePayment = async (
  razorpayOrderId: string,
  razorpayPaymentId: string,
): Promise<SettleResult> => {
  const order = await serverClient.fetch(
    `*[_type == "order" && razorpayOrderId == $id][0]{ _id, orderId, paymentStatus, advancePaid }`,
    { id: razorpayOrderId },
  );
  if (!order) throw new CheckoutError("Order not found", 404);
  if (order.paymentStatus === "paid")
    return { state: "paid", orderId: order.orderId };

  // Ask Razorpay directly - never trust client/webhook payload amounts
  const payment: any = await razorpay.payments.fetch(razorpayPaymentId);
  if (
    payment.order_id !== razorpayOrderId ||
    payment.currency !== "INR" ||
    payment.amount !== order.advancePaid * 100
  ) {
    throw new CheckoutError("Payment mismatch", 400);
  }

  if (payment.status === "captured") {
    await serverClient
      .patch(order._id)
      .set({
        paymentStatus: "paid",
        razorpayPaymentId,
        paidAt: new Date().toISOString(),
      })
      .commit();
    return { state: "paid", orderId: order.orderId };
  }
  if (payment.status === "authorized")
    return { state: "pending", orderId: order.orderId }; // webhook finalizes on capture
  return { state: "failed" };
};

export const markPaymentFailed = async (razorpayOrderId: string) => {
  const order = await serverClient.fetch(
    `*[_type == "order" && razorpayOrderId == $id][0]{ _id, paymentStatus }`,
    { id: razorpayOrderId },
  );
  if (!order || order.paymentStatus === "paid") return;
  await serverClient.patch(order._id).set({ paymentStatus: "failed" }).commit();
};