"use client";

import dynamic from "next/dynamic";
import { LazyOnView, LazySkeleton } from "../layout/lazy-scroll";

// `loading` keeps the skeleton on screen while the JS chunk downloads
const ReviewsBento = dynamic(
  () => import("@/components/sections/review-bento").then((m) => m.ReviewsBento),
  { loading: () => <LazySkeleton minHeight={400} /> }
);
const ShopVideo = dynamic(
  () => import("@/components/sections/sv").then((m) => m.ShopVideo),
  { loading: () => <LazySkeleton minHeight={300} /> }
);

export const LazyReviews = () => (
  <LazyOnView minHeight={400}>
    <ReviewsBento />
  </LazyOnView>
);

export const LazyShopVideo = () => (
  <LazyOnView minHeight={300}>
    <ShopVideo />
  </LazyOnView>
);