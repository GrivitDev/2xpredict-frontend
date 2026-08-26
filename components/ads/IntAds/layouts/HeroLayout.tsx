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
      aria-label="Sponsored content"
      className="
        mx-auto
        w-full
        max-w-7xl
        px-3
        sm:px-4
        lg:px-6
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