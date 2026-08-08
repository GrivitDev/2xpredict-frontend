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

  const scored =
    ads.map(
      ad => {

        let score = 0;

        if (!history[ad._id]) {

          score += 100;

        }

        score +=
          ad.priority ?? 0;

        if (
          shownThisVisit(
            ad._id,
          )
        ) {

          score -= 1000;

        }

        return {

          ad,

          score,

        };

      },
    );

  scored.sort(
    (
      a,
      b,
    ) =>
      b.score -
      a.score,
  );

  return (
    scored[0]?.ad ??
    null
  );

}