'use client';

import { InternalAd } from '@/types/internal-ad';

import { InternalAdRenderer } from '../InternalAdRenderer';

interface Props {
  ads: InternalAd[];
}

export function BannerLayout({
  ads,
}: Props) {

  if (!ads.length) {
    return null;
  }

  return (

    <section
      aria-label="Sponsored content"
      className="
        w-full
        px-3
        sm:px-4
        lg:px-6
      "
    >

      <div
        className="
          mx-auto
          w-full
          max-w-7xl
        "
      >

        <InternalAdRenderer
          ads={ads}
          variant="banner"
        />

      </div>

    </section>

  );

}