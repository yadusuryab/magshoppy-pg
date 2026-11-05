import React, { Suspense } from 'react';
import OfferClient from './offer-client';

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.

export default function OfferPage() {
  return (
    <div className="container mx-auto px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <OfferClient />
      </Suspense>
    </div>
  );
}
