import type { CSSProperties } from "react";
import Link from "next/link";
import { site } from "@/lib/site-config";
import Brand from "../brand/brand";
import { HideOn } from "./header/menu-closer";
import { IconPhoneFilled } from "@tabler/icons-react";

const link = "text-white/60 transition-colors hover:text-white focus-visible:text-white";

// Warm abstract mesh for the contact card: amber base, pale-gold light top-left,
// orange and a touch of rose in the lower right. Light enough that black text
// keeps strong contrast. Static radial gradients only, no blur filters.
const mesh: CSSProperties = {
  backgroundColor: "#fbbf24",
  backgroundImage: [
    "radial-gradient(55% 120% at 0% 0%, #fef3c7 0%, transparent 60%)",
    "radial-gradient(55% 110% at 100% 100%, #fb923c 0%, transparent 62%)",
    "radial-gradient(40% 90% at 100% 0%, rgba(251,113,133,0.55) 0%, transparent 60%)",
    "radial-gradient(50% 100% at 0% 100%, #f59e0b 0%, transparent 60%)",
  ].join(","),
};

// Subtle amber light at the top edge of the footer, so it reads as one piece with the cards above.
const footerGlow: CSSProperties = {
  backgroundImage:
    "radial-gradient(60% 220px at 50% 0%, rgba(251,191,36,0.08), transparent 70%)",
};

// Concentric rings centred on the logo. Borders only, so they cost nothing to paint.
const ring =
  "pointer-events-none absolute left-[56px] top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black";

// Server component: static HTML/CSS. Only the tiny <HideOn/> gate runs on the client.
function Footer() {
  return (
    <HideOn routes={["/checkout"]}>
      <footer
        style={footerGlow}
        className="bg-neutral-950 px-4 pb-8 pt-10 text-white sm:px-6"
      >
        <div
          style={mesh}
          className="relative isolate flex items-center justify-between gap-4 overflow-hidden rounded-3xl p-5 text-black ring-1 ring-black/10"
        >
          <span aria-hidden className={`${ring} size-28 opacity-[0.14]`} />
          <span aria-hidden className={`${ring} size-52 opacity-[0.10]`} />
          <span aria-hidden className={`${ring} size-80 opacity-[0.06]`} />

          <div className="size-14 shrink-0">
            <Brand small />
          </div>

          <div className="flex flex-col items-end gap-2.5 text-right">
            <a
              href={`tel:${site.phone}`}
              className="flex items-center gap-2 rounded-full bg-black py-2 pl-3 pr-4 text-sm font-semibold text-primary transition-transform duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-amber-300"
            >
              <IconPhoneFilled size={16} />
              {site.phone}
            </a>
            {site.address && (
              <p className="max-w-[220px] text-xs font-medium leading-snug text-black/75">
                {site.address}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-sm">
          <nav className="flex gap-6 font-medium">
            <Link href="/privacy-policy" className={link}>
              Privacy
            </Link>
            <Link href="/T&C" className={link}>
              Terms
            </Link>
          </nav>
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </HideOn>
  );
}

export { Footer };