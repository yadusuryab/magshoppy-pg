import { createOrder } from "./orderQueries";
import { CartItem } from "./orderUtils";

interface CustomerDetails {
  name: string;
  email: string;
  contact1: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
}

export const handleCheckout = async (
  customerDetails: CustomerDetails,
  cartItems: CartItem[],
  totalAmount: number,
  shippingCharge: number,
  router: any,
  transactionId : any,
  setIsLoading: (loading: boolean) => void,
  paymentMethod?: "upi" | "cod" | any,
) => {
  setIsLoading(true);
  console.log(cartItems)
  const orderDetails: any = {
    name: customerDetails.name,
    email: customerDetails.email,
    phone: customerDetails.contact1,
    products: cartItems?.flatMap((item) => [
      {
        productId: item._id,
        quantity: 1,
        size: item.selectedSize,
        price: item.offerPrice || item.price,
      },
      ...(item.freeProduct
        ? [
            {
              productId: item.freeProduct._id,
              quantity: 1,
              size: item.freeProduct.selectedSize,
              price: item.freeProduct.offerPrice || item.freeProduct.price,
            },
          ]
        : []),
    ]),
    payment_method: paymentMethod,
    payment_status: paymentMethod === "upi" ? "pending" : "cod",
    payment_amount: totalAmount,
    transactionId: transactionId, // Initialize payment_id as empty
    shipping_charge: shippingCharge,
    order_date: new Date().toISOString(),
    address: customerDetails.address,
    district: customerDetails.district,
    state: customerDetails.state,
    pincode: customerDetails.pincode,
  };

  try {
    const orderResult = await createOrder(orderDetails);
    if (!orderResult) throw new Error("Failed to create order.");

   
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));
      router.push(`/order/${orderResult._id}`);
    
  } catch (error) {
    console.error("Error during checkout:", error);
    alert("An error occurred during checkout. Please try again.");
  } finally {
    setIsLoading(false);
  }
};