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

    >

      <div
        className="
          mx-auto
          max-w-9xl
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