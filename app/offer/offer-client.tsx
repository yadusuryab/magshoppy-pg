'use client';

import { useSearchParams } from 'next/navigation';
import ProductList from '@/components/product/product-list';
import React from 'react';

export type PairMode = 'one' | 'two';

const DEFAULT_PAIR: PairMode = 'two';

export default function OfferClient() {
  const searchParams = useSearchParams();
  const price = searchParams.get('price');
  const rawPair = searchParams.get('pair')?.toLowerCase();

  const pair: PairMode = rawPair === 'one' || rawPair === 'two' ? rawPair : DEFAULT_PAIR;

  return <ProductList price={price} pair={pair} />;
}