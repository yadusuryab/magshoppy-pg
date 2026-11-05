"use client";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAddToCart } from "@/hooks/useAddToCart";
import ProductCard2 from "./product-image-card";

interface ProductListProps {
  price?: string | null;
  /** "one" = one pair offer, "two" = two pair (BOGO) offer */
  pair?: "one" | "two";
}

const FIRST = 12;
const NEXT = 8;
const grid = "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4";

function ProductList({ price, pair = "two" }: ProductListProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(true);
  const state = useRef({ offset: 0, busy: false, gen: 0 });
  const sentinel = useRef<HTMLDivElement>(null);

  const { handleProductClick, renderBogoPage, renderSizeModal, renderCheckoutLoading } =
    useAddToCart({ pair });

  const load = useCallback(async () => {
    const s = state.current;
    if (s.busy) return;
    s.busy = true;
    setLoading(true);
    const gen = s.gen;
    const limit = s.offset ? NEXT : FIRST;
    try {
      const { getAllShoes } = await import("@/lib/vehicleQueries");
      const d: any = await getAllShoes(price, limit, s.offset);
      if (gen !== s.gen) return; // price changed mid-request
      setItems((p) => [...p, ...(d || [])]);
      s.offset += d?.length || 0;
      setMore(d?.length === limit);
    } catch {
      if (gen !== s.gen) return;
      toast.error("Failed to load products");
      setMore(false);
    } finally {
      if (gen === s.gen) {
        s.busy = false;
        setLoading(false);
      }
    }
  }, [price]);

  // Reset and load first page whenever the price filter changes
  useEffect(() => {
    const s = state.current;
    s.gen++;
    s.offset = 0;
    s.busy = false;
    setItems([]);
    setMore(true);
    load();
  }, [load]);

  // Load the next page only when the user nears the end of the list
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !more || !items.length) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && load(), {
      rootMargin: "600px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [more, items.length, load]);

  const isOne = pair === "one";
  const bogo = useMemo(() => (isOne ? [] : items.filter((i) => i.buyOneGetOne)), [items, isOne]);

  return (
    <div className="md:mx-24">
      <h2 className="mb-6 text-4xl font-extrabold tracking-tighter text-neutral-950 md:text-5xl">
        {isOne ? "Select your pair" : "Select 1st pair"}
      </h2>

      {!items.length && !loading ? (
        <div className="py-16 text-center">
          <p className="mb-4 text-xl font-bold tracking-tight">No products found</p>
          <button
            type="button"
            onClick={() => {
              setMore(true);
              load();
            }}
            className="rounded-md bg-black px-5 py-3 font-bold text-white"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className={grid}>
          {items.map((p) => (
            <ProductCard2
              key={p._id}
              product={p}
              className="w-full"
              noLink
              onClick={() => handleProductClick(p)}
            />
          ))}
          {loading &&
            Array.from({ length: items.length ? 4 : 8 }, (_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-lg bg-neutral-100" />
            ))}
        </div>
      )}

      {more && <div ref={sentinel} className="h-px" />}

      {renderBogoPage(bogo)}
      {renderSizeModal(bogo)}
      {renderCheckoutLoading()}
    </div>
  );
}

export default memo(ProductList);