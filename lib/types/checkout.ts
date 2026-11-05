export interface CartItem {
  _id: string;
  productName: string;
  selectedSize: string;
  price: number;
  image?: string;
  imageUrl?: string;
  images?: Array<{ asset: { url: string } }>;
  buyOneGetOne?: boolean;
  freeProduct?: CartItem;
  offerType?: "one-pair" | "two-pair";
}

export type CheckoutStep = "payment" | "details";

export interface CustomerDetails {
  name: string;
  contact1: string;
  contact2: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  landmark: string;
  instagramId: string;
}