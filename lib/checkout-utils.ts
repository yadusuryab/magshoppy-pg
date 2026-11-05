export const getProductImageUrl = (product: any): string => {
  if (!product) return "/placeholder-image.jpg";
  let url =
    product.image ||
    product.imageUrl ||
    product.images?.[0]?.asset?.url ||
    product.images?.[0]?.url ||
    "";
  if (!url) return "/placeholder-image.jpg";
  if (url.includes("cloudinary.com"))
    return url.replace("/upload/", "/upload/w_200,h_200,q_50,f_auto/");
  return url;
};

export const formatDeliveryDate = (date: Date): string =>
  date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

export const getExpectedDelivery = (
  minDays: number,
  maxDays: number,
  from: Date = new Date(),
) => {
  const start = new Date(from);
  start.setDate(start.getDate() + minDays);
  const end = new Date(from);
  end.setDate(end.getDate() + maxDays);
  return {
    start,
    end,
    label: `${formatDeliveryDate(start)} - ${formatDeliveryDate(end)}`,
  };
};