import Image from "next/image";
import { getProductImageUrl } from "@/lib/checkout-utils";

export function ProductImage({
  product,
  alt,
  borderClass,
}: {
  product: any;
  alt: string;
  borderClass: string;
}) {
  return (
    <div
      className={`aspect-square bg-gr rounded-xl overflow-hidden border-2 ${borderClass}`}
    >
      <Image
        src={getProductImageUrl(product)}
        alt={alt}
        width={200}
        height={200}
        quality={50}
        className="w-full h-full object-cover"
        loading="eager"
      />
    </div>
  );
}