import { Metadata } from "next";
import { notFound } from "next/navigation";
import { MessageCircle, PhoneCall } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { urlFor } from "@/sanityClient";
import { Badge } from "@/components/ui/badge";
import { site } from "@/lib/site-config";
import { getShoeById } from "@/lib/vehicleQueries"; // Make sure this is optimized
import ProductCarousel from "@/components/product/product-carousel";
import SHeading from "@/components/utils/section-heading";
import AddToCartButton from "@/components/cart/cart-buttons/add-to-cart";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.

interface ProductProps {
  params: Promise<{ id: string }>;
}

// Optimized metadata generation
export async function generateMetadata({ params }: ProductProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getShoeById(resolvedParams.id);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The product you are looking for does not exist.",
    };
  }

  const { productName, price } = product;
  const ogDescription = `MagShoppy - ₹${price.toLocaleString()}. Buy now!`;

  return {
    title: `MagShoppy - ${site.name}`,
    description: ogDescription,
    openGraph: {
      title: productName,
      description: ogDescription,
      // Remove heavy image processing for metadata
    },
  };
}

// Optimized product page component
export default async function ProductPage({ params }: ProductProps) {
  const resolvedParams = await params;
  const product = await getShoeById(resolvedParams.id);

  if (!product) return notFound();

  // Destructure only what we need
  const { 
    productName, 
    shoeBrand, 
    category, 
    sizes, 
    colorVariants, 
    images, 
    description, 
    madeIn, 
    price, 
    isOffer, 
    offerPrice, 
    buyOneGetOne 
  } = product;

  // Optimized WhatsApp message - minimal content
  const message = `Hi, I want MagShoppy (${category}). Size? ${process.env.NEXT_PUBLIC_BASE_URL}/p/${resolvedParams.id}`;

  return (
    <div className="md:mx-28 mx-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Optimized Product Carousel */}
        <ProductCarousel 
          images={images} 
          productName={productName} 
        />

        {/* Product Details - Minimal re-renders */}
        <div className="space-y-4">
          {/* Product Header */}
          <div>
            {/* <p className="uppercase text-sm font-semibold text-muted-foreground">
              {shoeBrand || site.name}
            </p> */}
            <h1 className="text-xl md:text-2xl font-bold tracking-tighter uppercase">MAGSHOPPY SNEAKERS</h1>
          </div>

          {/* Badges */}
          {/* <div className="flex flex-wrap gap-2 items-center">
            <Badge className="rounded-md text-xs">{category?.toUpperCase()}</Badge>
            <Badge className="rounded-md text-xs" variant={'secondary'}>
              Sizes: {sizes?.join(", ")}
            </Badge>
          </div> */}

          {/* Optimized Price Section */}
          <div>
            {isOffer ? (
              <div className="flex items-center gap-3">
                <p className="font-bold text-xl">₹{offerPrice.toLocaleString("en-IN")}</p>
                <p className="text-lg text-muted-foreground line-through">
                  ₹{price.toLocaleString("en-IN")}
                </p>
                <span className="text-sm font-bold text-green-600">
                  {Math.round(((price - offerPrice) / price) * 100)}% OFF
                </span>
              </div>
            ) : (
              <p className="font-bold text-xl">₹{price.toLocaleString("en-IN")}</p>
            )}
          </div>

          {/* BOGO Badge - Simple */}
          {/* {buyOneGetOne && (
            <Badge variant="default" className="bg-green-600 text-white">
              🎁 Buy 1 Get 1 Free
            </Badge>
          )} */}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-3">
            <Link 
              href={`https://wa.me/${site.phone}?text="Hi magshoppy"`} 
              className="block"
              target="_blank"
              prefetch={false}
            >
              <Button className="w-full text-lg font-bold" variant="outline" size="lg">
                <MessageCircle />
                Whatsapp
              </Button>
            </Link>
            
            {/* <AddToCartButton product={product} /> */}
          </div>

          {/* Additional Details - Collapsible would be better */}
          {/* <div className="space-y-4 text-sm">
            <div>
              <SHeading 
                title="Product Details" 
                nolink={true} 
                size="sm"
              />
              <p className="text-muted-foreground mt-2 line-clamp-3">
                {description || "No description available."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Brand" value={shoeBrand} />
              <DetailItem label="Made In" value={madeIn} />
              <DetailItem label="Sizes" value={sizes?.join(", ")} />
              <DetailItem label="Colors" value={colorVariants?.join(", ")} />
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

// Helper component for consistent detail items
function DetailItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="font-semibold text-muted-foreground text-xs">{label}</p>
      <p className="text-sm">{value || "N/A"}</p>
    </div>
  );
}