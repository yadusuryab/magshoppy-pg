// lib/checkout-pricing.ts
import {
  BASE_PRICE,
  COD_CHARGE,
  SHOE_CLEANER_PRICE,
} from "@/lib/checkout-constants";

export const COD_ADVANCE_AMOUNT = 300;

export type CartLineInput = {
  productId: string;
  selectedSize: string;
  isFreeItem?: boolean;
};

export type PricedCart = {
  subtotal: number;
  shippingCharge: number;
  cleanerCharge: number;
  totalAmount: number;
  isCod: boolean;
  paymentAmount: number;
  remainingAmount: number;
  items: Array<{
    productId: string;
    productName: string;
    imageUrl: string;
    size: string;
    price: number;
    isFreeItem: boolean;
  }>;
};

export async function priceCart(
  sanity: any,
  lines: CartLineInput[],
  opts: { shippingMethod: "online" | "cod"; addShoeCleaner: boolean }
): Promise<PricedCart> {
  if (!lines.length) throw new Error("Cart is empty");
  if (lines.length > 2) throw new Error("Max 2 items per order");

  const ids = lines.map((l) => l.productId);

  const products = await sanity.fetch(
    `*[_type == "shoe" && _id in $ids]{
      _id,
      productName,
      price,
      "rawImage": coalesce(images[0].asset->url, "")
    }`,
    { ids }
  );

  console.log("[priceCart] products:", JSON.stringify(products));

  const byId = new Map(products.map((p: any) => [p._id, p]));

  const missing: string[] = [];
  const built = lines.map((l) => {
    const p: any = byId.get(l.productId);
    if (!p) {
      missing.push(l.productId);
      return null;
    }
    return {
      productId: p._id,
      productName: p.productName ?? "Unknown product",
      imageUrl: p.rawImage
        ? `${p.rawImage}?w=400&h=400&auto=format&q=85&fit=crop`
        : "",
      size: l.selectedSize,
      price: typeof p.price === "number" ? p.price : BASE_PRICE,
      isFreeItem: !!l.isFreeItem,
    };
  });

  if (missing.length) {
    const err: any = new Error(
      `Some products are no longer available: ${missing.join(", ")}`
    );
    err.code = "PRODUCT_NOT_FOUND";
    err.missingProductIds = missing;
    throw err;
  }

  const items = built as NonNullable<(typeof built)[number]>[];

  const pair1Extra = Math.max(0, items[0].price - BASE_PRICE);
  const pair2Extra = items[1] ? Math.max(0, items[1].price - BASE_PRICE) : 0;
  const subtotal = BASE_PRICE + pair1Extra + pair2Extra;

  const isCod = opts.shippingMethod === "cod";
  const shippingCharge = isCod ? COD_CHARGE : 0;
  const cleanerCharge = opts.addShoeCleaner ? SHOE_CLEANER_PRICE : 0;
  const totalAmount = subtotal + shippingCharge + cleanerCharge;
  const paymentAmount = isCod ? COD_ADVANCE_AMOUNT : totalAmount;
  const remainingAmount = isCod ? totalAmount - COD_ADVANCE_AMOUNT : 0;

  return {
    subtotal,
    shippingCharge,
    cleanerCharge,
    totalAmount,
    isCod,
    paymentAmount,
    remainingAmount,
    items,
  };
}

export function generateOrderId() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `FTX-${ymd}-${rand}`;
}