import { AdTrigger } from '@/constants/ads/ad-trigger';

export function shouldDisplayAd(
  adId: string,
  trigger: AdTrigger,
) {
  if (
    typeof window === 'undefined'
  ) {
    return true;
  }

  switch (trigger) {
    case AdTrigger.ALWAYS:

    case AdTrigger.EVERY_VISIT:
      return true;

    case AdTrigger.ONCE_PER_SESSION: {
      const key =
        `ad-session-${adId}`;

      if (
        sessionStorage.getItem(key)
      ) {
        return false;
      }

      sessionStorage.setItem(
        key,
        '1',
      );

      return true;
    }

    case AdTrigger.ONCE_PER_DAY: {
      const key =
        `ad-day-${adId}`;

      const today =
        new Date().toDateString();

      if (
        localStorage.getItem(key) ===
        today
      ) {
        return false;
      }

      localStorage.setItem(
        key,
        today,
      );

      return true;
    }

    default:
      return true;
  }
}