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
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        overflow-hidden
        bg-black/40
        p-4
        sm:p-6
      "
    >
      <InternalAdRenderer
        ad={popupAd}
        variant="popup"
        onClose={() => setOpen(false)}
      />
    </div>
  );
}