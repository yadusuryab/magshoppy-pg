"use client";
import { useState } from "react";
import Image from "next/image";

interface ProductCarouselProps {
  images: Array<{ url: string; thumbnail?: string }>;
  productName: string;
}

export default function ProductCarousel({ images, productName }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images?.length) {
    return (
      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
        <span className="text-muted-foreground">No Image</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={images[currentIndex]?.url || "/placeholder-image.jpg"}
          alt={`${productName} - Image ${currentIndex + 1}`}
          width={600}
          height={600}
          className="w-full h-full object-cover"
          priority={currentIndex === 0} // Only priority load first image
          loading={currentIndex === 0 ? "eager" : "lazy"}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
          }}
        />
      </div>

      {/* Thumbnails - Limited to 4 */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.slice(0, 4).map((image, index) => (
            <button
              key={index}
              className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                currentIndex === index ? "border-primary" : "border-transparent"
              }`}
              onClick={() => setCurrentIndex(index)}
            >
              <Image
                src={image.thumbnail || image.url}
                alt={`Thumbnail ${index + 1}`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}