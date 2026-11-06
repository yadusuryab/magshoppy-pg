"use client";

import Link from "next/link";
import Image from "next/image";
import { memo, useEffect, useState } from "react";
import { IconArrowUpRight } from "@tabler/icons-react";

const DURATION = 12 * 3600 + 47 * 60 + 30;
const parts = (s: number) =>
  [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((n) =>
    String(n).padStart(2, "0")
  );

// Concentric rings centred on the sneaker. Borders only, no filters, so they cost nothing to paint.
const ring =
  "pointer-events-none absolute right-[120px] top-[190px] -z-10 translate-x-1/2 -translate-y-1/2 rounded-full border";

// Isolated: only these chips re-render each second, not the whole card.
// Uses a wall-clock deadline so it never drifts or stalls in background tabs.
const Countdown = memo(function Countdown() {
  const [left, setLeft] = useState(DURATION);

  useEffect(() => {
    let end = Date.now() + DURATION * 1000;
    const id = setInterval(() => {
      const s = Math.ceil((end - Date.now()) / 1000);
      if (s <= 0) end = Date.now() + DURATION * 1000;
      setLeft(s <= 0 ? DURATION : s);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-1 text-xs font-semibold tabular-nums" aria-live="off">
      {parts(left).map((p, i) => (
        <span key={i} className="rounded-lg bg-white/10 px-2 py-1.5">
          {p}
        </span>
      ))}
    </div>
  );
});

export function Hero() {
  return (
    <div className="mx-auto w-full md:max-w-[420px]">
      <Link
        href="/offer?price=1499"
        aria-label="2 pairs for ₹1,499, 50% off. Limited time offer. Claim offer"
        className="group relative isolate block overflow-hidden rounded-3xl bg-gradient-to-b from-neutral-900 to-neutral-950 p-5 text-white ring-1 ring-white/10 transition-shadow duration-300 [contain:paint] hover:ring-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        <div className="pointer-events-none absolute -right-16 top-10 -z-10 size-64 rounded-full bg-amber-400/25 blur-3xl" />

        {/* Circle effect */}
        <span aria-hidden className={`${ring} size-56 border-amber-300/25`} />
        <span aria-hidden className={`${ring} size-80 border-amber-300/[0.15]`} />
        <span aria-hidden className={`${ring} size-[28rem] border-amber-300/[0.09]`} />
        <span aria-hidden className={`${ring} size-[38rem] border-amber-300/[0.05]`} />

        {/* Plain wrappers so each transform (hover, enter, float) stays independent */}
        <div className="pointer-events-none absolute -right-24 z-50  -rotate-[30deg] -top-10 w-[360px] transition-transform duration-700 ease-out group-hover:scale-105">
          <div className="hero-enter">
            <div className="hero-float will-change-transform">
              <Image
                src="/sh3.avif"
                alt="Premium sneaker"
                width={400}
                height={400}
                sizes="300px"
                priority
                fetchPriority="high"
                className="h-auto w-full drop-shadow-[0_25px_30px_rgba(0,0,0,0.5)]"
              />
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-between">
          <span className="flex items-center gap-2 rounded-lg bg-white/10 py-1.5 pl-3 pr-3.5 text-xs font-medium">
            <span className="size-1.5 animate-pulse rounded-full bg-amber-400" />
            Flash sale
          </span>
          <Countdown />
        </div>

        <div className="relative mt-10">
          <h1 className="text-[44px] font-bold leading-[1.02] tracking-tighter">
            2 Pairs for
            <br />
            <span className="text-white/40">₹1,499.</span>
          </h1>

          <p className="mt-3 max-w-[230px] text-sm leading-snug text-white/50">
            Click below to claim this limited time offer. Hurry, before it ends!
          </p>

          <div className="mt-8 flex items-center gap-3">
            <span className="rounded-lg bg-amber-400/15 px-2.5 py-1 text-xs font-semibold text-amber-300">
              50% off
            </span>
            <s className="text-sm text-white/40">₹2,999</s>
          </div>

          <span className="mt-4 flex items-center justify-between rounded-2xl bg-amber-400 py-1.5 pl-6 pr-1.5 text-lg font-semibold text-black transition-colors group-hover:bg-amber-300 group-active:scale-[0.99]">
            CLAIM OFFER
            <span className="grid size-12 place-items-center rounded-xl bg-black text-amber-400">
              <IconArrowUpRight className="size-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </span>
        </div>

        <style jsx>{`
          .hero-enter {
            animation: hero-enter 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both;
          }
          .hero-float {
            animation: hero-float 5s ease-in-out infinite;
          }
          @keyframes hero-enter {
            from {
              opacity: 0;
              transform: translate3d(0, 24px, 0) scale(0.92);
            }
          }
          @keyframes hero-float {
            0%,
            100% {
              transform: translate3d(0, 0, 0) rotate(-8deg);
            }
            50% {
              transform: translate3d(0, -10px, 0) rotate(-2deg);
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .hero-enter,
            .hero-float {
              animation: none;
            }
          }
        `}</style>
      </Link>
    </div>
  );
}