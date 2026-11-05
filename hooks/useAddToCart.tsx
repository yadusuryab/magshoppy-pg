"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ProductCard2 from "@/components/product/product-image-card";
import Image from "next/image";
import Link from "next/link";

export interface Product {
  _id: string;
  productName: string;
  sizes: (string | number)[];
  disabledSizes?: (string | number)[];
  buyOneGetOne: boolean;
  imageUrl?: string;
  price?: number;
  offerPrice?: number;
}

export interface UseAddToCartOptions {
  /** "one" = single pair, skip BOGO. "two" = BOGO flow (default). */
  pair?: "one" | "two";
}

const cta =
  "w-full rounded-md bg-black px-5 py-4 text-left text-base font-bold text-white disabled:bg-neutral-100 disabled:text-neutral-400";

const isOff = (p: Product, s: string) =>
  !!p.disabledSizes?.some((x) => String(x) === s);

const Thumb = ({ p }: { p: Product }) => (
  <Image
    src={p.imageUrl || "/placeholder-image.jpg"}
    alt={p.productName}
    width={56}
    height={56}
    quality={30}
    loading="lazy"
    className="size-14 shrink-0 rounded-md bg-neutral-100 object-cover"
  />
);

export const useAddToCart = ({ pair = "two" }: UseAddToCartOptions = {}) => {
  const router = useRouter();
  const one = pair === "one";

  const [bogoOpen, setBogoOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [main, setMain] = useState<Product | null>(null);
  const [free, setFree] = useState<Product | null>(null);
  const [mainSize, setMainSize] = useState<string | null>(null);
  const [freeSize, setFreeSize] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [extra, setExtra] = useState<Product[]>([]);
  const [nav, setNav] = useState(false);
  const [slow, setSlow] = useState(false);
  const page = useRef({ offset: 0, more: true, busy: false });

  const loadMore = useCallback(async () => {
    const p = page.current;
    if (p.busy || !p.more) return;
    p.busy = true;
    try {
      const { getAllShoes } = await import("@/lib/vehicleQueries");
      const d: any = await getAllShoes(null, 12, p.offset);
      if (d?.length) {
        setExtra((e) => [...e, ...d.filter((i: Product) => i.buyOneGetOne)]);
        p.more = d.length === 12;
        p.offset += d.length;
      } else p.more = false;
    } catch {
      toast.error("Failed to load more products");
    } finally {
      p.busy = false;
    }
  }, []);

  // Fetch extra BOGO products only when the 2nd-pair page opens
  useEffect(() => {
    if (!one && bogoOpen && !page.current.offset) loadMore();
  }, [one, bogoOpen, loadMore]);

  // Show a manual checkout link if navigation is slow
  useEffect(() => {
    if (!nav) return;
    const t = setTimeout(() => setSlow(true), 3000);
    return () => clearTimeout(t);
  }, [nav]);

  const go = useCallback(() => {
    setSlow(false);
    setNav(true);
    router.push("/checkout");
  }, [router]);

  const addToCart = (
    item: Product,
    size: string,
    fp?: Product,
    fs?: string | null,
  ) => {
    localStorage.setItem(
      "cart",
      JSON.stringify([
        {
          ...item,
          selectedSize: size,
          offerType: one ? "one-pair" : "two-pair",
          freeProduct: fp ? { ...fp, selectedSize: fs } : null,
        },
      ]),
    );
    window.dispatchEvent(new Event("cartUpdated"));
    toast.success(`Added to cart!`);
  };

  const finish = () => {
    if (!(main && mainSize && free && freeSize)) return;
    addToCart(main, mainSize, free, freeSize);
    setBogoOpen(false);
    setSizeOpen(false);
    setTimeout(go, 100);
  };

  const handleProductClick = useCallback((p: Product) => {
    setMain(p);
    setMainSize(null);
    setFree(null);
    setFreeSize(null);
    setSizeOpen(true);
  }, []);

  const pickFree = (p: Product) => {
    setFree(p);
    setFreeSize(null);
    setSizeOpen(true);
  };

  const renderBogoPage = (initial: Product[]) => {
    if (one || !bogoOpen || !main) return null;
    const q = query.trim().toLowerCase();
    const list = [...initial, ...extra].filter(
      (p) => !q || p.productName.toLowerCase().includes(q),
    );

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-white p-4 pb-40 text-neutral-950">
        <h2 className="text-3xl font-extrabold tracking-tighter">
          Select 2nd pair
        </h2>
        <p className="text-sm text-neutral-500">
          Pick any eligible pair. It's free.
        </p>

        <div className="my-4 flex items-center gap-4 border-y border-neutral-200 py-4">
          <Thumb p={main} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">Your first pair</p>
            <p className="text-sm text-neutral-500">Size: UK {mainSize}</p>
          </div>
        </div>

        <div
          className="grid grid-cols-2 gap-3 md:grid-cols-4 md:px-64"
          onScroll={(e) => {
            const t = e.currentTarget;
            if (t.scrollHeight - t.scrollTop <= t.clientHeight + 300)
              loadMore();
          }}
        >
          {list.length ? (
            list.map((p) => (
              <div
                key={p._id}
                className={`rounded-lg ${free?._id === p._id ? "ring-2 ring-black" : "ring-1 ring-neutral-200"}`}
              >
                <ProductCard2
                  product={p}
                  className="w-full"
                  noLink
                  onClick={() => pickFree(p)}
                />
              </div>
            ))
          ) : (
            <p className="col-span-full py-10 text-center text-sm text-neutral-500">
              No products found
            </p>
          )}
        </div>

        <div className="fixed inset-x-0 bottom-0 border-t border-neutral-200 bg-white p-4">
          <div className="mx-auto max-w-md">
            <p className="mb-3 truncate text-sm">
              {free ? (
                <>
                  <b>MagShoppy</b> ·{" "}
                  {freeSize ? `UK ${freeSize}` : "pick a size"} · Free
                </>
              ) : (
                "Select your 2nd pair"
              )}
            </p>
            <button
              type="button"
              onClick={finish}
              disabled={!free || !freeSize}
              className={cta}
            >
              {freeSize ? "Checkout ↗" : "Select size first"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSizeModal = (_bogoProducts?: Product[]) => {
    const isFree = !one && !!free;
    const cur = isFree ? free : main;
    const size = isFree ? freeSize : mainSize;
    if (!sizeOpen || !cur) return null;

    const confirm = () => {
      if (!size) return toast.error("Please select a size");
      if (isOff(cur, size)) return toast.error("This size is unavailable");
      if (isFree) {
        setSizeOpen(false);
        finish();
      } else if (!one && main?.buyOneGetOne) {
        setBogoOpen(true);
        setSizeOpen(false);
      } else {
        addToCart(main!, size);
        setSizeOpen(false);
        go();
      }
    };

    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4"
        onClick={() => setSizeOpen(false)}
      >
        <div
          className="max-h-[92vh] w-full max-w-[340px] space-y-4 overflow-y-auto rounded-xl bg-white p-4 text-neutral-950 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={cur.imageUrl || "/placeholder-image.jpg"}
            alt={cur.productName}
            width={340}
            height={340}
            sizes="340px"
            quality={60}
            priority
            className="aspect-square w-full rounded-lg bg-neutral-100 object-cover"
          />
          {/* <p className="text-lg font-bold tracking-tight">{cur.productName}</p> */}
          <div>
            <p className="text-2xl font-extrabold tracking-tighter">
              {isFree ? "Pick size for 2nd pair" : "Pick your size"}
            </p>
            <p className="text-sm text-neutral-500">UK sizing</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {cur.sizes?.map((r) => {
              const s = String(r);
              const off = isOff(cur, s);
              return (
                <button
                  key={s}
                  type="button"
                  disabled={off}
                  aria-pressed={size === s}
                  onClick={() => (isFree ? setFreeSize(s) : setMainSize(s))}
                  className={`min-w-14 rounded-md border px-3 py-2.5 text-sm font-bold tabular-nums ${
                    off
                      ? "border-neutral-100 text-neutral-300 line-through"
                      : size === s
                        ? "border-black bg-black text-white"
                        : "border-neutral-300"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={confirm}
            disabled={!size}
            className={cta}
          >
            {(isFree
              ? "Confirm & checkout"
              : one
                ? "Buy now"
                : "Confirm size") + " ↗"}
          </button>
        </div>
      </div>
    );
  };

  const renderCheckoutLoading = () =>
    nav ? (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-white p-6 text-center text-neutral-950">
        <p className="text-2xl font-extrabold tracking-tighter">
          Taking you to checkout…
        </p>
        {slow && (
          <Link
            href="/checkout"
            onClick={() => setNav(false)}
            className="rounded-md bg-black px-5 py-4 font-bold text-white"
          >
            Still here? Go to checkout ↗
          </Link>
        )}
      </div>
    ) : null;

  return {
    handleProductClick,
    renderBogoPage,
    renderSizeModal,
    renderCheckoutLoading,
    setSearchQuery: setQuery,
  };
};
