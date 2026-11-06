"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CustomerDetailsForm } from "@/components/checkout/checkout-form";
import { site } from "@/lib/site-config";
import { fbEvent, fbTrackCustom } from "@/lib/fbq";
import { OrderSummary as OrderSummaryBase } from "@/components/checkout/order-summary";
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
import { StepProgress } from "@/components/checkout/step-progress";
import { CartItem, CheckoutStep, CustomerDetails } from "@/lib/types/checkout";
import { getExpectedDelivery } from "@/lib/checkout-utils";
import { EmptyCart } from "@/components/checkout/empty-cart";
import { PaymentStep as PaymentStepBase } from "@/components/checkout/payment-step";

// Memoised so typing in the form doesn't re-render these
const OrderSummary = memo(OrderSummaryBase);
const PaymentStep = memo(PaymentStepBase);

const COD_ADVANCE_AMOUNT = 300;
const SITE_ORIGIN = "https://magshoppy.in";
const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";

const REQUIRED_FIELDS = [
  "name",
  "contact1",
  "address",
  "district",
  "state",
  "pincode",
] as const;

const cta =
  "flex w-full items-center justify-between rounded-md bg-black px-5 py-4 text-base font-bold tracking-tight text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400";

declare global {
  interface Window {
    Razorpay: any;
  }
}

// One shared load: repeat calls reuse the same request; a failed load can be retried.
let razorpayLoad: Promise<boolean> | null = null;
const loadRazorpay = (): Promise<boolean> => {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (razorpayLoad) return razorpayLoad;

  razorpayLoad = new Promise((resolve) => {
    document.querySelector(`script[src="${RAZORPAY_SRC}"]`)?.remove();
    const s = document.createElement("script");
    s.src = RAZORPAY_SRC;
    s.async = true;
    const done = (ok: boolean) => {
      clearTimeout(timer);
      if (!ok) razorpayLoad = null;
      resolve(ok);
    };
    const timer = setTimeout(() => done(false), 8000);
    s.onload = () => done(!!window.Razorpay);
    s.onerror = () => done(false);
    document.body.appendChild(s);
  });
  return razorpayLoad;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingMethod, setShippingMethod] = useState<"online" | "cod">(
    "online",
  );
  const [addShoeCleaner, setAddShoeCleaner] = useState(false);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("payment");
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: "",
    contact1: "",
    contact2: "",
    address: "",
    district: "",
    state: "",
    pincode: "",
    landmark: "",
    instagramId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [orderDate] = useState<Date>(() => new Date());
  const [showPayAlert, setShowPayAlert] = useState(false);
  const [settings, setSettings] = useState({
    freeSocksOffer: false,
    shoeCleanerAddon: false,
    loaded: false,
  });
  const { freeSocksOffer, shoeCleanerAddon } = settings;

  useEffect(() => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartItems(Array.isArray(cart) ? cart : []);
    } catch {
      setCartItems([]);
    }
  }, []);

  // Sanity client is imported on demand so it stays out of the initial bundle
  useEffect(() => {
    let off = false;
    import("@/sanityClient")
      .then(({ client }) =>
        client.fetch(
          `*[_type == "settings"][0]{ freeSocksOffer, shoeCleanerAddon }`,
        ),
      )
      .then((d) => {
        if (!off)
          setSettings({
            freeSocksOffer: !!d?.freeSocksOffer,
            shoeCleanerAddon: !!d?.shoeCleanerAddon,
            loaded: true,
          });
      })
      .catch(() => !off && setSettings((s) => ({ ...s, loaded: true })));
    return () => {
      off = true;
    };
  }, []);

  useEffect(() => {
    if (settings.loaded && !shoeCleanerAddon && addShoeCleaner)
      setAddShoeCleaner(false);
  }, [settings.loaded, shoeCleanerAddon, addShoeCleaner]);

  // Scroll to top on step change; load Razorpay only once the user reaches the pay step
  useEffect(() => {
    window.scrollTo(0, 0);
    if (currentStep === "details") loadRazorpay();
  }, [currentStep]);

  // Warn before closing/refreshing the tab while a payment is in progress
  useEffect(() => {
    if (!isLoading) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isLoading]);

  const mainProduct = cartItems[0];

  // Offer type set by useAddToCart. Missing/unknown = two pair (original behavior).
  const offerType: "one-pair" | "two-pair" =
    mainProduct?.offerType === "one-pair" ? "one-pair" : "two-pair";
  const isOnePair = offerType === "one-pair";
  const freeProduct = isOnePair ? undefined : mainProduct?.freeProduct;
  const offerBasePrice = isOnePair ? ONE_PAIR_PRICE : BASE_PRICE;

  const pair1Extra = Math.max(
    0,
    (mainProduct?.price || offerBasePrice) - offerBasePrice,
  );
  const pair2Extra = isOnePair
    ? 0
    : Math.max(0, (freeProduct?.price || BASE_PRICE) - BASE_PRICE);
  const subtotal = offerBasePrice + pair1Extra + pair2Extra;
  const shippingCharge = shippingMethod === "online" ? 0 : COD_CHARGE;
  const cleanerCharge =
    shoeCleanerAddon && addShoeCleaner ? SHOE_CLEANER_PRICE : 0;
  const totalAmount = subtotal + shippingCharge + cleanerCharge;

  const isCod = shippingMethod === "cod";
  const paymentAmount = isCod ? COD_ADVANCE_AMOUNT : totalAmount;
  const remainingAmount = isCod ? totalAmount - COD_ADVANCE_AMOUNT : 0;

  const onlineDelivery = getExpectedDelivery(
    ONLINE_DELIVERY_MIN_DAYS,
    ONLINE_DELIVERY_MAX_DAYS,
    orderDate,
  );
  const codDelivery = getExpectedDelivery(
    COD_DELIVERY_MIN_DAYS,
    COD_DELIVERY_MAX_DAYS,
    orderDate,
  );
  const activeDelivery = isCod ? codDelivery : onlineDelivery;

  const phoneValid = /^\d{10}$/.test(customerDetails.contact1.trim());
  const pincodeValid = /^\d{6}$/.test(customerDetails.pincode.trim());
  const isFormValid =
    REQUIRED_FIELDS.every((f) => customerDetails[f]?.trim()) &&
    phoneValid &&
    pincodeValid;

  const getFieldError = (field: string): string | undefined => {
    if (!touched[field]) return undefined;
    const value = customerDetails[field as keyof CustomerDetails]?.trim();
    if ((REQUIRED_FIELDS as readonly string[]).includes(field) && !value)
      return "This field is required";
    if (field === "contact1" && value && !phoneValid)
      return "Enter a valid 10-digit phone number";
    if (field === "pincode" && value && !pincodeValid)
      return "Enter a valid 6-digit pincode";
    return undefined;
  };

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setCustomerDetails((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const handleInputBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
    },
    [],
  );

  const goToDetailsStep = useCallback(() => setCurrentStep("details"), []);

  // Free pair is only included in the two pair offer
  const hasFreePair =
    !isOnePair && !!mainProduct?.buyOneGetOne && !!freeProduct;

  // Meta Pixel content params; used only for the Purchase event on confirmed payment
  const buildPixelPayload = () => {
    const ids = [mainProduct?._id].filter(Boolean) as string[];
    if (hasFreePair && freeProduct?._id) ids.push(freeProduct._id);
    return {
      content_ids: ids,
      content_type: "product" as const,
      contents: ids.map((id) => ({ id, quantity: 1 })),
      num_items: ids.length,
      currency: "INR",
    };
  };

  const buildWhatsAppMessage = (reason: string) => {
    const pairLines = [
      `*PAIR 1 :* ${SITE_ORIGIN}/p/${mainProduct?._id}\nSize: ${mainProduct?.selectedSize || "N/A"}`,
    ];
    if (hasFreePair && freeProduct) {
      pairLines.push(
        `*PAIR 2 :* ${SITE_ORIGIN}/p/${freeProduct._id}\nSize: ${freeProduct.selectedSize || "N/A"}`,
      );
    }

    const title = isOnePair ? "1 PAIR OFFER" : "2 PAIR COMBO";

    return `*ORDER CONFIRMATION – ${title}*
⚠️ ${reason}. Please confirm this order manually.

*CUSTOMER INFORMATION*
Name: ${customerDetails.name}
Instagram ID: ${customerDetails.instagramId || "N/A"}
Address: ${customerDetails.address}
District: ${customerDetails.district}
State: ${customerDetails.state}
Pincode: ${customerDetails.pincode}
Landmark: ${customerDetails.landmark || "N/A"}
Phone 1: ${customerDetails.contact1}
Alternative Phone 2: ${customerDetails.contact2 || "N/A"}

*PRODUCT DETAILS*

${pairLines.join("\n\n")}

*PAYMENT SUMMARY*
- Product Price: ₹${subtotal}
${cleanerCharge > 0 ? `- Add-on: Shoe Cleaner (+₹${SHOE_CLEANER_PRICE})\n` : ""}- Shipping: ${isCod ? `₹${COD_CHARGE} (COD)` : "Free (Prepaid)"}
${isCod ? `- Advance attempted: ₹${COD_ADVANCE_AMOUNT}\n` : ""}
*Total Amount Payable: ₹${totalAmount}✅*`.trim();
  };

  const redirectToWhatsAppFallback = (reason: string) => {
    // Order wasn't confirmed by Razorpay, so this is a custom event, not
    // a standard Purchase — keeps reported Purchase revenue accurate.
    fbTrackCustom("WhatsAppOrderHandoff", {
      value: totalAmount,
      currency: "INR",
      reason,
    });

    window.open(
      `https://wa.me/${site.phone}?text=${encodeURIComponent(buildWhatsAppMessage(reason))}`,
      "_blank",
    );
    localStorage.removeItem("cart");
    setFormErrors([
      `${reason}. We've opened WhatsApp so you can confirm your order directly with us.`,
    ]);
    setIsLoading(false);
  };

  // Step 1: validate, then show the alert popup
  const handlePayClick = () => {
    setTouched((prev) => {
      const next = { ...prev };
      REQUIRED_FIELDS.forEach((f) => (next[f] = true));
      return next;
    });
    if (isFormValid) setShowPayAlert(true);
  };

  // Step 2: runs after the user confirms the popup
  const handleRazorpayPayment = async () => {
    setIsLoading(true);
    setFormErrors([]);

    if (!(await loadRazorpay())) {
      redirectToWhatsAppFallback("Payment gateway is currently unavailable");
      return;
    }

    try {
      // Send only identifiers + selected options — server computes money.
      const lines = [
        {
          productId: mainProduct._id,
          selectedSize: mainProduct.selectedSize,
          isFreeItem: false,
        },
      ];
      if (hasFreePair && freeProduct) {
        lines.push({
          productId: freeProduct._id,
          selectedSize: freeProduct.selectedSize,
          isFreeItem: true,
        });
      }

      const createRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerType, // server uses this to pick the base price
          lines,
          customerDetails,
          shippingMethod,
          addShoeCleaner: shoeCleanerAddon && addShoeCleaner,
          freeSocksOffer,
          expectedDeliveryLabel: activeDelivery.label,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok)
        throw new Error(createData?.error || "Could not create order");

      const { razorpayOrder, paymentAmount: serverPaymentAmount } = createData;

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: site.name || "MagShoppy",
        description: isCod
          ? `COD Advance Payment (₹${COD_ADVANCE_AMOUNT})`
          : isOnePair
            ? "1 Pair Shoes Order"
            : "2 Pair Shoes Order",
        order_id: razorpayOrder.id,
        prefill: {
          name: customerDetails.name,
          contact: customerDetails.contact1,
        },
        theme: { color: "#000000" },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response), // only razorpay_* fields
            });
            const verifyData = await verifyRes.json();

            if (!verifyData.success) {
              redirectToWhatsAppFallback("Payment verification failed");
              return;
            }

            fbEvent(
              "Purchase",
              { ...buildPixelPayload(), value: serverPaymentAmount },
              response.razorpay_payment_id,
            );

            localStorage.removeItem("cart");
            router.push(
              `/order-confirmed?payment_id=${response.razorpay_payment_id}&order_id=${verifyData.orderId}`,
            );
          } catch {
            redirectToWhatsAppFallback("We couldn't confirm your payment");
          }
        },
        modal: { ondismiss: () => setIsLoading(false) },
      });
      rzp.on("payment.failed", () =>
        redirectToWhatsAppFallback("Your payment failed"),
      );
      rzp.open();
    } catch (e: any) {
      redirectToWhatsAppFallback(e?.message || "We couldn't start the payment");
    }
  };

  if (!cartItems.length || !mainProduct) {
    return <EmptyCart isInvalid={cartItems.length > 0} />;
  }

  return (
    <main className="container mx-auto min-h-screen max-w-2xl bg-white px-4 pb-56 text-neutral-950">
      <div className="py-6">
        <StepProgress currentStep={currentStep} />

        {isLoading && (
          <p
            role="status"
            className="mb-4 border-l-4 border-black bg-neutral-50 p-3 text-sm font-medium"
          >
            Payment in progress. Please don&apos;t close, refresh or go back
            until you reach the order confirmation page. If you switch UPI apps,
            return to this page after paying.
          </p>
        )}

        {formErrors.length > 0 && (
          <ul
            role="alert"
            className="mb-4 list-inside list-disc space-y-1 border-l-4 border-red-600 bg-red-50 p-3 text-sm text-red-700"
          >
            {formErrors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        )}

        {currentStep === "payment" ? (
          <PaymentStep
            mainProduct={mainProduct}
            freeProduct={freeProduct}
            freeSocksOffer={freeSocksOffer}
            shoeCleanerAddon={shoeCleanerAddon}
            addShoeCleaner={addShoeCleaner}
            setAddShoeCleaner={setAddShoeCleaner}
            shippingMethod={shippingMethod}
            setShippingMethod={setShippingMethod}
            onlineDeliveryLabel={onlineDelivery.label}
            codDeliveryLabel={codDelivery.label}
            onContinue={goToDetailsStep}
          />
        ) : (
          <div>
            <h2 className="mb-1 text-3xl font-extrabold tracking-tighter">
              Delivery details
            </h2>
            <p className="mb-5 text-sm text-neutral-500">
              Enter your details for order delivery
            </p>
            <CustomerDetailsForm
              customerDetails={customerDetails}
              handleInputChange={handleInputChange}
              handleInputBlur={handleInputBlur}
              getFieldError={getFieldError}
            />
          </div>
        )}

        <OrderSummary
          pair1Extra={pair1Extra}
          pair2Extra={pair2Extra}
          freeSocksOffer={freeSocksOffer}
          shoeCleanerAddon={shoeCleanerAddon}
          addShoeCleaner={addShoeCleaner}
          shippingMethod={shippingMethod}
          activeDeliveryEnd={activeDelivery.end}
          totalAmount={totalAmount}
          isOnePair={isOnePair}
        />

        {isCod && (
          <p className="mt-3 text-center text-xs text-neutral-500">
            ₹{COD_ADVANCE_AMOUNT} advance now, ₹{remainingAmount} on delivery
          </p>
        )}
      </div>

      {/* Pay bar */}
      {currentStep === "details" && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white p-4 pb-5">
          <div className="mx-auto max-w-md space-y-2">
            <button
              type="button"
              onClick={handlePayClick}
              disabled={isLoading}
              className={cta}
            >
              {isLoading ? (
                <>
                  Processing…
                  <span className="size-5 animate-spin rounded-full border-2 border-neutral-300 border-t-black" />
                </>
              ) : (
                <>
                  {isCod
                    ? `Pay ₹${COD_ADVANCE_AMOUNT} advance`
                    : `Pay now — ₹${totalAmount}`}
                  <span aria-hidden>↗</span>
                </>
              )}
            </button>

            {!isFormValid && (
              <p className="text-center text-xs font-semibold text-red-600">
                Fill all required fields to continue
              </p>
            )}
            <p className="text-center text-xs font-semibold">
              Don&apos;t close or leave this page until payment is complete and
              you see the confirmation.
            </p>
            <p className="text-center text-xs text-neutral-500">
              Secure payment via Razorpay · Estimated delivery{" "}
              {activeDelivery.label}
            </p>
          </div>
        </div>
      )}

      {showPayAlert && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="pay-alert-title"
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
        >
          <div className="w-full max-w-sm space-y-4 rounded-xl bg-white p-5 shadow-xl">
            <h2
              id="pay-alert-title"
              className="text-2xl font-extrabold tracking-tighter"
            >
              Important before you pay
            </h2>
            <div className="space-y-2 text-sm text-neutral-600">
              <p>
                Do <b className="text-neutral-950">not</b> close, refresh or go
                back until you see the{" "}
                <b className="text-neutral-950">order confirmation page</b>.
              </p>
              <ul className="list-inside list-disc space-y-1">
                <li>
                  Switching UPI apps is fine, but return to this page after
                  paying.
                </li>
                <li>
                  Your order is confirmed only after the confirmation page
                  appears.
                </li>
                <li>
                  If money is deducted and you don&apos;t see it, WhatsApp us
                  with your payment screenshot.
                </li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowPayAlert(false)}
                className="rounded-md border border-neutral-300 py-3 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPayAlert(false);
                  handleRazorpayPayment();
                }}
                className="rounded-md bg-black py-3 font-bold text-white"
              >
                I understand
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
