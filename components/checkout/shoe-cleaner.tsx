import type { CSSProperties } from "react";
import { SprayCan, Check, Sparkles } from "lucide-react";
import { SHOE_CLEANER_PRICE } from "@/lib/checkout-constants";

// ---- Site design tokens (dark card, amber action, mesh accent) ----

// Bright mesh, used only for the "Popular add-on" badge.
const mesh: CSSProperties = {
  backgroundColor: "#4f46e5",
  backgroundImage: [
    "radial-gradient(60% 90% at 0% 0%, #22d3ee 0%, transparent 60%)",
    "radial-gradient(55% 80% at 100% 10%, #e879f9 0%, transparent 60%)",
    "radial-gradient(70% 90% at 90% 100%, #fb923c 0%, transparent 60%)",
    "radial-gradient(60% 80% at 10% 100%, #7c3aed 0%, transparent 60%)",
  ].join(","),
};

// Dark abstract mesh for the selected card: amber bloom top-right (where the
// check sits), rose bottom-left, violet underglow. Dark enough that white text
// and the amber accents keep full contrast. Static gradients, no blur filters.
const selectedMesh: CSSProperties = {
  backgroundColor: "#0a0a0a",
  backgroundImage: [
    "radial-gradient(55% 130% at 100% 0%, rgba(251,191,36,0.40) 0%, transparent 62%)",
    "radial-gradient(50% 120% at 0% 100%, rgba(244,63,94,0.24) 0%, transparent 66%)",
    "radial-gradient(45% 110% at 55% 125%, rgba(139,92,246,0.28) 0%, transparent 66%)",
  ].join(","),
};

export function ShoeCleanerAddon({
  addShoeCleaner,
  setAddShoeCleaner,
}: {
  addShoeCleaner: boolean;
  setAddShoeCleaner: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={addShoeCleaner}
      onClick={() => setAddShoeCleaner(!addShoeCleaner)}
      style={addShoeCleaner ? selectedMesh : undefined}
      className={`relative flex w-full items-center gap-3 rounded-2xl p-4 pt-5 text-left transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
        addShoeCleaner
          ? "text-white ring-1 ring-white/15"
          : "bg-background ring-1 ring-black/10 hover:ring-black/20"
      }`}
    >
      <span
        style={mesh}
        className="absolute -top-2.5 left-4 flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-white/25"
      >
        <Sparkles className="size-3" />
        Popular add-on
      </span>

      <div
        className={`relative grid size-11 shrink-0 place-items-center rounded-xl transition-colors ${
          addShoeCleaner ? "bg-amber-400 text-black" : "bg-muted text-foreground"
        }`}
      >
        <SprayCan className="size-5" />
      </div>

      <div className="relative min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold tracking-tight">
            Premium Shoe Cleaner
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs line-through ${
                addShoeCleaner ? "text-white/45" : "text-muted-foreground"
              }`}
            >
              ₹199
            </span>
            <span
              className={`text-sm font-bold ${
                addShoeCleaner ? "text-amber-400" : "text-foreground"
              }`}
            >
              ₹{SHOE_CLEANER_PRICE}
            </span>
          </div>
        </div>
        <p
          className={`mt-0.5 text-xs ${
            addShoeCleaner ? "text-white/60" : "text-muted-foreground"
          }`}
        >
          86% of customers add this to their order
        </p>
      </div>

      <div
        className={`relative grid size-5 shrink-0 place-items-center rounded-full transition-colors ${
          addShoeCleaner
            ? "bg-amber-400 text-black"
            : "ring-1 ring-inset ring-black/25"
        }`}
      >
        {addShoeCleaner && <Check className="size-3" strokeWidth={3} />}
      </div>
    </button>
  );
}