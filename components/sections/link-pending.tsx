"use client";

import { useLinkStatus } from "next/link";

// Must be rendered inside a <Link>. Replaces the onClick + isLoading state.
export function LinkPending() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span className="absolute inset-0 grid place-items-center rounded-3xl bg-black/10">
      <span className="grid place-items-center rounded-full bg-white p-2 shadow-lg">
        <span className="size-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </span>
    </span>
  );
}