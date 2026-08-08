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
      className="
        hidden
        xl:block
        w-full
        max-w-sm
      "
    >

      <InternalAdRenderer
        ad={ads[0]}
        variant="sidebar"
      />

    </aside>

  );

}