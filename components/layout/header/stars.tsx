export function Stars({ n = 6 }: { n?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden">
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className="absolute -bottom-2 size-1 animate-star-rise rounded-full bg-white/60 shadow-[0_0_6px_#fffc]"
          style={{
            left: `${(i * 37) % 100}%`,
            animationDelay: `${(i * 0.8) % 5}s`,
            animationDuration: `${4 + ((i * 1.3) % 4)}s`,
          }}
        />
      ))}
    </div>
  );
}