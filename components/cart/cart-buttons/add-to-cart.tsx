"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingBag, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAllShoes } from "@/lib/vehicleQueries";
import { Label } from "@/components/ui/label";
import ProductCard from "@/components/product/product-card";
import SHeading from "@/components/utils/section-heading";
import { Badge } from "@/components/ui/badge";

interface Product {
  _id: string;
  productName: string;
  price: number;
  offerPrice?: number;
  buyOneGetOne?: boolean;
  sizes: string[];
  images: { asset: { url: string } }[];
}

interface AddToCartButtonProps {
  product: Product;
  iconOnly?: boolean;
}

export default function AddToCartButton({
  product,
  iconOnly = false,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [isInCart, setIsInCart] = useState(false);
  const [bogoProducts, setBogoProducts] = useState<Product[]>([]);
  const [isBogoModalOpen, setIsBogoModalOpen] = useState(false);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [selectedFreeProduct, setSelectedFreeProduct] = useState<Product | any>(
    null
  );
  const [selectedSize, setSelectedSize] = useState<string | any>(null);
  const [selectedFreeProductSize, setSelectedFreeProductSize] = useState<
    string | any
  >(null);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setIsInCart(cart.some((item: any) => item._id === product._id));

    const fetchBogoProducts = async () => {
      try {
        const allProducts: any = await getAllShoes();
        const bogoItems = allProducts.filter(
          (item: Product) => item.buyOneGetOne
        );
        setBogoProducts(bogoItems);
      } catch (error) {
        console.error("Error fetching BOGO products:", error);
      }
    };

    fetchBogoProducts();
  }, [product._id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();

    if (product.buyOneGetOne && bogoProducts.length > 0) {
      setIsBogoModalOpen(true);
    } else if (product.sizes.length > 0) {
      setIsSizeModalOpen(true);
    } else {
      addToCart(product, null);
    }
  };

  const confirmBogoSelection = () => {
    setIsBogoModalOpen(false);
    setIsSizeModalOpen(true);
  };

  const confirmSizeSelection = () => {
    if (!selectedSize) {
      alert("Please select a size for the main product.");
      return;
    }

    if (selectedFreeProduct && !selectedFreeProductSize) {
      alert("Please select a size for the free product.");
      return;
    }

    addToCart(
      product,
      selectedSize,
      selectedFreeProduct,
      selectedFreeProductSize
    );
    setIsSizeModalOpen(false);
    router.push("/checkout");
  };

  const addToCart = (
    item: Product,
    size: string | null,
    freeProduct?: Product | null,
    freeProductSize?: string | null
  ) => {
    const cartItem = {
      ...item,
      selectedSize: size,
      freeProduct: freeProduct
        ? { ...freeProduct, selectedSize: freeProductSize }
        : null,
    };

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const updatedCart = [...cart, cartItem];
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setIsInCart(true);
  };

  return (
    <>
      {isInCart ? (
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => router.push("/checkout")}
        >
          {iconOnly ? (
            <CheckCircle />
          ) : (
            <>
              <CheckCircle /> View in Cart
            </>
          )}
        </Button>
      ) : (
        <Button
          onClick={handleAddToCart}
          className="w-full"
          size={iconOnly ? "icon" : undefined}
        >
          {iconOnly ? (
            <ShoppingBag />
          ) : (
            <>
              <ShoppingBag /> Add to Cart
            </>
          )}
        </Button>
      )}

      {/* BOGO Offer Selection Modal */}
      <Dialog open={isBogoModalOpen} onOpenChange={setIsBogoModalOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select a Free Product</DialogTitle>
          </DialogHeader>
          <div className="flex w-full gap-4 max-h-screen overflow-x-auto flex-nowrap">
            {bogoProducts.map((bogoProduct) => (
              <ProductCard
                product={bogoProduct}
                noLink={true}
                key={bogoProduct._id}
                className={`p-4  border-4 cursor-pointer rounded-lg min-w-80 ${
                  selectedFreeProduct?._id === bogoProduct._id
                    ? "border-main border-4"
                    : ""
                }`}
                onClick={() => setSelectedFreeProduct(bogoProduct)}
              />
            ))}
          </div>
          <Button
            onClick={confirmBogoSelection}
            className="w-full mt-4"
            disabled={!selectedFreeProduct}
          >
            Confirm Selection
          </Button>
        </DialogContent>
      </Dialog>

      {/* Size Selection Modal */}
      <Dialog open={isSizeModalOpen} onOpenChange={setIsSizeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <SHeading
                title="Congratulations! Get A Free Shoe."
                description="Select your Free shoe from below."
                nolink={true}
              />
            </DialogTitle>
          </DialogHeader>

          {/* Main Product Size Selection */}
          <Label>Select Size for {product.productName}</Label>
          <div className="flex gap-2">
            {product.sizes.map((size: string) => (
              <Button
                key={size}
                variant={selectedSize === size ? "default" : "secondary"}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </Button>
            ))}
          </div>

          {/* Free Product Size Selection */}
          {selectedFreeProduct && (
            <>
              <Label className="mt-4">
                Select Size for {selectedFreeProduct.productName}&nbsp;
                <Badge variant={"secondary"}>Free Product</Badge>
              </Label>
              <div className="flex gap-2">
                {selectedFreeProduct.sizes.map((size: string) => (
                  <Button
                    key={size}
                    variant={
                      selectedFreeProductSize === size ? "default" : "secondary"
                    }
                    onClick={() => setSelectedFreeProductSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </>
          )}

          <Button
            onClick={confirmSizeSelection}
            className="w-full mt-4"
            disabled={
              !selectedSize || (selectedFreeProduct && !selectedFreeProductSize)
            }
          >
            Confirm & Go to Cart
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
