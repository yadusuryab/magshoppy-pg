export interface Product {
  _id: string;
  productName: string;
  brand: string;
  bikes: string[];
  images: { asset: { url: string } }[];
  description: string;
  madeIn: string;
  price: number;
  offerprice: number;
}

// Function to get cart items from localStorage
export const getCartItems = (): Product[] => {
  return JSON.parse(localStorage.getItem("cart") || "[]");
};

// Function to check if a product is in the cart
export const isProductInCart = (productId: string): boolean => {
  const cart = getCartItems();
  return cart.some((item) => item._id === productId);
};

// Function to add a product to the cart
export const addToCart = (product: any, callback?: () => void) => {
  const cart = getCartItems();
  if (!isProductInCart(product._id)) {
    const updatedCart = [...cart, product];
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Trigger any callback function (e.g., updating state)
    if (callback) callback();

    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event("cartUpdated"));
  }
};
