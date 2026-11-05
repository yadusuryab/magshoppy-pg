"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Visible placeholder, used before the section scrolls in and while its chunk loads.
export function LazySkeleton({ minHeight = 300 }: { minHeight?: number }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{ minHeight }}
      className="flex w-full animate-pulse flex-col items-center justify-center gap-2 rounded-2xl bg-gray-100 text-sm font-medium text-gray-500"
    >
      <span className="size-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
      Loading…
    </div>
  );
}

export function LazyOnView({
  children,
  minHeight = 300,
  rootMargin = "300px", // start loading 300px before it enters the screen
}: {
  children: ReactNode;
  minHeight?: number;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect(); // load once, then stop observing
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return <div ref={ref}>{visible ? children : <LazySkeleton minHeight={minHeight} />}</div>;
}