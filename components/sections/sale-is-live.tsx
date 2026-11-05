import { Countdown, SaleGate } from "../layout/header/menu-closer";
import { Stars } from "../layout/header/stars";

// Server component: static markup ships as HTML; only <Countdown/> hydrates.
export function ProductCardWithSale() {
  return (
    <SaleGate>
      <div className="px-3 pb-3 sm:px-4 sm:pb-4">
        <div className="relative flex items-center justify-between overflow-hidden rounded-xl border border-[#D4AF37] bg-gradient-to-r from-[#007cfd] via-[#19b8fc] to-secondary p-2 pl-3 text-white shadow-[0_0_12px_rgba(212,175,55,0.25)]">
          <Stars />
          <div className="relative z-10 mb-3">
            <div className="text-xl font-semibold">Deal Ends In</div>
            <p className="text-xs font-semibold opacity-50">Don’t miss out.</p>
          </div>
          <Countdown />
        </div>
      </div>
    </SaleGate>
  );
}
