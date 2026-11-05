"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Clapperboard,
  PackageOpen,
  BadgeCheck,
  ShoppingBag,
} from "lucide-react";

interface ShopVideoProps {
  src?: string;
  poster?: string;
  onShopNow?: () => void;
}

const HIGHLIGHTS = [
  { icon: PackageOpen, label: "ALL INDIA DELIVERY" },
  { icon: BadgeCheck, label: "PREMIUM" },
];

const formatTime = (s: number) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export function ShopVideo({
  src = "/v2.webm",
  poster = "/v2-110.avif",
  onShopNow,
}: ShopVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(true); // muted start = autoplay always works
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSoundHint, setShowSoundHint] = useState(true);

  const closeModal = useCallback(() => {
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
    setProgress(0);
    setPlaying(false);
    setOpen(false);
  }, []);

  // Lock scroll + focus close button + Esc (only while open)
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === " " && document.activeElement?.tagName !== "BUTTON") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, closeModal]);

  // Start playback on open
  useEffect(() => {
    const v = videoRef.current;
    if (!open || !v) return;
    v.muted = muted;
    v.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    setShowSoundHint(false);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration;
  };

  const handleShopNow = () => {
    closeModal();
    onShopNow?.();
  };

  return (
    <>
      {/* ================= CARD ================= */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Watch shop video"
        className="group relative p-2 block w-full overflow-hidden rounded-2xl border border-[#D4AF37]/60 bg-gradient-to-r from-purple-500 via-blue-500 to-violet-700 text-left transition-all duration-300 hover:border-[#D4AF37] hover:shadow-[0_0_28px_rgba(212,175,55,0.35)] active:scale-[0.99]"
      >
        {/* Background FX */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl transition-all duration-[5000ms] group-hover:translate-x-20 group-hover:translate-y-10" />
          <div className="absolute -bottom-24 -right-20 h-56 w-56 rounded-full bg-fuchsia-400/25 blur-3xl transition-all duration-[6000ms] group-hover:-translate-x-16 group-hover:-translate-y-10" />
          <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.4)_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        <div className="relative flex items-center">
          {/* Text */}
          <div className="z-10 flex flex-1 flex-col gap-2.5 ">
            <span className="flex w-fit items-center gap-1.5 rounded-md border border-white/15 bg-black/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
              <Clapperboard className="size-3 text-white" />
              Shop Video : 0:28 sec
            </span>

            <h3 className="text-lg font-bold leading-tight max-w-[240px] tracking-tight text-white md:text-">
              See the real process
        
              behind our products.
            </h3>

            <p className="max-w-[240px] font-semibold text-xs leading-relaxed text-white/75 md:te">
              Watch our shop video to see how we craft our products with care
            </p>

            {/* Highlights */}
            <div className="flex flex-wrap gap-1.5">
              {HIGHLIGHTS.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[10px] font-semibold text-white/85"
                >
                  <Icon className="size-3 text-emerald-300" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Thumbnail */}
          <div className="relative  h-[200px] w-[120PX] shrink-0 overflow-hidden rounded-xl border border-white/20 shadow-2xl  md:h-[170px] md:w-[108px]">
            <Image
              src={poster}
              alt="Shop video preview"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="110px"
            />
            <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/10" />

            {/* Pulsing play */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="absolute h-12 w-12 animate-ping rounded-full bg-white/40" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-xl transition-transform duration-300 group-hover:scale-110">
                <Play className="ml-0.5 size-5 fill-black" />
              </div>
            </div>

            <div className="absolute bottom-2 left-2 right-2 rounded-full  px-2 py-1 text-center text-[9px] font-bold uppercase  text-white backdrop-blur-sm saturate-200">
              Tap to watch
            </div>
          </div>
        </div>
      </button>

      {/* ================= MODAL ================= */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Shop video"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          onClick={closeModal}
        >
          <button
            ref={closeBtnRef}
            onClick={closeModal}
            aria-label="Close video"
            className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-xl transition hover:scale-105 hover:bg-white/20"
          >
            <X className="size-5" />
          </button>

          <div
            className="relative h-[85vh] max-h-[850px] w-full max-w-[420px] overflow-hidden rounded-[2rem] bg-black shadow-[0_30px_100px_rgba(0,0,0,0.7)] ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              loop
              muted
              playsInline
              preload="metadata"
              onClick={togglePlay}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                setProgress(
                  v.duration ? (v.currentTime / v.duration) * 100 : 0,
                );
              }}
              className="h-full w-full cursor-pointer object-cover"
            />

            {/* Gradients */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />

            {/* Top label */}
            <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xl">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
              Shop Video
            </div>

            {/* Paused indicator */}
            {!playing && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-black shadow-2xl">
                  <Play className="ml-1 size-7 fill-black" />
                </div>
              </div>
            )}

            {/* Sound hint */}
            {muted && showSoundHint && (
              <button
                onClick={toggleMute}
                className="absolute left-1/2 top-16 -translate-x-1/2 animate-bounce rounded-full bg-white px-4 py-2 text-xs font-bold text-black shadow-xl"
              >
                🔊 Tap for sound
              </button>
            )}

            {/* Bottom controls */}
            <div className="absolute inset-x-0 bottom-0 space-y-3 p-4">
              {/* Progress */}
              <div className="flex items-center gap-2 text-[10px] font-medium text-white/80">
                <span className="w-8 tabular-nums">
                  {formatTime((progress / 100) * duration)}
                </span>
                <div
                  onClick={seek}
                  className="group/bar relative h-4 flex-1 cursor-pointer"
                >
                  <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/25 transition-all group-hover/bar:h-1.5">
                    <div
                      className="h-full rounded-full bg-[#D4AF37]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <span className="w-8 text-right tabular-nums">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  aria-label={playing ? "Pause video" : "Play video"}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white backdrop-blur-xl transition hover:bg-black/70"
                >
                  {playing ? (
                    <Pause className="size-5" />
                  ) : (
                    <Play className="ml-0.5 size-5" />
                  )}
                </button>

                <button
                  onClick={handleShopNow}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#D4AF37] text-sm font-bold text-black shadow-lg transition hover:brightness-110 active:scale-[0.98]"
                >
                  <ShoppingBag className="size-4" />
                  Shop Now
                </button>

                <button
                  onClick={toggleMute}
                  aria-label={muted ? "Unmute video" : "Mute video"}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white backdrop-blur-xl transition hover:bg-black/70"
                >
                  {muted ? (
                    <VolumeX className="size-5" />
                  ) : (
                    <Volume2 className="size-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
