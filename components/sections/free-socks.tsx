import Image from "next/image";

const SPARKS = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  animationDelay: `${(i * 0.45) % 5}s`,
  animationDuration: `${4 + ((i * 1.3) % 4)}s`,
}));

export function FreeSocksPromo() {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#D4AF37] bg-gradient-to-t from-red-500 via-red-600 to-orange-500 text-white shadow-[0_0_20px_rgba(212,175,55,0.35)] transition-transform duration-300 hover:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:scale-100">
      {/* glow blobs */}
      <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-yellow-300/30 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 size-32 rounded-full bg-orange-300/30 blur-2xl" />

      {/* rising sparks */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden">
        {SPARKS.map((s, i) => (
          <span
            key={i}
            style={s}
            className="absolute bottom-[-8px] size-1 animate-star-rise rounded-full bg-yellow-100 opacity-70 shadow-[0_0_6px_rgba(255,220,120,0.9)]"
          />
        ))}
      </div>

      <div className="relative flex items-center gap-4 p-3">
        <div className="relative shrink-0">
          <Image
            src="/promo/2-100.avif"
            alt="Flame socks"
            width={96}
            height={96}
            className="size-24 rounded-xl border-2 border-[#D4AF37] object-cover shadow-[0_0_14px_rgba(212,175,55,0.5)]"
          />
          <span
            aria-hidden
            className="absolute -left-2 -top-2 grid size-7 animate-pulse place-items-center rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 shadow-lg motion-reduce:animate-none"
          >
            <svg viewBox="0 0 24 24" className="size-4 text-red-700" fill="currentColor">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <span className="mb-1.5 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold text-yellow-200">
            🎁 Free gift
          </span>
          <p className="text-2xl font-black leading-[1.05] tracking-tighter drop-shadow">
            Free <span className="text-yellow-300">Flame Socks</span> on every order
          </p>
        </div>
      </div>

      {/* bottom strip */}
      <p className="relative bg-white/15 py-1.5 text-center text-sm font-bold tracking-tight">
        Exclusive offer
      </p>
    </div>
  );
}