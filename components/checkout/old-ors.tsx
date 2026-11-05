import { Card, CardContent } from "@/components/ui/card";
import { Truck, Flame, SprayCan } from "lucide-react";
import Link from "next/link";
import { formatDeliveryDate } from "@/lib/checkout-utils";
import {
  BASE_PRICE,
  COD_CHARGE,
  SHOE_CLEANER_PRICE,
  ONLINE_DELIVERY_MIN_DAYS,
  ONLINE_DELIVERY_MAX_DAYS,
  COD_DELIVERY_MIN_DAYS,
  COD_DELIVERY_MAX_DAYS,
} from "@/lib/checkout-constants";

export function OrderSummary({
  pair1Extra,
  pair2Extra,
  freeSocksOffer,
  shoeCleanerAddon,
  addShoeCleaner,
  shippingMethod,
  activeDeliveryEnd,
  totalAmount,
}: {
  pair1Extra: number;
  pair2Extra: number;
  freeSocksOffer: boolean;
  shoeCleanerAddon: boolean;
  addShoeCleaner: boolean;
  shippingMethod: "online" | "cod";
  activeDeliveryEnd: Date;
  totalAmount: number;
}) {
  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Base Price (2 Pairs)</span>
            <span>₹{BASE_PRICE}</span>
          </div>
          {pair1Extra > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground ml-4">
              <span>Extra – Pair 1</span>
              <span>+₹{pair1Extra}</span>
            </div>
          )}
          {pair2Extra > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground ml-4">
              <span>Extra – Pair 2</span>
              <span>+₹{pair2Extra}</span>
            </div>
          )}
          {freeSocksOffer && (
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-orange-500" /> Flame Socks
              </span>
              <span className="text-green-600 font-semibold">FREE</span>
            </div>
          )}
          {shoeCleanerAddon && addShoeCleaner && (
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                <SprayCan className="h-3.5 w-3.5 text-blue-500" /> Shoe Cleaner{" "}
              </span>
              <span>+₹{SHOE_CLEANER_PRICE}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            {shippingMethod === "online" ? (
              <span className="text-green-600 font-semibold">
                🎁 FREE SHIPPING
              </span>
            ) : (
              <span>₹{COD_CHARGE}</span>
            )}
          </div>
          <div className="rounded-2xl bg-muted/60 px-6 py-6 flex flex-col items-center text-center gap-2">
            <Truck className="h-8 w-8 text-foreground/80" strokeWidth={1.5} />
            <p className="text-xs font-medium text-foreground">
              Expected Delivery by {formatDeliveryDate(activeDeliveryEnd)}
            </p>
            <p className="text-xs text-muted-foreground">
              Delivery Time :{" "}
              {shippingMethod === "online"
                ? `${ONLINE_DELIVERY_MIN_DAYS} - ${ONLINE_DELIVERY_MAX_DAYS}`
                : `${COD_DELIVERY_MIN_DAYS} - ${COD_DELIVERY_MAX_DAYS}`}{" "}
              Working Days
            </p>
          </div>

          <div className="border-t pt-3 flex justify-between font-bold text-base">
            <span>Total Amount</span>
            <span>₹{totalAmount}</span>
          </div>
          {shippingMethod === "cod" && (
            <p className="text-xs text-orange-600 text-center">
              💡 Switch to Online Payment to save ₹{COD_CHARGE}!
            </p>
          )}
          <div className="border-t pt-3 text-xs text-muted-foreground">
            By placing this order, you agree to the{" "}
            <Link href="/T&C" className="text-primary hover:underline">
              Terms and Conditions
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}