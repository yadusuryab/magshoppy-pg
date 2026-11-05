import { Card, CardContent } from "@/components/ui/card";
import React from "react";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.

const TermsAndConditions = () => {
  return (
   // Add this component right before the fixed bottom button section
<div className="mt-6">
  <Card>
    <CardContent className="pt-6">
      <div className="text-center mb-4">
        <p className="text-sm font-medium text-muted-foreground">
          BY PLACING AN ORDER, YOU AGREE TO OUR TERMS & CONDITIONS:
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto p-4 bg-muted/30 rounded-lg text-xs">
        <h2 className="text-lg font-bold text-center mb-3">
          TERMS & CONDITIONS
        </h2>

        <section className="mb-4">
          <h3 className="text-sm font-semibold">RETURN & REPLACEMENT POLICY</h3>
          <ul className="list-disc ml-4 mt-1 space-y-1">
            <li>
              You can return the product for a replacement if the product is the
              wrong size, incorrect, or damaged.
            </li>
            <li>
              We do not offer exchanges, returns, or refunds for reasons related
              to personal preferences or dislikes. We strive to provide the best,
              but individual tastes and preferences may vary.
            </li>
          </ul>
          <p className="mt-1">
            Refunds are not available, only replacements. However, if the product
            is lost by the courier service, a refund is applicable under specific
            conditions.
          </p>
        </section>

        <section className="mb-4">
          <h3 className="text-sm font-semibold">UNBOXING VIDEO REQUIREMENTS</h3>
          <ul className="list-disc ml-4 mt-1 space-y-1">
            <li>
              A 360-degree video of unboxing the parcel is mandatory for any
              claims related to damage, size incorrect, missing items, etc. The
              issue must be clearly shown in the video without any pauses or cuts.
              This must be reported within 24 hours of receiving the parcel.
            </li>
            <li>
              The video should begin by showing the address label as sent by us,
              including the outer packaging.
            </li>
          </ul>
          <p className="mt-1">
            Some customers forget to take an unboxing video and later create fake
            videos. We do not accept such videos as proof. All customers must
            follow our guidelines.
          </p>
        </section>
        <section className="terms-section">
  <h3>AI-Generated Images & Product Representation</h3>

  <p>
    Some of our product visuals are created using AI for display purposes.
    We make sincere efforts to deliver products that closely match the images shown.
  </p>

  <p>
    Minor variations in color tone, texture, shine, or finishing may occur due to
    lighting conditions, AI rendering, screen differences, or stock variations.
    These are normal aspects of digital product representation.
  </p>

 <p>
 ~Buy 1 Get 1 Offer or Two Pair 1499₹ Offer – Quality & Pricing Our Buy 1 Get 1 offer is structured to provide maximum value within this price range. The products offered under this promotion are 6A quality replicas, and their quality is aligned with the offer pricing. please note that this is a commercial market grading term used for replica products. It does not mean the product is original, officially branded, or authorized by the brand owner.</p>
  <h3>Returns & Replacements</h3>

  <p>
    Variations arising from visual representation, lighting effects, or digital creation
    methods are not considered manufacturing defects and are not eligible for return
    or replacement.
  </p>
</section>

        <section className="mb-4">
          <h3 className="text-sm font-semibold">IMPORTANT NOTES</h3>
          <ul className="list-disc ml-4 mt-1 space-y-1">
            <li>
              Slight color variation or light/dark differences due to digital
              photography or device screen settings may occur. Therefore, images
              shown may differ slightly from the actual product.
            </li>
            <li>
              For combo or offer items, model selection will be as per your order, but minor color variations may occur depending on stock availability. We always ensure the closest match possible to your chosen color.
            </li>
            <li>
              Minor issues like loose threads, removable stains, or slight
              stitching imperfections are not considered damages.
            </li>
          </ul>
        </section>

        <section className="mb-4">
          <h3 className="text-sm font-semibold">*KEEP IN MIND</h3>
          <ul className="list-disc ml-4 mt-1 space-y-1">
            <li>Cancellation is not allowed after placing the order.</li>
            <li>
              If you want to replace a product, you must bear the courier charges.
              If the issue is from our side, we will cover the courier cost only
              after you provide the dispatch slip.
            </li>
            <li>The quality of the product is based on the price you pay.</li>
          </ul>
        </section>

        <section className="mb-4">
          <h3 className="text-sm font-semibold">SHIPPING & DELIVERY</h3>
          <ul className="list-disc ml-4 mt-1 space-y-1">
            <li>We are not the owners of any courier services.</li>
            <li>
              We send parcels through third-party courier services. If there is
              any delay in delivery, we are not responsible as it is beyond our
              control. However, 24x7 support is available from our side with 100%
              effort to resolve the issue. If the issue remains unresolved, it
              will be handled through mutual discussion.
            </li>
            <li>
              Do not request refunds or order cancellations due to courier delays.
              Please be patient and cooperate.
            </li>
          </ul>
        </section>

        <section className="mb-4">
          <h3 className="text-sm font-semibold">SIZE REPLACEMENT CONDITIONS</h3>
          <p className="mt-1">
            If you wish to replace the delivered product with the same shoes in a
            different size, it will be processed based on stock availability.
          </p>
          <p className="mt-1">
            However, if you ordered size 10 and received the correct size as per
            your order but later wish to exchange for a larger size, this is not
            possible, as we clearly specify the maximum available size (size 10)
            before purchase. Similarly, if you order size 6 and wish to replace it
            with size 5 (which is smaller), this is also not possible. Please keep
            this in mind while placing your order.
          </p>
        </section>

        <p className="mt-3 text-center font-bold text-xs">
          Note: Read carefully; do not scroll without understanding. Later, do not
          blame us. For more terms and conditions, check our website. If you have
          any doubts, clarify them with us before placing an order.
        </p>

        <p className="mt-3 text-center font-semibold">
          BEST REGARDS, FOOTEX TEAM
        </p>
      </div>
    </CardContent>
  </Card>
</div>
  );
};

export default TermsAndConditions;
