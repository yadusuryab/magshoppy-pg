import { client } from "@/sanityClient";

// Define TypeScript interfaces for the order and product details
interface ProductDetail {
  productId: {
    _id: string;
    productName: string;
    shoeBrand: string;
    images: { asset: { url: string } }[];
    price: number;
  };
  quantity: number;
  price: number;
  size?: number; // Optional size field
  key?: string; // Unique key for each product detail
}

interface Order {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  productDetails: ProductDetail[];
  trackingId?: string; // Optional tracking ID
  transactionId?: string; // Optional tracking ID
  status: string;
  payment_method: string;
  payment_status: string;
  payment_amount: number;
  shipping_charge: number;
  order_date: string;
  _createdAt: string;
  payment_id?: string; // Optional payment ID
  payment_date?: string; // Optional payment date
  notes?: string; // Optional notes
}
const generateUniqueKey = (): string => {
  const timestamp = Date.now().toString(36); // Convert current timestamp to base-36 string
  const randomString = Math.random().toString(36).substring(2, 8); // Generate a random string
  return `${timestamp}-${randomString}`; // Combine timestamp and random string
};

export const createOrder = async (orderDetails: {
  name: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  products: {
    productId: string;
    quantity: number;
    price: number;
    size?: number;
    key?: string;
  }[];
  payment_method: "cod" | "online";
  payment_status: string;
  payment_amount: number;
  shipping_charge: number;
  transactionId:number;
  order_date: string;
  notes?: string;
}): Promise<any> => {
  const {
    name,
    email,
    phone,
    address,
    district,
    state,
    pincode,
    products,
    payment_method,
    payment_status,
    payment_amount,
    shipping_charge,
    transactionId,
    order_date,
    notes,
  } = orderDetails;

  // Map products to the required format for productDetails
  const productDetails = products.map((product) => ({
    productId: { _type: "reference", _ref: product.productId },
    quantity: product.quantity,
    price: product.price,
    size: product.size,
    key: product.key || generateUniqueKey(),
  }));

  const order:any = {
    _type: "order",
    name,
    email,
    phone,
    address,
    district,
    state,
    pincode,
    productDetails,
    trackingId: "",
    status: "pending",
    payment_method,
    payment_status,
    payment_amount,
    transactionId,
    shipping_charge,
    order_date,
    _createdAt: new Date().toISOString(),
    notes: notes || "", // Initialize notes with the provided value or an empty string
  };

  try {
    // Create the order in Sanity
    const result = await client.create(order);
    console.log("Order creation result:", result);

    if (!result) {
      throw new Error("Order creation failed: result is undefined");
    }

    // Clear cart items from local storage
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cartUpdated"));


    // // Prepare the full order details for the WhatsApp message
    // const orderSummary = result.productDetails
    //   .map(
    //     (product:any) =>
    //       `- ${product.productName} (Qty: ${product.quantity}, Price: ₹${product.price}, Size: ${product.size})`
    //   )
    //   .join("\n");

    // const fullOrderDetails = {
    //   to: `91${phone}`, // Customer's phone number
    //   orderId: result._id, // Use the order ID from Sanity
    //   name,
    //   email,
    //   phone,
    //   address: `${address}, ${district}, ${state}, ${pincode}`,
    //   products: orderSummary,
    //   payment_method,
    //   payment_status,
    //   payment_amount,
    //   shipping_charge,
    //   total_amount: payment_amount + shipping_charge, // Calculate total amount
    //   order_date,
    //   notes,
    // };

    // console.log("Sending full order details:", fullOrderDetails);

    // // Call the /api/send-whatsapp API to send messages to both customer and store owner
    // const whatsappResponse = await fetch("/api/send-whatsapp", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(fullOrderDetails),
    // });

    // const whatsappData = await whatsappResponse.json();
    // console.log("WhatsApp API response:", whatsappData);

    // if (!whatsappResponse.ok) {
    //   console.error("Failed to send WhatsApp messages:", whatsappData.error);

    //   // Update the order notes with the WhatsApp message failure
    //   const errorMessage = `WhatsApp message failed: ${whatsappData.error}`;
    //   await client
    //     .patch(result._id)
    //     .set({ notes: `${notes ? `${notes}\n` : ""}${errorMessage}` })
    //     .commit();

    //   throw new Error(errorMessage);
    // }
    await sendTelegramNotification(result);

    return result;
  } catch (error:any) {
    console.error("Error creating order:", error);

    // Update the order notes with the error details
    const errorMessage = `Order creation error: ${error.message}`;
    await client
      .patch(order._id)
      .set({ notes: `${notes ? `${notes}\n` : ""}${errorMessage}` })
      .commit();

    return undefined;
  }
};
async function sendTelegramNotification(order: any) {
  const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID || !BASE_URL) {
    console.warn("Required environment variables not set - skipping notification");
    return;
  }

  try {
    // Format order details for Telegram message
    const productList = order.productDetails
      .map((product: any) => 
        `- [${product.productId._ref}](${BASE_URL}/p/${product.productId._ref}) (Qty: ${product.quantity}, Price: ₹${product.price})`
      )
      .join("\n");

    const message = `
📦 *New Order Received* 📦
      
🆔 *Order ID*: ${order._id}
📅 *Date*: ${new Date(order._createdAt).toLocaleString()}
      
👤 *Customer Details*:
- Name: ${order.name}
- Phone: [${order.phone}](tel:${order.phone})
- Email: [${order.email}](mailto:${order.email})
      
📍 *Shipping Address*:
${order.address}
${order.district}, ${order.state}
Pincode: ${order.pincode}
      
🛒 *Products*:
${productList}
      
💳 *Payment*:
- Method: ${order.payment_method.toUpperCase()}
- Status: ${order.payment_status}
- Amount: ₹${order.payment_amount}
- Shipping: ₹${order.shipping_charge}
- *Total*: ₹${order.payment_amount + order.shipping_charge}
      
📝 *Notes*: ${order.notes || "None"}
    `;

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: false // Enable link previews
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Telegram API error:', data);
      throw new Error(`Telegram notification failed: ${data.description}`);
    }

    console.log('Telegram notification sent successfully');
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    // You might want to log this error to your error tracking system
  }
}
// Fetch an order by its ID
export const getOrderById = async (orderId: string): Promise<Order | undefined> => {
  const query = `*[_type == "order" && _id == $orderId] {
    _id,
    name,
    email,
    phone,
    address,
    district,
    state,
    pincode,
    transactionId,
    productDetails[] {
      productId -> {
        _id,
        productName,
        shoeBrand,
        images[] {
          asset -> {
            url
          }
        },
        price
      },
      quantity,
      price,
      size,
      key
    },
    trackingId,
    status,
    payment_method,
    payment_status,
    payment_amount,
    shipping_charge,
    order_date,
    _createdAt,
    payment_id,
    payment_date,
    notes
  }[0]`; // Fetch only the first matching order

  try {
    const order: Order = await client.fetch(query, { orderId });
    if (!order) {
      console.warn(`No order found for ID: ${orderId}`);
      return undefined;
    }
    return order;
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    return undefined;
  }
};

// Fetch all orders by phone number
export const getOrdersByPhone = async (phone: string): Promise<Order[] | undefined> => {
  const query = `*[_type == "order" && phone == $phone] {
    _id,
    name,
    email,
    phone,
    address,
    district,
    state,
    pincode,
    transactionId,
    productDetails[] {
      productId -> {
        _id,
        productName,
        shoeBrand,
        images[] {
          asset -> {
            url
          }
        },
        price
      },
      quantity,
      price,
      size,
      key
    },
    trackingId,
    status,
    payment_method,
    payment_status,
    payment_amount,
    shipping_charge,
    order_date,
    _createdAt,
    payment_id,
    payment_date,
    notes
  }`;

  try {
    const orders: Order[] = await client.fetch(query, { phone });
    if (orders.length === 0) {
      console.warn(`No orders found for phone: ${phone}`);
      return undefined;
    }
    return orders;
  } catch (error) {
    console.error("Error fetching orders by phone:", error);
    return undefined;
  }
};

// Update payment status and payment ID
export const updateOrderPaymentStatus = async (
  orderId: string,
  paymentDetails: { paymentStatus: string; paymentId: string; paymentDate?: string }
): Promise<any> => {
  try {
    const updatedOrder = await client
      .patch(orderId) // Document ID to patch
      .set({
        payment_status: paymentDetails.paymentStatus,
        payment_id: paymentDetails.paymentId,
        payment_date: paymentDetails.paymentDate || new Date().toISOString(), // Include payment date if provided
      })
      .commit(); // Commit the patch

    return updatedOrder;
  } catch (error) {
    console.error("Error updating order payment status:", error);
    return undefined;
  }
};
// Update payment ID for an order
export const updateOrderPaymentId = async (
  orderId: string,
  paymentId: string
): Promise<any> => {
  try {
    const updatedOrder = await client
      .patch(orderId) // Document ID to patch
      .set({
        payment_id: paymentId, // Update the payment_id field
      })
      .commit(); // Commit the patch

    console.log("Updated order with payment ID:", updatedOrder);
    return updatedOrder;
  } catch (error) {
    console.error("Error updating order payment ID:", error);
    return undefined;
  }
};