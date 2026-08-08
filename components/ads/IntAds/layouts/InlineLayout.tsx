'use client';

import { InternalAd } from '@/types/internal-ad';

import { InternalAdsCarousel } from '../InternalAdsCarousel';

interface Props {
  ads: InternalAd[];
}

export function InlineLayout({
  ads,
}: Props) {

  if (!ads.length) {
    return null;
  }

  return (

    <section
      className="
        mx-auto
        w-full
        max-w-7xl
        px-1
      "
    >

      <InternalAdsCarousel
        ads={ads}
        variant="inline"
        interval={10000}
      />

    </section>

  );

}