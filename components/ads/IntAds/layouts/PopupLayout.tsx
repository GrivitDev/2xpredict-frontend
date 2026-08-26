'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { InternalAd } from '@/types/internal-ad';

import { InternalAdRenderer } from '../InternalAdRenderer';

import {
  markPopupSeen,
} from '../utils/popup-history';

import {
  selectPopupAd,
} from '../utils/popup-selector';

interface Props {
  ads: InternalAd[];
}

export function PopupLayout({
  ads,
}: Props) {

  const [open, setOpen] = useState(true);

  const popupAd = useMemo(
    () => selectPopupAd(ads),
    [ads],
  );

  useEffect(() => {

    if (!popupAd) {
      return;
    }

    markPopupSeen(popupAd._id);

  }, [popupAd]);

  if (!open || !popupAd) {
    return null;
  }

  return (

    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sponsored content"
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        overflow-y-auto
        bg-background/70
        p-3
        backdrop-blur-sm
        sm:p-5
      "
    >

      {/* Ambient Light */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[min(80vw,28rem)]
          w-[min(80vw,28rem)]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-primary/10
          blur-3xl
        "
      />

      {/* Advertisement */}

      <div
        className="
          relative
          z-10
          w-full
        "
      >

        <InternalAdRenderer
          ad={popupAd}
          variant="popup"
          onClose={() => setOpen(false)}
        />

      </div>

    </div>

  );

}