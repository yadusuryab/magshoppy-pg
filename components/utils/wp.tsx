"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { site } from "@/lib/site-config";

// TODO: replace with your real WhatsApp number, country code first, no + or spaces
const WHATSAPP_NUMBER = site.social.whatsapp || "919656060874"; // Example: "919876543210" for +91 98765 43210
const DEFAULT_MESSAGE = "Hi! I have a question about my order.";
const BUSINESS_NAME = "Support";
const REPLY_TIME = "Typically replies within an hour";

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.02 3C9.37 3 3.98 8.39 3.98 15.04c0 2.22.6 4.37 1.74 6.27L3 29l7.86-2.66a12.02 12.02 0 0 0 5.16 1.16h.01c6.65 0 12.04-5.39 12.04-12.04C28.06 8.4 22.67 3 16.02 3Zm0 21.99h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-4.67 1.58 1.56-4.55-.24-.37a9.9 9.9 0 0 1-1.52-5.28C5.73 9.46 10.35 4.85 16.02 4.85c2.7 0 5.24 1.05 7.15 2.96a10.05 10.05 0 0 1 2.96 7.14c0 5.68-4.62 10.04-10.11 10.04Zm5.54-7.53c-.3-.15-1.79-.88-2.07-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.96 1.18-.18.2-.35.22-.65.07-.3-.15-1.28-.47-2.43-1.5-.9-.8-1.51-1.79-1.68-2.09-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.64-.93-2.24-.24-.58-.49-.5-.68-.51-.18-.01-.38-.01-.58-.01-.2 0-.53.08-.8.38-.28.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.79-.73 2.04-1.44.25-.7.25-1.31.18-1.44-.07-.13-.28-.2-.58-.35Z"
      />
    </svg>
  );
}

export function WhatsAppButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (open && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          ref={panelRef}
          className="w-[300px] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-center justify-between bg-[#075E54] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <WhatsAppGlyph className="h-5 w-5 text-white" />
              </span>
              <div>
                <p className="text-sm font-medium text-white">{BUSINESS_NAME}</p>
                <p className="text-xs text-white/70">{REPLY_TIME}</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-white/70 transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="bg-[#E5F5EF] px-4 py-4">
            <div className="rounded-xl rounded-tl-none bg-white px-3 py-2 text-sm text-[#1B2733] shadow-sm">
              Hi there 👋 How can we help?
            </div>
          </div>

          <div className="flex flex-col gap-2 px-4 pb-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="resize-none rounded-lg border border-black/10 px-3 py-2 text-sm text-[#1B2733] outline-none focus:border-[#25D366]"
            />
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg bg-[#25D366] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#20b859]"
            >
              <WhatsAppGlyph className="h-4 w-4" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close WhatsApp chat" : "Open WhatsApp chat"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95"
      >
        {open ? <X className="h-6 w-6" /> : <WhatsAppGlyph className="h-7 w-7" />}
      </button>
    </div>
  );
}