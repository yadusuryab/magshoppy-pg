import type { CSSProperties, ReactNode } from "react";
import { ProductImage } from "./product-image";
import { CartItem } from "@/lib/types/checkout";
import { COD_CHARGE } from "@/lib/checkout-constants";
import { ShoeCleanerAddon } from "./shoe-cleaner";

// ---- Site colors (unchanged): dark gradient card, amber action, mesh accent ----
const mesh: CSSProperties = {
  backgroundColor: "#4f46e5",
  backgroundImage: [
    "radial-gradient(60% 90% at 0% 0%, #22d3ee 0%, transparent 60%)",
    "radial-gradient(55% 80% at 100% 10%, #e879f9 0%, transparent 60%)",
    "radial-gradient(70% 90% at 90% 100%, #fb923c 0%, transparent 60%)",
    "radial-gradient(60% 80% at 10% 100%, #7c3aed 0%, transparent 60%)",
  ].join(","),
};

const dark = "bg-neutral-950 text-white";

const amberCta =
  "group flex w-full items-center justify-between rounded-2xl bg-amber-400 py-1.5 pl-6 pr-1.5 text-lg font-extrabold tracking-tight text-black transition-all duration-300 hover:bg-amber-300 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400";

function PairCard({
  product,
  alt,
  label,
  free = false,
}: {
  product: CartItem;
  alt: string;
  label: string;
  free?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-2 `}>
      <ProductImage product={product} alt={alt} borderClass="border-transparent" />

      <span
        style={free ? mesh : undefined}
        className={`absolute left-4 top-4 rounded-lg px-2 py-1 text-[11px] font-bold text-white ${
          free ? "" : "bg-black/70"
        }`}
      >
        {label}
      </span>

      <p className="px-1 pb-1 pt-2.5 text-sm font-bold tracking-tight text-muted-foreground ">
        Size: UK {product.selectedSize || "N/A"}
      </p>
    </div>
  );
}

function Option({
  id,
  selected,
  onSelect,
  title,
  aside,
  sub,
}: {
  id: string;
  selected: boolean;
  onSelect: () => void;
  title: string;
  aside: ReactNode;
  sub: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-2xl p-4 transition-all duration-300 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-amber-400 ${
        selected ? dark : "bg-neutral-100 text-neutral-950 hover:bg-neutral-200"
      }`}
    >
      <input
        type="radio"
        name="payment-method"
        value={id}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      <span
        aria-hidden
        className={`grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-bold transition-colors duration-300 ${
          selected ? "bg-amber-400 text-black" : "bg-white"
        }`}
      >
        {selected && "✓"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="text-base font-bold tracking-tight">{title}</span>
          {aside}
        </span>
        <span className={`mt-0.5 block text-xs ${selected ? "text-white/60" : "text-neutral-500"}`}>
          {sub}
        </span>
      </span>
    </label>
  );
}

export function PaymentStep({
  mainProduct,
  freeProduct,
  freeSocksOffer,
  shoeCleanerAddon,
  addShoeCleaner,
  setAddShoeCleaner,
  shippingMethod,
  setShippingMethod,
  onlineDeliveryLabel,
  codDeliveryLabel,
  onContinue,
}: {
  mainProduct: CartItem;
  freeProduct?: CartItem;
  freeSocksOffer: boolean;
  shoeCleanerAddon: boolean;
  addShoeCleaner: boolean;
  setAddShoeCleaner: (v: boolean) => void;
  shippingMethod: "online" | "cod";
  setShippingMethod: (v: "online" | "cod") => void;
  onlineDeliveryLabel: string;
  codDeliveryLabel: string;
  onContinue: () => void;
}) {
  const online = shippingMethod === "online";

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <PairCard
            product={mainProduct}
            alt={mainProduct.productName || "Main Product"}
            label="Pair 1"
          />
          {freeProduct && (
            <PairCard
              product={freeProduct}
              alt={freeProduct.productName || "Free Product"}
              label="Free"
              free
            />
          )}
        </div>

        {freeSocksOffer && (
          <div className={`flex items-center gap-3 rounded-2xl p-3.5 ${dark}`}>
            <span
              aria-hidden
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-400 text-2xl font-extrabold text-black"
            >
              +
            </span>
            <div className="min-w-0">
              <p className="font-bold tracking-tight">Free Flame Socks with this order</p>
              <p className="mt-0.5 text-xs text-white/60">
                A pair of Flame Socks will be added to your order for free. Enjoy the comfort and
                style!
              </p>
            </div>
          </div>
        )}
      </div>

      <fieldset>
        <legend className="mb-3 text-2xl font-extrabold tracking-tighter">Payment method</legend>
        <div className="space-y-2">
          <Option
            id="online"
            selected={online}
            onSelect={() => setShippingMethod("online")}
            title="Prepaid"
            aside={
              <span
                className={`text-xs font-bold ${online ? "text-emerald-400" : "text-emerald-600"}`}
              >
                Save ₹{COD_CHARGE} instantly
              </span>
            }
            sub={`Arrives ${onlineDeliveryLabel}`}
          />
          <Option
            id="cod"
            selected={!online}
            onSelect={() => setShippingMethod("cod")}
            title="Cash on delivery"
            aside={<span className="text-xs font-bold opacity-70">+₹{COD_CHARGE}</span>}
            sub={`Arrives ${codDeliveryLabel}`}
          />
        </div>
      </fieldset>

      {shoeCleanerAddon && (
        <ShoeCleanerAddon addShoeCleaner={addShoeCleaner} setAddShoeCleaner={setAddShoeCleaner} />
      )}

      <button type="button" onClick={onContinue} className={amberCta}>
        Continue
        <span
          aria-hidden
          className="grid size-11 place-items-center rounded-xl bg-black text-xl text-amber-400 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        >
          ↗
        </span>
      </button>
    </div>
  );
}