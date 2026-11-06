"use client";

import { Suspense, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  Loader2,
  Link as LinkIcon,
  Check,
  MessageCircle,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// 👇 Adjust this path to wherever your site config file lives
import { site } from "@/lib/site-config";

interface OrderItem {
  productName: string;
  productId?: string;
  size?: string;
  price: number;
  isFreeItem?: boolean;
  imageUrl?: string;
}

interface Order {
  orderId: string;
  items: OrderItem[];
  customerName: string;
  contact1: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  landmark?: string;
  shippingMethod?: string;
  shoeCleanerAddon?: boolean;
  freeSocksOffer?: boolean;
  subtotal: number;
  shippingCharge: number;
  totalAmount: number;
  expectedDeliveryLabel?: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
}

const STEPS = [
  { key: "pending", label: "Placed", icon: Clock },
  { key: "processing", label: "Preparing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

// ---- Design tokens (same family as the home cards) ----

// Header: the same indigo mesh as the "Where’s my order?" card that links here.
const headerMesh: CSSProperties = {
  backgroundColor: "#4f46e5",
  backgroundImage: [
    "radial-gradient(60% 90% at 0% 0%, #22d3ee 0%, transparent 60%)",
    "radial-gradient(55% 80% at 100% 10%, #e879f9 0%, transparent 60%)",
    "radial-gradient(70% 90% at 90% 100%, #fb923c 0%, transparent 60%)",
    "radial-gradient(60% 80% at 10% 100%, #7c3aed 0%, transparent 60%)",
  ].join(","),
};

// Order cards: near-black with an amber bloom top-right and an indigo underglow.
// Static gradients only, so nothing to blur or repaint.
const cardMesh: CSSProperties = {
  backgroundColor: "#0a0a0a",
  backgroundImage: [
    "radial-gradient(55% 45% at 100% 0%, rgba(251,191,36,0.30) 0%, transparent 62%)",
    "radial-gradient(60% 40% at 0% 100%, rgba(99,102,241,0.22) 0%, transparent 66%)",
    "linear-gradient(to bottom, #171717, #0a0a0a)",
  ].join(","),
};

const ring =
  "pointer-events-none absolute -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border";

function stepIndex(status: string) {
  const idx = STEPS.findIndex((s) => s.key === status?.toLowerCase());
  return idx === -1 ? 0 : idx;
}

function statusPill(status: string) {
  const s = status?.toLowerCase();
  if (s === "delivered") return "bg-emerald-400/15 text-emerald-300";
  if (s === "cancelled" || s === "failed") return "bg-rose-400/15 text-rose-300";
  if (s === "shipped" || s === "processing") return "bg-amber-400/15 text-amber-300";
  return "bg-white/10 text-white/80";
}

// Only paid orders are shown (hides pending / failed payments)
function isPaid(order: Order) {
  return order.paymentStatus?.toLowerCase() === "paid";
}

// WhatsApp needs country code + number, digits only.
// site.social.whatsapp is "9656060874" (10 digits), so we prefix 91 (India).
function getWhatsAppNumber() {
  const digits = String(site.social?.whatsapp ?? site.phone ?? "").replace(
    /\D/g,
    "",
  );
  return digits.length === 10 ? `91${digits}` : digits;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Product links: https://footex.in/p/<productId>
const SITE_URL = "https://footex.in";
const PRODUCT_PATH = "/p/";

function productPath(item: OrderItem) {
  if (!item.productId) return null;
  // Strip Sanity's draft prefix if present so the link never breaks
  const id = item.productId.replace(/^drafts\./, "");
  return `${PRODUCT_PATH}${id}`;
}

function productUrl(item: OrderItem) {
  const path = productPath(item);
  return path ? `${SITE_URL}${path}` : null;
}

// Builds a wa.me link with the order details pre-filled as the message.
function buildWhatsAppLink(order: Order) {
  const itemLines = order.items
    .map((it, i) => {
      const url = productUrl(it);
      return [
        `Pair ${i + 1}: ${it.size ? ` (Size ${it.size})` : ""}${
          it.isFreeItem ? " - FREE" : ` - ₹${it.price}`
        }`,
        url,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  const message = [
    `Hi ${site.name}! I need help with my order.`,
    ``,
    `Order ID: ${order.orderId}`,
    `Name: ${order.customerName}`,
    `Date: ${formatDate(order.createdAt)}`,
    `Status: ${order.fulfillmentStatus}`,
    `Total: ₹${order.totalAmount}`,
    ``,
    `Items:`,
    itemLines,
  ].join("\n");

  return `https://wa.me/${getWhatsAppNumber()}?text=${encodeURIComponent(message)}`;
}

// Perforated divider, the "tear line" on a shipping manifest, tuned for the dark card.
function Perforation() {
  return (
    <div
      aria-hidden
      className="my-5 h-px w-full"
      style={{
        backgroundImage:
          "repeating-linear-gradient(to right, rgba(255,255,255,0.16) 0 6px, transparent 6px 14px)",
      }}
    />
  );
}

function TrackOrderContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [contact1, setContact1] = useState(searchParams.get("phone") ?? "");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState(false);

  const digitsOnly = contact1.replace(/\D/g, "");
  const isValid = digitsOnly.length === 10;

  async function runSearch(phone: string) {
    setLoading(true);
    setError(null);
    setSearched(true);
    setOrders(null);

    try {
      const params = new URLSearchParams({ contact1: phone });
      const res = await fetch(`/api/orders/track?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "We couldn’t find any orders for that number.");
        return;
      }

      // Show paid orders only
      setOrders((data.orders as Order[]).filter(isPaid));
    } catch {
      setError("Something went wrong on our end. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Auto-run a search if the page was opened with ?phone=... in the URL
  // (e.g. a shared tracking link).
  useEffect(() => {
    const initial = searchParams.get("phone");
    if (initial && /^\d{10}$/.test(initial)) {
      runSearch(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    router.replace(`${pathname}?phone=${digitsOnly}`, { scroll: false });
    runSearch(digitsOnly);
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: nothing to do */
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-5 py-10 md:py-16">
        {/* Header card: title + search in one place */}
        <section
          style={headerMesh}
          className="relative isolate overflow-hidden rounded-3xl p-5 text-white shadow-xl shadow-indigo-500/30 ring-1 ring-white/25 [contain:paint] md:p-6"
        >
          <span aria-hidden className={`${ring} left-full top-0 size-48 border-white/25`} />
          <span aria-hidden className={`${ring} left-full top-0 size-80 border-white/[0.14]`} />
          <span aria-hidden className={`${ring} left-full top-0 size-[28rem] border-white/[0.08]`} />

          <h1 className="relative text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Where’s my order?
          </h1>
          <p className="relative mt-1.5 max-w-md text-sm leading-snug text-white/85">
            Enter the phone number you used at checkout. We’ll pull up every
            order tied to it.
          </p>

          <label
            htmlFor="contact1"
            className="relative mt-6 block text-xs font-medium text-white/85"
          >
            Phone number
          </label>
          <form
            onSubmit={handleSearch}
            className="relative mt-2 flex items-center rounded-2xl bg-black/25 py-1.5 pl-2 pr-1.5 ring-1 ring-white/20 transition-colors focus-within:bg-black/35 focus-within:ring-2 focus-within:ring-white"
          >
            <Search className="ml-2 size-5 shrink-0 text-white/70" strokeWidth={1.75} />
            <Input
              id="contact1"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              value={contact1}
              onChange={(e) =>
                setContact1(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              placeholder="9876543210"
              aria-invalid={contact1.length > 0 && !isValid}
              className="h-12 min-w-0 flex-1 border-0 bg-transparent px-3 text-xl font-semibold tabular-nums tracking-tight text-white shadow-none placeholder:text-white/40 focus-visible:ring-0 dark:bg-transparent"
            />
            <Button
              type="submit"
              disabled={!isValid || loading}
              className="h-12 rounded-xl bg-white px-5 text-base font-semibold text-neutral-900 hover:bg-neutral-100 disabled:bg-white/60 disabled:opacity-100"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? "Searching" : "Track"}
            </Button>
          </form>

          {contact1.length > 0 && !isValid && (
            <p className="relative mt-2 text-xs text-white/85">
              Enter a valid 10-digit phone number.
            </p>
          )}
        </section>

        <div aria-live="polite">
          {loading && (
            <div className="mt-8 space-y-3">
              <Skeleton className="h-20 w-full rounded-3xl" />
              <Skeleton className="h-20 w-full rounded-3xl" />
            </div>
          )}

          {!loading && error && (
            <Alert variant="destructive" className="mt-8 rounded-2xl">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loading && !error && searched && orders?.length === 0 && (
            <div className="mt-8 rounded-3xl border border-dashed py-10 text-center">
              <Package className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No orders found for this number.
              </p>
            </div>
          )}
        </div>

        {!loading && !error && orders && orders.length > 0 && (
          <>
            <div className="mb-3 mt-8 flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {orders.length === 1
                  ? "1 order found"
                  : `${orders.length} orders found`}
              </p>
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-md text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                {copied ? (
                  <Check className="size-3.5" />
                ) : (
                  <LinkIcon className="size-3.5" />
                )}
                {copied ? "Link copied" : "Copy link to this result"}
              </button>
            </div>

            <Accordion
              type="single"
              collapsible
              defaultValue={orders[0].orderId}
              className="space-y-3"
            >
              {orders.map((order) => {
                const cancelled =
                  order.fulfillmentStatus?.toLowerCase() === "cancelled";
                const idx = stepIndex(order.fulfillmentStatus);

                return (
                  <AccordionItem
                    key={order.orderId}
                    value={order.orderId}
                    style={cardMesh}
                    className="relative isolate overflow-hidden rounded-3xl border-0 text-white ring-1 ring-white/10 [contain:paint]"
                  >
                    <span aria-hidden className={`${ring} left-full top-0 size-44 border-amber-300/20`} />
                    <span aria-hidden className={`${ring} left-full top-0 size-72 border-amber-300/10`} />

                    <AccordionTrigger className="px-5 py-4 text-white hover:no-underline [&>svg]:shrink-0 [&>svg]:text-white/60">
                      <div className="flex w-full items-center justify-between gap-3 pr-2">
                        <div className="min-w-0 text-left">
                          <p className="text-sm font-semibold">
                            Order {order.orderId}
                          </p>
                          {order.customerName && (
                            <p className="mt-0.5 truncate text-xs text-white/70">
                              {order.customerName}
                            </p>
                          )}
                          <p className="mt-0.5 text-xs text-white/50">
                            {formatDate(order.createdAt)} · ₹{order.totalAmount}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold capitalize ${statusPill(
                            order.fulfillmentStatus,
                          )}`}
                        >
                          {order.fulfillmentStatus}
                        </span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-5 pb-5">
                      <Perforation />

                      {cancelled ? (
                        <div className="flex items-center gap-2 text-sm text-rose-300">
                          <XCircle className="size-4" />
                          This order was cancelled
                        </div>
                      ) : (
                        <div className="flex items-center">
                          {STEPS.map((step, i) => {
                            const Icon = step.icon;
                            const done = i <= idx;
                            const current = i === idx;
                            return (
                              <div
                                key={step.key}
                                className="flex flex-1 items-center last:flex-none"
                              >
                                <div className="flex flex-col items-center gap-1.5">
                                  <div
                                    className={`grid size-8 place-items-center rounded-full transition-colors ${
                                      done
                                        ? "bg-amber-400 text-black"
                                        : "bg-white/10 text-white/40"
                                    } ${current ? "ring-2 ring-amber-400/40 ring-offset-2 ring-offset-neutral-900" : ""}`}
                                  >
                                    <Icon className="size-4" />
                                  </div>
                                  <span
                                    className={`text-center text-[10px] ${
                                      done
                                        ? "font-medium text-white"
                                        : "text-white/40"
                                    }`}
                                  >
                                    {step.label}
                                  </span>
                                </div>
                                {i < STEPS.length - 1 && (
                                  <div
                                    className={`mx-1 mb-4 h-0.5 flex-1 rounded-full ${
                                      i < idx ? "bg-amber-400" : "bg-white/10"
                                    }`}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {order.expectedDeliveryLabel && !cancelled && (
                        <p className="mt-4 text-xs text-white/50">
                          Expected delivery:{" "}
                          <span className="font-medium text-white">
                            {order.expectedDeliveryLabel}
                          </span>
                        </p>
                      )}

                      <Perforation />

                      <div className="space-y-3">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            {item.imageUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.imageUrl}
                                alt={item.productName}
                                width={48}
                                height={48}
                                loading="lazy"
                                decoding="async"
                                className="size-12 shrink-0 rounded-xl bg-white/10 object-cover ring-1 ring-white/10"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm text-white">
                                {productPath(item) ? (
                                  <a
                                    href={productPath(item)!}
                                    className="hover:underline focus-visible:underline"
                                  >
                                    {'MagShoppy'}
                                  </a>
                                ) : (
                                  'MagShoppy'
                                )}
                                {item.isFreeItem && (
                                  <span className="ml-1.5 rounded-md bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                                    Free
                                  </span>
                                )}
                              </p>
                              {item.size && (
                                <p className="text-xs text-white/50">
                                  Size {item.size}
                                </p>
                              )}
                            </div>
                            <p className="shrink-0 text-sm text-white/70">
                              ₹{item.price}
                            </p>
                          </div>
                        ))}
                      </div>

                      <Perforation />

                      <div className="space-y-2 text-xs text-white/60">
                        {order.customerName && (
                          <div className="flex items-center gap-2">
                            <User className="size-3.5 shrink-0 text-white/50" />
                            <p className="font-medium text-white">
                              {order.customerName}
                            </p>
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 size-3.5 shrink-0 text-white/50" />
                          <p>
                            {order.address},{" "}
                            {order.landmark ? `${order.landmark}, ` : ""}
                            {order.district}, {order.state} – {order.pincode}
                          </p>
                        </div>
                      </div>

                      <a
                        href={buildWhatsAppLink(order)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 flex items-center justify-between rounded-2xl bg-amber-400 py-1 pl-5 pr-1 text-sm font-semibold text-black transition-colors hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
                      >
                        Need help? Chat on WhatsApp
                        <span className="grid size-10 place-items-center rounded-xl bg-black text-amber-400">
                          <MessageCircle className="size-5" />
                        </span>
                      </a>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </>
        )}
      </div>
    </main>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background">
          <div className="mx-auto max-w-2xl px-5 py-10 md:py-16">
            <Skeleton className="h-52 w-full rounded-3xl" />
          </div>
        </main>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}