'use client';

import { InternalAd } from '@/types/internal-ad';

import { InternalAdRenderer } from '../InternalAdRenderer';

interface Props {
  ads: InternalAd[];
}

export function SidebarLayout({
  ads,
}: Props) {

  if (!ads.length) {
    return null;
  }

  return (

    <aside
      aria-label="Sponsored content"
      className="
        hidden
        w-full
        max-w-sm
        shrink-0
        xl:block
      "
    >

      <InternalAdRenderer
        ad={ads[0]}
        variant="sidebar"
      />

    </aside>

  );

}