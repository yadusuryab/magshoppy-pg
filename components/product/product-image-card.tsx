"use client";
import { useState } from "react";
import Image from "next/image";

interface ProductCardProps {
  product: any;
  className?: string;
  /** Kept so existing callers still type-check; the card never renders a link. */
  noLink?: boolean;
  onClick?: () => void;
}

export default function ProductCard2({ product, className = "", onClick }: ProductCardProps) {
  const { productName, imageUrl, productLabel } = product;
  const [failed, setFailed] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative block aspect-square w-full overflow-hidden rounded-lg bg-neutral-100 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${className}`}
    >
      {productLabel?.slice(0, 2).map((l: string, i: number) => (
        <span
          key={l}
          className={`absolute left-2 z-10 rounded-sm px-1.5 py-0.5 text-[11px] font-bold capitalize ${
            i ? "top-8" : "top-2"
          } ${l === "sale" ? "bg-black text-white" : "bg-white text-black"}`}
        >
          {l.replace(/-/g, " ")}
        </span>
      ))}

      {failed ? (
        <span className="grid size-full place-items-center text-sm text-neutral-400">
          Image not available
        </span>
      ) : (
        <Image
          src={imageUrl || "/placeholder-image.jpg"}
          alt={productName || "Product image"}
          width={280}
          height={280}
          quality={45}
          loading="lazy"
          sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </button>
  );
}