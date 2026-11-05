"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/* Close the popover menu when any link inside it is clicked (works even for same-route clicks). */
export function MenuCloser() {
  useEffect(() => {
    const menu = document.getElementById("menu");
    const onClick = (e: Event) => {
      if ((e.target as Element).closest("a")) menu?.hidePopover();
    };
    menu?.addEventListener("click", onClick);
    return () => menu?.removeEventListener("click", onClick);
  }, []);
  return null;
}

/* Route gate: children stay server-rendered, only the pathname check runs on the client. */
export function HideOn({ routes, children }: { routes: string[]; children: ReactNode }) {
  const path = usePathname() ?? "";
  return routes.some((r) => path === r || path.startsWith(`${r}/`)) ? null : children;
}

export const SaleGate = ({ children }: { children: ReactNode }) => (
  <HideOn routes={["/offer", "/checkout", "/cart", "/order"]}>{children}</HideOn>
);

/* Only these three numbers re-render each second, and it rolls over daily at 00:00 UTC. */
const pad = (n: number) => String(n).padStart(2, "0");

export function Countdown() {
  const [s, setS] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setS(86400 - Math.floor((Date.now() % 86400000) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const v = s === null ? ["--", "--", "--"] : [pad((s / 3600) | 0), pad(((s % 3600) / 60) | 0), pad(s % 60)];

  return (
    <div className="relative z-10 flex gap-2">
      {["H", "M", "S"].map((l, i) => (
        <div key={l} className="min-w-[50px] rounded-lg bg-white/20 p-2 text-center">
          <div className="text-lg font-bold tabular-nums">{v[i]}</div>
          <div className="text-xs opacity-90">{l}</div>
        </div>
      ))}
    </div>
  );
}