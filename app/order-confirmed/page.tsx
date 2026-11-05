"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, PackageX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fbEvent } from "@/lib/fbq";

type OrderItem = {
  productName: string;
  size: number;
  price: number;
  isFreeItem: boolean;
};

type Order = {
  orderId: string;
  items: OrderItem[];
  customerName: string;
  contact1: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  landmark?: string;
  shippingMethod: "online" | "cod";
  shoeCleanerAddon: boolean;
  freeSocksOffer: boolean;
  subtotal: number;
  shippingCharge: number;
  totalAmount: number;
  expectedDeliveryLabel: string;
  razorpayPaymentId: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
};

// Fires Purchase exactly once for a given payment. This only ever runs from
// inside the `/api/orders/lookup` success branch below, i.e. only when a
// real order was found in Sanity for this payment_id — so visiting this
// page with a made-up or reused payment_id in the URL can't trigger it.
// The localStorage flag stops a refresh or a revisit of the same
// confirmation link from firing it a second time.
function firePurchaseOnce(order: Order, paymentId: string) {
  if (typeof window === "undefined") return;

  const firedKey = `purchase_fired_${paymentId}`;
  if (localStorage.getItem(firedKey)) return;

  fbEvent(
    "Purchase",
    {
      content_type: "product",
      contents: order.items.map((item) => ({ id: item.productName, quantity: 1 })),
      num_items: order.items.length,
      currency: "INR",
      value: order.totalAmount,
      content_name: order.shippingMethod === "cod" ? "COD Order" : "Prepaid Order",
    },
    paymentId, // eventID — dedupes if you ever add server-side CAPI later
  );

  localStorage.setItem(firedKey, "1");
}

function OrderConfirmedContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");

  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<"loading" | "found" | "not_found" | "error">("loading");

  useEffect(() => {
    if (!paymentId) {
      setStatus("not_found");
      return;
    }

    fetch(`/api/orders/lookup?payment_id=${encodeURIComponent(paymentId)}`)
      .then(async (res) => {
        if (!res.ok) {
          setStatus(res.status === 404 ? "not_found" : "error");
          return;
        }
        const data = await res.json();
        setOrder(data.order);
        setStatus("found");
        firePurchaseOnce(data.order, paymentId);
      })
      .catch(() => setStatus("error"));
  }, [paymentId]);

  if (status === "loading") {
    return (
      <main className="container mx-auto px-4 max-w-2xl min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading your order...</p>
        </div>
      </main>
    );
  }

  if (status !== "found" || !order) {
    return (
      <main className="container mx-auto px-4 max-w-2xl min-h-screen flex items-center justify-center">
        <Card className="w-full text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <PackageX className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>We couldn't find that order</CardTitle>
            <CardDescription>
              {paymentId
                ? "If your payment went through, please contact support with your payment ID."
                : "No payment reference was provided."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentId && (
              <p className="text-xs text-muted-foreground mb-4">Payment ID: {paymentId}</p>
            )}
            <Button asChild className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 max-w-2xl min-h-screen py-10">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold">Order Confirmed!</h1>
        <p className="text-muted-foreground mt-1">
          Thanks {order.customerName}, we've received your payment.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Summary</CardTitle>
          <CardDescription>Order ID: {order.orderId}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>
                  {item.productName} (Size {item.size}){" "}
                  {item.isFreeItem && <span className="text-green-600 font-medium">FREE</span>}
                </span>
                <span>₹{item.isFreeItem ? 0 : item.price}</span>
              </div>
            ))}
            {order.freeSocksOffer && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Free Flame Socks</span>
                <span>₹0</span>
              </div>
            )}
            {order.shoeCleanerAddon && (
              <div className="flex justify-between text-sm">
                <span>Shoe Cleaner Add-on</span>
                <span>Included</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {order.shippingMethod === "online" ? "FREE" : `₹${order.shippingCharge}`}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-1">
              <span>Total Paid</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>

          <Separator />

          <div className="text-sm space-y-1">
            <p className="font-medium">Delivery Address</p>
            <p className="text-muted-foreground">
              {order.address}, {order.landmark ? `${order.landmark}, ` : ""}
              {order.district}, {order.state} - {order.pincode}
            </p>
            <p className="text-muted-foreground">Contact: {order.contact1}</p>
          </div>

          <div className="text-sm">
            <p className="font-medium">Expected Delivery</p>
            <p className="text-muted-foreground">{order.expectedDeliveryLabel}</p>
          </div>

          <div className="text-xs text-muted-foreground pt-2">
            Payment ID: {order.razorpayPaymentId}
          </div>
        </CardContent>
      </Card>

      <Button asChild className="w-full mt-6" size="lg">
        <Link href="/">Continue Shopping</Link>
      </Button>
    </main>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense
      fallback={
        <main className="container mx-auto px-4 max-w-2xl min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      }
    >
      <OrderConfirmedContent />
    </Suspense>
  );
}