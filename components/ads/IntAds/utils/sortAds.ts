import { InternalAd } from '@/types/internal-ad';

import { AdPosition } from '@/constants/ads/ad-position';
import type { AdPosition as AdPositionValue } from '@/types/ads';

export function sortAds(
  ads: InternalAd[],
  position: AdPositionValue,
) {
  return [...ads].sort(
    (a, b) => {
      const displayA =
        (a.displays ?? []).find(
          (display) =>
            display.position === position,
        );

      const displayB =
        (b.displays ?? []).find(
          (display) =>
            display.position === position,
        );

      const orderA =
        displayA?.displayOrder ?? 1;

      const orderB =
        displayB?.displayOrder ?? 1;

      if (
        orderA !== orderB
      ) {
        return orderA - orderB;
      }

      return (
        (b.priority ?? 0) -
        (a.priority ?? 0)
      );
    },
  );
}
