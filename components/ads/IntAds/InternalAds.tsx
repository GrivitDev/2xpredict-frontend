'use client';

import { useMemo } from 'react';

import { useInternalAds } from '@/hooks/useInternalAds';

import { useAdDevice } from './hooks/useAdDevice';

import { AdPage } from '@/constants/ads/ad-page';
import { AdPosition } from '@/constants/ads/ad-position';
import { AdDevice } from '@/constants/ads/ad-device';

import { HeroLayout } from './layouts/HeroLayout';
import { BannerLayout } from './layouts/BannerLayout';
import { InlineLayout } from './layouts/InlineLayout';
import { BottomLayout } from './layouts/BottomLayout';
import { FooterLayout } from './layouts/FooterLayout';
import { SidebarLayout } from './layouts/SidebarLayout';
import { PopupLayout } from './layouts/PopupLayout';

import { sortAds } from './utils/sortAds';
import { shouldDisplayAd } from './utils/shouldDisplayAd';

interface Props {
  page: AdPage;

  position: AdPosition;
}

export function InternalAds({
  page,
  position,
}: Props) {

    const device = useAdDevice();

    const {
        data = [],
        isLoading,
    } = useInternalAds(
        page,
        device,
    );

  const ads = useMemo(() => {

    if (!data.length) {

      return [];

    }

    return sortAds(

      data.filter((ad) => {

        const display =
          ad.displays.find(
            (display) =>
              display.page === page &&
              display.position === position &&
              (
                display.device === device ||
                display.device === AdDevice.ALL
              ),
          );

        if (!display) {

          return false;

        }

        return shouldDisplayAd(
          ad._id,
          display.trigger,
        );

      }),

      position,

    );

  }, [
    data,
    page,
    position,
    device,
  ]);

  if (
    isLoading ||
    ads.length === 0
  ) {

    return null;

  }

  switch (position) {

    case AdPosition.HERO:
      return (
        <HeroLayout
          ads={ads}
        />
      );

    case AdPosition.TOP_BANNER:
      return (
        <BannerLayout
          ads={ads}
        />
      );

    case AdPosition.INLINE:
      return (
        <InlineLayout
          ads={ads}
        />
      );

    case AdPosition.BOTTOM:
      return (
        <BottomLayout
          ads={ads}
        />
      );

    case AdPosition.FOOTER:
      return (
        <FooterLayout
          ads={ads}
        />
      );

    case AdPosition.SIDEBAR_LEFT:

    case AdPosition.SIDEBAR_RIGHT:
      return (
        <SidebarLayout
          ads={ads}
        />
      );

    case AdPosition.POPUP:
      return (
        <PopupLayout
          ads={ads}
        />
      );

    default:
      return null;

  }

}