type StandardEvent =
  | "ViewContent"
  | "InitiateCheckout"
  | "Purchase"
  | "AddToCart"
  | "Lead"
  | "CompleteRegistration";

type EventParams = {
  content_ids?: string[];
  content_name?: string;
  content_type?: "product" | "product_group";
  contents?: { id: string; quantity: number }[];
  value?: number;
  currency?: string;
  num_items?: number;
};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function fbEvent(
  event: StandardEvent,
  params?: EventParams,
  eventID?: string,
) {
  if (typeof window === "undefined" || !window.fbq) return;
  if (eventID) {
    window.fbq("track", event, params ?? {}, { eventID });
  } else {
    window.fbq("track", event, params ?? {});
  }
}

export function fbTrackCustom(
  event: string,
  params?: Record<string, unknown>,
) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("trackCustom", event, params ?? {});
}