"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useState } from "react";
import { Trash2, ShoppingBag, ArrowRight, Tag, Gift, Truck, Shield, Star, Info, Package, Zap } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import CartItem from "@/components/cart/cart-item";
import SHeading from "@/components/utils/section-heading";

interface CartItem {
  _id: string;
  productName: string;
  shoeBrand: string;
  images: { asset: { url: string } }[];
  offerPrice?: number;
  price: number;
  selectedSize?: number;
  buyOneGetOne: boolean;
  freeProduct?: CartItem | null;
  freeProductSize?: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on page load
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
    setIsLoading(false);
  }, []);

  const removeFromCart = (id: string) => {
    const updatedCart = cartItems.filter((item) => item._id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Calculate total amount
  const calculateTotalAmount = () => 
    cartItems.reduce((total, item) => {
      const productPrice = item.offerPrice || item.price;
      const extraAmount = Math.max(0, productPrice - 999);
      
      let itemTotal = 999 + extraAmount;

      if (item.buyOneGetOne && item.freeProduct) {
        const freeProductPrice = item.freeProduct.price || 999;
        const freeProductExtraAmount = Math.max(0, freeProductPrice - 999);
        itemTotal += freeProductExtraAmount;
      }

      return total + itemTotal;
    }, 0);

  // Calculate total items including free products
  const calculateTotalItems = () => 
    cartItems.reduce((total, item) => total + (item.buyOneGetOne && item.freeProduct ? 2 : 1), 0);

  // Calculate free items count
  const calculateFreeItems = () => 
    cartItems.filter(item => item.buyOneGetOne && item.freeProduct).length;

  // Get product breakdown for the summary
  const getProductBreakdown = () => {
    return cartItems.flatMap((item) => {
      const productPrice = item.offerPrice || item.price;
      const extraAmount = Math.max(0, productPrice - 999);
      
      const items = [{
        name: item.productName,
        type: 'main' ,
        price: 999,
        extraAmount: extraAmount,
        isPremium: extraAmount > 0
      }];

      if (item.buyOneGetOne && item.freeProduct) {
        const freeProductPrice = item.freeProduct.price || 999;
        const freeProductExtraAmount = Math.max(0, freeProductPrice - 999);
        
        items.push({
          name: item.freeProduct.productName,
          type: 'free' as const,
          price: 0,
          extraAmount: freeProductExtraAmount,
          isPremium: freeProductExtraAmount > 0
        });
      }

      return items;
    });
  };

  const hasBOGO = cartItems.some(item => item.buyOneGetOne);
  const productBreakdown = getProductBreakdown();
  const totalBasePrice = cartItems.length * 999;
  const totalExtraAmount = productBreakdown.reduce((total, item) => total + item.extraAmount, 0);

  if (isLoading) {
    return (
      <main className="container mx-auto md:px-16 px-2 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your cart...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto md:px-16 px-2 min-h-screen pb-8">
      {/* <SHeading 
        title="Your Shopping Cart" 
        description="Review your selected items and proceed to checkout"
        nolink
        size="sm"
      /> */}

      {cartItems.length === 0 ? (
        <Card className="max-w-2xl mx-auto text-center">
          <CardContent className="pt-12 pb-12">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Looks like you haven't added any products to your cart yet. Start shopping to find your perfect pair!
            </p>
            <Link href="/">
              <Button size="lg" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                Start Shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8 px-4">
          {/* Cart Items Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Your Items</h2>
                <p className="text-muted-foreground text-sm">
                  {calculateTotalItems()} item{calculateTotalItems() !== 1 ? 's' : ''} in your cart
                  {/* {calculateFreeItems() > 0 && (
                    <span className="text-green-600 ml-2">
                      ({calculateFreeItems()} free)
                    </span>
                  )} */}
                </p>
              </div>
              {/* <Badge variant="secondary" className="text-sm">
                {cartItems.length} Paid Product{cartItems.length !== 1 ? 's' : ''}
              </Badge> */}
            </div>

            {/* Cart Items List */}
            <div className="space-y-4">
              {cartItems.map((item: any, index) => (
                <CartItem
                  key={`${item._id}-${index}`}
                  item={item}
                  onRemove={() => removeFromCart(item._id)}
                />
              ))}
            </div>

            {/* Continue Shopping */}
            {/* <Card>
              <CardContent className="p-2">
                <div className="flex items-center justify-around">
                  <div>
                    <h3 className="font-semibold xs">Need more items?</h3>
                    <p className="text-xs text-muted-foreground">
                      Continue shopping to add more products to your order
                    </p>
                  </div>
                  <Link href="/">
                    <Button variant="outline" size={'sm'} className="text-xs">
                      <ShoppingBag />
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card> */}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShoppingBag className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Products Breakdown */}
                <div className="space-y-3">
                  {productBreakdown.map((product, index) => (
                    <div key={index} className="flex justify-between items-start text-sm">
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{product.name}</span>
                          {product.type === 'free' && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                              FREE
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {product.type === 'main' && (
                            <span className="text-xs text-muted-foreground">Base: ₹999</span>
                          )}
                          {product.isPremium && (
                            <Badge variant="secondary" className="text-xs bg-amber-50 text-amber-700">
                              +₹{product.extraAmount} extra
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {product.type === 'free' ? '₹0' : `₹${999 + product.extraAmount}`}
                        </div>
                        {product.type === 'free' && product.extraAmount > 0 && (
                          <div className="text-xs text-amber-600">
                            +₹{product.extraAmount} extra
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base Price</span>
                    <span>₹{totalBasePrice}</span>
                  </div>
                  
                  {totalExtraAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">selected products</span>
                      <span className="text-amber-600">+₹{totalExtraAmount}</span>
                    </div>
                  )}

                  {hasBOGO && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Free Products Savings</span>
                      <span>-₹{calculateFreeItems() * 999}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Final Total */}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span>₹{calculateTotalAmount()}</span>
                </div>

                {/* Summary Note */}
                {/* <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2 text-xs text-blue-700">
                    <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">Pricing Summary:</p>
                      <ul className="space-y-1">
                        <li>• All products start at ₹999 base price</li>
                        <li>• selected products have extra charges</li>
                        <li>• Free products only charge extra fees</li>
                      </ul>
                    </div>
                  </div>
                </div> */}
              </CardContent>
              <CardFooter className="flex flex-col space-y-3">
                <Link href="/checkout" className="w-full">
                  <Button className="w-full" size="lg">
                    Checkout - ₹{calculateTotalAmount()}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                
                <div className="text-xs text-muted-foreground text-center space-y-1">
                  <p className="flex items-center justify-center gap-1">
                    <Shield className="h-3 w-3" />
                    Secure checkout
                  </p>
                  {hasBOGO && (
                    <p className="text-green-600">
                      You saved ₹{calculateFreeItems() * 999} with free products!
                    </p>
                  )}
                </div>
              </CardFooter>
            </Card>

            {/* Trust Badges */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center text-xs">
                  <div>
                    <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center mx-auto mb-1">
                      <Star className="h-4 w-4" />
                    </div>
                    <span>Quality</span>
                  </div>
                  <div>
                    <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center mx-auto mb-1">
                      <Shield className="h-4 w-4" />
                    </div>
                    <span>Secure</span>
                  </div>
                  <div>
                    <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center mx-auto mb-1">
                      <Truck className="h-4 w-4" />
                    </div>
                    <span>Fast Delivery</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </main>
  );
}