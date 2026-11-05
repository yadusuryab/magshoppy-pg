// components/CartItem.tsx
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trash2, Gift, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface CartItemProps {
  item: {
    _id: string;
    productName: string;
    shoeBrand: string;
    images: { asset: { url: string } }[];
    offerPrice?: number;
    price: number;
    selectedSize?: number;
    freeProduct?: {
      _id: string;
      productName: string;
      shoeBrand: string;
      images: { asset: { url: string } }[];
      selectedSize?: number;
    } | null;
  };
  onRemove?: any;
}

export default function CartItem({ item, onRemove }: CartItemProps) {
  const hasDiscount = item.offerPrice && item.offerPrice < item.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((item.price - item.offerPrice!) / item.price) * 100)
    : 0;

  return (
    <Card className="overflow-hidden border-l-4 border-l-primary">
      <div className="relative">
        {/* Main Product */}
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Product Image */}
            <Link 
              href={`/p/${item._id}`}
              className="flex-shrink-0 relative w-20 h-20 rounded-lg border bg-muted overflow-hidden group"
            >
              <Image
                src={item.images[0]?.asset.url || "/placeholder.svg"}
                alt={item.productName}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
            </Link>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <Link href={`/p/${item._id}`}>
                    <h3 className="font-semibold text-base hover:text-primary transition-colors line-clamp-2">
                      {item.productName}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.shoeBrand}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    {item.selectedSize && (
                      <Badge variant="outline" className="text-xs">
                        Size: {item.selectedSize}
                      </Badge>
                    )}
                    {hasDiscount && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                        Save {discountPercentage}%
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="flex flex-col items-end gap-2">
                  {/* <div className="text-right">
                    {hasDiscount ? (
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-lg">₹{item.offerPrice}</span>
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{item.price}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-lg">₹{item.price}</span>
                    )}
                  </div> */}
                  
                  {onRemove && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={onRemove}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Free Product */}
        {item.freeProduct && (
          <div className="border-t bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Free Product Image */}
                <Link 
                  href={`/p/${item.freeProduct._id}`}
                  className="flex-shrink-0 relative w-20 h-20 rounded-lg border-2 border-dashed border-green-300 bg-green-100 overflow-hidden group"
                >
                  <Image
                    src={item.freeProduct.images[0]?.asset.url || "/placeholder.svg"}
                    alt={item.freeProduct.productName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-green-600/0 group-hover:bg-green-600/10 transition-colors duration-200" />
                  
                  {/* Free Badge */}
                  <Badge className="absolute -top-2   -right-2 bg-green-600 text-white border-0 shadow-sm">
                    FREE
                  </Badge>
                </Link>

                {/* Free Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Gift className="h-4 w-4 text-green-600" />
                        <Link href={`/p/${item.freeProduct._id}`}>
                          <h3 className="font-semibold text-base text-green-800 hover:text-green-600 transition-colors line-clamp-2">
                            {item.freeProduct.productName}
                          </h3>
                        </Link>
                      </div>
                      <p className="text-sm text-green-600">
                        {item.freeProduct.shoeBrand}
                      </p>
                      
                      <div className="flex items-center gap-3 mt-2">
                        {item.freeProduct.selectedSize && (
                          <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                            Size: {item.freeProduct.selectedSize}
                          </Badge>
                        )}
                        {/* <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          COMPLIMENTARY
                        </Badge> */}
                      </div>
                    </div>

                    {/* Free Product Price */}
                    {/* <div className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-lg text-green-600">₹0</span>
                        <span className="text-sm text-green-500">Free Gift</span>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {/* <div className="border-t bg-muted/50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between text-xs">
            <Link 
              href={`/p/${item._id}`}
              className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              View product details
            </Link>
            
            {item.freeProduct && (
              <div className="flex items-center gap-1 text-green-600">
                <Gift className="h-3 w-3" />
                <span>Buy One Get One Free</span>
              </div>
            )}
          </div>
        </CardContent>
      </div> */}
    </Card>
  );
}