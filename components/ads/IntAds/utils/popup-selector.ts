import { InternalAd } from '@/types/internal-ad';

import {
  getPopupHistory,
  shownThisVisit,
} from './popup-history';

export function selectPopupAd(
  ads: InternalAd[],
): InternalAd | null {
  if (!ads.length) {
    return null;
  }

  const history =
    getPopupHistory();

  let selected: InternalAd | null =
    null;

  let highestScore =
    -Infinity;

  for (const ad of ads) {
    let score =
      ad.priority ?? 0;

    if (!history[ad._id]) {
      score += 100;
    }

    if (
      shownThisVisit(ad._id)
    ) {
      score -= 1000;
    }

    if (
      score > highestScore
    ) {
      highestScore = score;
      selected = ad;
    }
  }

  return selected;
}