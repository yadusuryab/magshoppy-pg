import { Hero } from "@/components/sections/hero";
import { FreeSocksPromo } from "@/components/sections/free-socks";
import { OrderTrackCTA } from "@/components/sections/order-track";
import { client } from "@/sanityClient";
import {
  LazyReviews,
  LazyShopVideo,
} from "@/components/sections/lazy-sections";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.

// Re-fetch from Sanity at most once per 5 minutes, shared across all visitors
export const revalidate = 300;

async function getFreeSocksOffer(): Promise<boolean> {
  try {
    // Projection: returns just `true`/`false`/null, not whole documents
    const offer = await client.fetch<boolean | null>(
      `*[_type == "settings"][0].freeSocksOffer`,
    );
    return !!offer;
  } catch {
    return false;
  }
}

const slot = "px-4 my-2 md:max-w-[400px] w-full mx-auto";

export default async function Home() {
  const freeSocksOffer = await getFreeSocksOffer();

  return (
    <div className="py-4 md:px-6 min-h-screen">
      <div className="md:flex md:justify-center md:items-start">
        <div>
          <div className={slot}>
            <Hero />
          </div>
          {freeSocksOffer && (
            <div className={slot}>
              <FreeSocksPromo />
            </div>
          )}
        </div>
        <div>
          <div className={slot}>
            <OrderTrackCTA />
          </div>
          <div className={slot}>
            <LazyReviews />
          </div>
          {/* <div className={slot}>
            <LazyShopVideo />
          </div> */}
        </div>
      </div>
    </div>
  );
}
