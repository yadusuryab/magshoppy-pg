import Link from "next/link";
import { IconArrowUpRight, IconSearch } from "@tabler/icons-react";

const mesh = {
  backgroundColor: "#4f46e5",
  backgroundImage: [
    "radial-gradient(60% 90% at 0% 0%, #22d3ee 0%, transparent 60%)",
    "radial-gradient(55% 80% at 100% 10%, #e879f9 0%, transparent 60%)",
    "radial-gradient(70% 90% at 90% 100%, #fb923c 0%, transparent 60%)",
    "radial-gradient(60% 80% at 10% 100%, #7c3aed 0%, transparent 60%)",
  ].join(","),
};

export function OrderTrackCTA() {
  return (
    <div className="mx-auto w-full md:max-w-[420px]">
      <Link
        href="/order/track"
        aria-label="Track your order — live status and delivery estimate"
        style={mesh}
        className="group relative block overflow-hidden rounded-3xl p-3 text-white shadow-xl shadow-indigo-500/30 ring-1 ring-white/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-indigo-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        {/* Header row */}
        <div className="relative flex items-center gap-3 px-2 pt-2">
          <div className="min-w-0 flex-1">
            <p className="text-xl font-bold leading-tight tracking-tight">
              Where&apos;s my order?
            </p>
            <p className="mt-0.5 text-xs leading-snug text-white/80">
              Live status and delivery estimate.
            </p>
          </div>

          <span className="flex items-center gap-1.5 rounded-lg bg-black/25 py-1.5 pl-2.5 pr-3 text-[11px] font-semibold backdrop-blur">
            <span className="size-1.5 animate-pulse rounded-xl bg-white" />
            Live
          </span>
        </div>

        {/* Search-style action */}
        <span className="relative mt-4 flex items-center justify-between rounded-2xl bg-black/25 py-1.5 pl-4 pr-1.5 ring-1 ring-white/20 backdrop-blur transition-colors group-hover:bg-black/35">
          <span className="flex items-center gap-2.5 text-sm text-white/70">
            <IconSearch className="size-4" stroke={1.75} />
            Enter your order ID
          </span>
          <span className="flex items-center gap-2 rounded-xl bg-white py-2.5 pl-4 pr-3 text-sm font-semibold text-neutral-900 transition-colors group-hover:bg-neutral-100">
            Track
            <IconArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </span>
      </Link>
    </div>
  );
}