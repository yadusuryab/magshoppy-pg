// components/cart/cart-buttons/cart-count.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface CartButtonProps {
  showLabel?: boolean;
}

export default function CartButton({ showLabel = false }: CartButtonProps) {
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartItems(cart);
    };

    updateCart();
    window.addEventListener("cartUpdated", updateCart);
    return () => window.removeEventListener("cartUpdated", updateCart);
  }, []);

  const totalItems = cartItems.reduce((total, item) => {
    return total + (item.buyOneGetOne && item.freeProduct ? 2 : 1);
  }, 0);

  // Simple SVG cart icon - faster than Lucide
  const CartIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );

  if (showLabel) {
    return (
      <Link href="/checkout" className="relative inline-flex items-center gap-2 px-3 py-2 text-sm bg-secondary rounded-md hover:bg-secondary/80 transition-colors">
        <CartIcon />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {totalItems}
          </span>
        )}
        <span className="text-xs font-medium">Cart</span>
      </Link>
    );
  }

  return (
    <Link 
      href="/checkout" 
      className="relative inline-flex text-white items-center justify-center w-9 h-9 bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
    >
      <CartIcon />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border border-white/30 backdrop-blur-sm">
          {totalItems}
        </span>
      )}
    </Link>
  );
}