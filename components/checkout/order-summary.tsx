import Link from "next/link";
import { formatDeliveryDate } from "@/lib/checkout-utils";
import {
  BASE_PRICE,
  ONE_PAIR_PRICE,
  COD_CHARGE,
  SHOE_CLEANER_PRICE,
  ONLINE_DELIVERY_MIN_DAYS,
  ONLINE_DELIVERY_MAX_DAYS,
  COD_DELIVERY_MIN_DAYS,
  COD_DELIVERY_MAX_DAYS,
} from "@/lib/checkout-constants";

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-baseline justify-between text-sm">
    <span className="text-neutral-500">{label}</span>
    <span className="font-semibold tabular-nums">{children}</span>
  </div>
);

const Extra = ({ label, amount }: { label: string; amount: number }) => (
  <div className="flex justify-between pl-3 text-xs text-neutral-500">
    <span>{label}</span>
    <span className="tabular-nums">+₹{amount}</span>
  </div>
);

export function OrderSummary({
  pair1Extra,
  pair2Extra,
  freeSocksOffer,
  shoeCleanerAddon,
  addShoeCleaner,
  shippingMethod,
  activeDeliveryEnd,
  totalAmount,
  isOnePair = false,
}: {
  pair1Extra: number;
  pair2Extra: number;
  freeSocksOffer: boolean;
  shoeCleanerAddon: boolean;
  addShoeCleaner: boolean;
  shippingMethod: "online" | "cod";
  activeDeliveryEnd: Date;
  totalAmount: number;
  /** Pass true for the 1 pair offer so the base price/label match the offer. */
  isOnePair?: boolean;
}) {
  const online = shippingMethod === "online";
  const [min, max] = online
    ? [ONLINE_DELIVERY_MIN_DAYS, ONLINE_DELIVERY_MAX_DAYS]
    : [COD_DELIVERY_MIN_DAYS, COD_DELIVERY_MAX_DAYS];

  return (
    <section className="mt-8 space-y-3 border-t-2 border-black pt-5">
      <Row label={`Base price (${isOnePair ? "1 pair" : "2 pairs"})`}>
        ₹{isOnePair ? ONE_PAIR_PRICE : BASE_PRICE}
      </Row>
      {pair1Extra > 0 && <Extra label="Extra — Pair 1" amount={pair1Extra} />}
      {pair2Extra > 0 && <Extra label="Extra — Pair 2" amount={pair2Extra} />}
      {freeSocksOffer && <Row label="Flame socks">Free</Row>}
      {shoeCleanerAddon && addShoeCleaner && (
        <Row label="Shoe cleaner">+₹{SHOE_CLEANER_PRICE}</Row>
      )}
      <Row label="Shipping">{online ? "Free" : `₹${COD_CHARGE}`}</Row>

      <div className="border-y border-neutral-200 py-3">
        <p className="font-bold tracking-tight">Arrives by {formatDeliveryDate(activeDeliveryEnd)}</p>
        <p className="text-xs text-neutral-500">
          {min}–{max} working days
        </p>
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-xl font-extrabold tracking-tighter">Total</span>
        <span className="text-4xl font-extrabold tabular-nums tracking-tighter">₹{totalAmount}</span>
      </div>

      {!online && (
        <p className="text-xs font-semibold">Switch to prepaid to save ₹{COD_CHARGE}</p>
      )}

      <p className="text-xs text-neutral-500">
        By placing this order, you agree to the{" "}
        <Link href="/T&C" className="font-semibold text-neutral-950 underline underline-offset-4">
          Terms and Conditions
        </Link>
      </p>
    </section>
  );
}