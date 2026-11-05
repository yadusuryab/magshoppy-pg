import { site } from "@/lib/site-config";

export default function Brand({ small = false, className = "" }: { small?: boolean; className?: string }) {
  const size = small ? 56 : 110;
  return (
    <div className={className}>
      {/* SVGs skip next/image optimisation anyway, so a plain <img> is the lightest option */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-56.avif"
        width={size}
        height={size}
        alt={site.name}
        className="max-w-full object-contain"
        fetchPriority="high"
        decoding="async"
      />
    </div>
  );
}