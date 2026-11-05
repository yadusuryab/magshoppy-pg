import Image from "next/image";
import Link from "next/link";
import { IconArrowUpRight, IconPencil } from "@tabler/icons-react";

// Two overlapping screenshots, fanned out, centered on the spotlight.
const shots = [
  "absolute left-1/2 top-2 -translate-x-[88%] -rotate-6 group-hover:-translate-x-[94%] group-hover:-rotate-[9deg]",
  "absolute left-1/2 top-9 -translate-x-[12%] rotate-6 group-hover:-translate-x-[6%] group-hover:rotate-[9deg]",
];

// Abstract emerald / teal mesh with a yellow flare. Same technique as the
// order-tracking card, different palette, and nothing like the hero's amber-on-black.
// Static radial gradients only: paints once, zero runtime cost.
const mesh = {
  backgroundColor: "#065f46",
  backgroundImage: [
    "radial-gradient(40% 32% at 50% 26%, rgba(255,255,255,0.22) 0%, transparent 70%)",
    "radial-gradient(60% 80% at 0% 0%, #10b981 0%, transparent 60%)",
    "radial-gradient(55% 75% at 100% 5%, #2dd4bf 0%, transparent 60%)",
    "radial-gradient(60% 70% at 95% 100%, #facc15 0%, transparent 62%)",
    "radial-gradient(65% 80% at 5% 100%, #0f766e 0%, transparent 60%)",
  ].join(","),
};

const ring =
  "pointer-events-none absolute left-1/2 top-[124px] -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border";

// Server component, one <a> for the whole card (no nested links or buttons).
export function ReviewsBento() {
  return (
    <Link
      href="/reviews"
      aria-label="Happy customers — read reviews or write a review"
      style={mesh}
      className="group relative isolate block w-full overflow-hidden rounded-3xl p-5 text-white shadow-xl shadow-emerald-900/30 ring-1 ring-white/25 transition-shadow duration-300 [contain:paint] hover:shadow-2xl hover:shadow-emerald-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      {/* Circle effect */}
      <span aria-hidden className={`${ring} size-56 border-white/30`} />
      <span aria-hidden className={`${ring} size-80 border-white/20`} />
      <span aria-hidden className={`${ring} size-[28rem] border-white/[0.12]`} />

      {/* Top row */}
      <div className="relative flex items-center justify-between">
        <span className="flex items-center gap-2 rounded-lg bg-black/25 py-1.5 pl-3 pr-3.5 text-xs font-medium">
          <span className="size-1.5 rounded-full bg-white" />
          <span
            role="img"
            aria-label="5 out of 5 stars"
            className="leading-none tracking-wider text-amber-300"
          >
            ★★★★★
          </span>
        </span>
        <span className="grid size-9 place-items-center rounded-full bg-black/25 text-white transition-colors group-hover:bg-black/35">
          <IconPencil className="size-4" stroke={1.75} />
          <span className="sr-only">Write a review</span>
        </span>
      </div>

      {/* Screenshot stage: fixed height, no layout shift */}
      <div className="relative mx-auto mt-2 h-[216px] w-full max-w-[280px]">
        {shots.map((pos, i) => (
          <div
            key={i}
            className={`${pos} aspect-[9/16] w-[104px] overflow-hidden rounded-2xl shadow-2xl shadow-black/40 ring-1 ring-white/30 transition-transform duration-500 ease-out will-change-transform`}
          >
            <Image
              src={`/reviews/${i + 1}-96.avif`}
              alt="Customer review"
              fill
              sizes="104px"
              quality={60}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Copy */}
      <div className="relative mt-4">
        <h3 className="text-[40px] font-bold leading-[1.02] tracking-tighter">
          Happy
          <br />
          <span className="text-white/60">Customers.</span>
        </h3>
        <p className="mt-3 text-sm leading-snug text-white/85">
          Real reviews from real people.
        </p>
      </div>

      {/* CTA */}
      <span className="relative mt-6 flex items-center justify-between rounded-2xl bg-white py-1.5 pl-6 pr-1.5 text-lg font-semibold text-neutral-900 transition-colors group-hover:bg-neutral-100 group-active:scale-[0.99]">
        Read reviews
        <span className="grid size-12 place-items-center rounded-xl bg-neutral-900 text-white">
          <IconArrowUpRight className="size-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </span>
    </Link>
  );
}