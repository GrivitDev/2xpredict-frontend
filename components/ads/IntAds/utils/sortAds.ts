import { InternalAd } from '@/types/internal-ad';

import { AdPosition } from '@/constants/ads/ad-position';

export function sortAds(
  ads: InternalAd[],
  position: AdPosition,
) {
  return [...ads].sort(
    (a, b) => {
      const displayA =
        a.displays.find(
          (display) =>
            display.position === position,
        );

      const displayB =
        b.displays.find(
          (display) =>
            display.position === position,
        );

      const orderA =
        displayA?.displayOrder ?? 1;

      const orderB =
        displayB?.displayOrder ?? 1;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return b.priority - a.priority;
    },
  );
}