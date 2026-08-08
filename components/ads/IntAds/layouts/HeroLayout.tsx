'use client';

import { InternalAd } from '@/types/internal-ad';

import { InternalAdsCarousel } from '../InternalAdsCarousel';

interface Props {
  ads: InternalAd[];
}

export function HeroLayout({
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
      "
    >

      <InternalAdsCarousel
        ads={ads}
        variant="hero"
        interval={8000}
      />

    </section>

  );

}