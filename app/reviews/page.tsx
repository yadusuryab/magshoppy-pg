"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { client } from "@/sanityClient";
import ReviewForm from "@/components/sections/review-form";

interface Review {
  _id: string;
  customerName: string;
  rating: number;
  reviewText?: string;
  images: string[];
  isVerifiedPurchase: boolean;
  createdAt: string;
}

type Sort = "recent" | "high" | "low";
type Lightbox = { urls: string[]; index: number } | null;

const PAGE_SIZE = 5;
const TEXT_LIMIT = 220;

/* ---------- Stars ---------- */

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  const pct = Math.max(0, Math.min(5, value)) * 20;
  return (
    <span
      className="relative inline-block leading-none"
      style={{ fontSize: size }}
      role="img"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >
      <span className="text-gray-300">★★★★★</span>
      <span
        className="absolute inset-0 overflow-hidden whitespace-nowrap text-amber-500"
        style={{ width: `${pct}%` }}
      >
        ★★★★★
      </span>
    </span>
  );
}

/* ---------- Summary ---------- */

function Summary({
  reviews,
  filter,
  onFilter,
  onWrite,
}: {
  reviews: Review[];
  filter: number | null;
  onFilter: (n: number | null) => void;
  onWrite: () => void;
}) {
  const total = reviews.length;
  const avg = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  const counts = [5, 4, 3, 2, 1].map((n) => ({
    n,
    c: reviews.filter((r) => r.rating === n).length,
  }));

  return (
    <aside className="lg:sticky lg:top-20 lg:self-start">
      <div className="mt-3 grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
        <div className="flex justify-between items-center gap-3">
          <div className="w-full">
            {" "}
            <h2 className="text-xl sm:text-2xl font-semibold ">
              Customer reviews
            </h2>
            <p className="text-sm text-muted-foreground font-semibold mt-1">
              {total} {total === 1 ? "rating" : "ratings"}
            </p>{" "}
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="flex rounded-full items-center gap-3 flex-wrap">
              <Stars value={avg} size={22} />
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              {avg.toFixed(1)} out of 5
            </span>
          </div>
        </div>

        {/* <div className="sm:row-span-2 lg:row-span-1">
          <ul className="space-y-1">
            {counts.map(({ n, c }) => {
              const pct = total ? Math.round((c / total) * 100) : 0;
              const active = filter === n;
              return (
                <li key={n}>
                  <button
                    type="button"
                    onClick={() => onFilter(active ? null : n)}
                    disabled={c === 0}
                    aria-pressed={active}
                    className={`w-full min-h-[36px] flex items-center gap-3 text-sm rounded px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 ${
                      c === 0 ? "opacity-50 cursor-default" : "hover:bg-gray-50"
                    } ${active ? "bg-gray-100" : ""}`}
                  >
                    <span className="w-12 shrink-0 text-left text-blue-700">{n} star</span>
                    <span className="flex-1 min-w-0 h-4 rounded bg-gray-200 overflow-hidden">
                      <span
                        className="block h-full bg-amber-500"
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                    <span className="w-10 shrink-0 text-right text-blue-700">{pct}%</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {filter && (
            <button
              type="button"
              onClick={() => onFilter(null)}
              className="mt-2 text-sm text-blue-700 hover:underline"
            >
              Clear {filter}-star filter
            </button>
          )}
        </div> */}

        <div className="lg:border-t lg:pt-5 bg-muted px-2 py-1 rounded-md">
          <h3 className="font-semibold">Review this product</h3>
          <p className="text-sm text-gray-600 mt-1">
            Share your thoughts and photos.
          </p>
          <button
            type="button"
            onClick={onWrite}
            className="mt-3 w-full min-h-[44px] rounded-lg border border-gray-400 text-sm font-medium hover:bg-gray-50"
          >
            Write a review
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ---------- Customer photos strip ---------- */

function PhotoStrip({
  reviews,
  onOpen,
}: {
  reviews: Review[];
  onOpen: (urls: string[], index: number) => void;
}) {
  const all = useMemo(() => reviews.flatMap((r) => r.images), [reviews]);
  if (!all.length) return null;
  const shown = all.slice(0, 8);
  const extra = all.length - shown.length;

  return (
    <section className="mb-6 overflow-scroll max-w-[300px]">
      <h3 className="text-lg font-semibold mb-3">Reviews with images</h3>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
        {shown.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => onOpen(all, i)}
            className="relative shrink-0 snap-start w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
            aria-label={`Open customer photo ${i + 1}`}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="96px"
              className="object-cover"
            />
            {i === shown.length - 1 && extra > 0 && (
              <span className="absolute inset-0 bg-black/55 text-white text-sm font-medium flex items-center justify-center">
                +{extra}
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

/* ---------- Single review ---------- */

function ReviewItem({
  review,
  onOpen,
}: {
  review: Review;
  onOpen: (urls: string[], index: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const text = review.reviewText ?? "";
  const long = text.length > TEXT_LIMIT;
  const date = new Date(review.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="py-5 border-b last:border-b-0">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 text-sm font-semibold flex items-center justify-center"
        >
          {review.customerName.charAt(0).toUpperCase()}
        </span>
        <span className="text-sm font-medium">{review.customerName}</span>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <Stars value={review.rating} />
        {review.isVerifiedPurchase && (
          <span className="text-xs font-medium text-green-700">
            Verified Purchase
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1">Reviewed on {date}</p>

      {text && (
        <p className="mt-3 text-sm text-gray-800 whitespace-pre-line">
          {long && !expanded ? `${text.slice(0, TEXT_LIMIT).trimEnd()}…` : text}
          {long && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="ml-1 text-blue-700 hover:underline"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </p>
      )}

      {review.images.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {review.images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => onOpen(review.images, i)}
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100 border focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
              aria-label={`Open photo ${i + 1} by ${review.customerName}`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </article>
  );
}

/* ---------- Lightbox ---------- */

function LightboxView({
  state,
  onChange,
  onClose,
}: {
  state: NonNullable<Lightbox>;
  onChange: (i: number) => void;
  onClose: () => void;
}) {
  const { urls, index } = state;
  const touchX = useRef<number | null>(null);
  const prev = useCallback(
    () => onChange((index - 1 + urls.length) % urls.length),
    [index, urls.length, onChange],
  );
  const next = useCallback(
    () => onChange((index + 1) % urls.length),
    [index, urls.length, onChange],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Customer photo"
      className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null || urls.length < 2) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20"
      >
        ✕
      </button>

      {urls.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous photo"
            className="absolute left-3 sm:left-6 hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white text-xl hover:bg-white/20"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Next photo"
            className="absolute right-3 sm:right-6 hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white text-xl hover:bg-white/20"
          >
            ›
          </button>
        </>
      )}

      <div
        className="relative w-full max-w-sm h-[80vh] h-[80dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={urls[index]}
          alt="Customer review photo"
          fill
          sizes="100vw"
          className="object-contain"
        />
      </div>

      {urls.length > 1 && (
        <p className="absolute bottom-4 text-sm text-white/80">
          {index + 1} / {urls.length}
        </p>
      )}
    </div>
  );
}

/* ---------- Page ---------- */

export default function ReviewsPage({ shoeId }: { shoeId?: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [sort, setSort] = useState<Sort>("recent");
  const [filter, setFilter] = useState<number | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [lightbox, setLightbox] = useState<Lightbox>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await client.fetch<any[]>(
        `*[_type == "review" && isApproved == true
            ${shoeId ? "&& shoe._ref == $shoeId" : ""}]
          | order(createdAt desc) {
            _id,
            customerName,
            rating,
            reviewText,
            isVerifiedPurchase,
            createdAt,
            "images": reviewImages[].asset->url
          }`,
        shoeId ? { shoeId } : {},
      );
      setReviews(
        data.map((r) => ({
          ...r,
          images: (r.images ?? []).filter(Boolean),
        })),
      );
    } catch (e) {
      console.error("Error fetching reviews:", e);
      setError("Could not load reviews. Try again.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [shoeId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [sort, filter]);

  const list = useMemo(() => {
    const base = filter ? reviews.filter((r) => r.rating === filter) : reviews;
    const sorted = [...base];
    if (sort === "high") sorted.sort((a, b) => b.rating - a.rating);
    if (sort === "low") sorted.sort((a, b) => a.rating - b.rating);
    return sorted;
  }, [reviews, sort, filter]);

  const openLightbox = useCallback(
    (urls: string[], index: number) => setLightbox({ urls, index }),
    [],
  );
  const closeLightbox = useCallback(() => setLightbox(null), []);

  if (loading) {
    return (
      <section className="py-24 flex flex-col items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
        <p className="mt-3 text-gray-600 text-sm">Loading reviews…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 flex flex-col items-center px-4 text-center">
        <p className="text-gray-800">{error}</p>
        <button
          type="button"
          onClick={load}
          className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          Try again
        </button>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className="py-24 flex flex-col items-center px-4 text-center">
        <p className="text-lg font-medium text-gray-800">No reviews yet</p>
        <p className="text-sm text-gray-500 mt-1 mb-5">
          Be the first to review.
        </p>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          Write a review
        </button>
        {showForm && (
          <ReviewForm shoeId={shoeId} onClose={() => setShowForm(false)} />
        )}
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 pt-16 sm:pt-20">
      <div className="grid gap-8 lg:gap-10 lg:grid-cols-[320px_minmax(0,1fr)] ">
        <Summary
          reviews={reviews}
          filter={filter}
          onFilter={setFilter}
          onWrite={() => setShowForm(true)}
        />

        <div>
          <PhotoStrip reviews={reviews} onOpen={openLightbox} />

          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b pb-3">
            <h3 className="text-lg font-semibold">
              {filter ? `${filter}-star reviews` : "Top reviews"}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({list.length})
              </span>
            </h3>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="border rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="recent">Most recent</option>
                <option value="high">Highest rated</option>
                <option value="low">Lowest rated</option>
              </select>
            </label>
          </div>

          {list.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">
              No reviews match this filter.
            </p>
          ) : (
            <div>
              {list.slice(0, visible).map((r) => (
                <ReviewItem key={r._id} review={r} onOpen={openLightbox} />
              ))}
            </div>
          )}

          {visible < list.length && (
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="mt-4 w-full py-2.5 rounded-lg border border-gray-400 text-sm font-medium hover:bg-gray-50"
            >
              See more reviews
            </button>
          )}
        </div>
      </div>

      {lightbox && (
        <LightboxView
          state={lightbox}
          onChange={(i) => setLightbox((s) => (s ? { ...s, index: i } : s))}
          onClose={closeLightbox}
        />
      )}

      {showForm && (
        <ReviewForm shoeId={shoeId} onClose={() => setShowForm(false)} />
      )}
    </section>
  );
}
