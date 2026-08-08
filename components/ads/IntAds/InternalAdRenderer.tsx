'use client';

import { InternalAd } from '@/types/internal-ad';

import { HeroAd } from './variants/HeroAd';
import { InlineAd } from './variants/InlineAd';
import { SidebarAd } from './variants/SidebarAd';
import { BottomAd } from './variants/BottomAd';
import { PopupAd } from './variants/PopupAd';
import { TickerAd } from './variants/TickerAd';

type Variant =
  | 'hero'
  | 'banner'
  | 'inline'
  | 'bottom'
  | 'footer'
  | 'sidebar'
  | 'popup';

interface Props {
  ad?: InternalAd;
  ads?: InternalAd[];
  variant: Variant;
  onClose?: () => void;
}

export function InternalAdRenderer({
  ad,
  ads = [],
  variant,
  onClose,
}: Props) {
  switch (variant) {
    case 'hero':
      return ad ? (
        <HeroAd
          ad={ad}
        />
      ) : null;

    case 'inline':
      return ad ? (
        <InlineAd
          ad={ad}
        />
      ) : null;

    case 'sidebar':
      return ad ? (
        <SidebarAd
          ad={ad}
        />
      ) : null;

    case 'bottom':
      return ad ? (
        <BottomAd
          ad={ad}
        />
      ) : null;

    case 'popup':
      return ad ? (
        <PopupAd
          ad={ad}
          onClose={onClose}
        />
      ) : null;

    case 'banner':
    case 'footer':
      return (
        <TickerAd
          ads={ads}
        />
      );

    default:
      return null;
  }
}