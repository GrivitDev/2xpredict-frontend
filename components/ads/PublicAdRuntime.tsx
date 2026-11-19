'use client';

import { usePathname } from 'next/navigation';
import { CampaignAds } from '@/components/ads/CampaignAds';
import { InternalAds } from '@/components/ads/IntAds/InternalAds';
import { AdPage } from '@/constants/ads/ad-page';
import { AdPosition } from '@/constants/ads/ad-position';
import type { AdPage as AdPageType, AdPosition as AdPositionType } from '@/types/ads';

type Region = 'top' | 'bottom';

/**
 * Resolves only routes represented by the backend AdPage enum.
 * Unknown routes are intentionally left without ad requests.
 */
function resolveAdPage(pathname: string): AdPageType | null {
  if (pathname === '/') return AdPage.HOME;
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) return AdPage.DASHBOARD;
  if (pathname === '/pricing' || pathname.startsWith('/pricing/')) return AdPage.PRICING;
  if (pathname === '/predictions' || pathname.startsWith('/predictions/')) return AdPage.PREDICTIONS;
  if (pathname === '/about' || pathname.startsWith('/about/')) return AdPage.ABOUT;
  if (pathname === '/purchases' || pathname.startsWith('/purchases/')) return AdPage.PURCHASES;
  if (pathname === '/subscriptions' || pathname.startsWith('/subscriptions/')) return AdPage.SUBSCRIPTIONS;
  if (pathname === '/referrals' || pathname.startsWith('/referrals/')) return AdPage.REFERRALS;
  if (pathname === '/bet-lab' || pathname.startsWith('/bet-lab/')) return AdPage.BET_LAB;
  if (pathname === '/pick-center' || pathname.startsWith('/pick-center/')) return AdPage.PICK_CENTER;
  if (pathname === '/slip-center' || pathname.startsWith('/slip-center/')) return AdPage.SLIP_CENTER;
  if (pathname === '/odds-center' || pathname.startsWith('/odds-center/')) return AdPage.ODDS_CENTER;
  if (pathname === '/bonuses' || pathname.startsWith('/bonuses/')) return AdPage.BONUSES;
  if (pathname === '/promos' || pathname.startsWith('/promos/')) return AdPage.PROMOS;
  if (pathname === '/wallet' || pathname.startsWith('/wallet/')) return AdPage.WALLET;
  if (pathname === '/register' || pathname.startsWith('/register/')) return AdPage.REGISTER;
  if (pathname === '/login' || pathname.startsWith('/login/')) return AdPage.LOGIN;
  return null;
}

function AdPlacement({ page, position }: { page: AdPageType; position: AdPositionType }) {
  return (
    <>
      <InternalAds page={page} position={position} />
      <CampaignAds page={page} position={position} />
    </>
  );
}

/**
 * Public ad delivery mount. The public layout renders the top region before
 * route content and the bottom region after it. Both ad systems are filtered
 * by the same backend-defined page and placement enums.
 */
export default function PublicAdRuntime({ region }: { region: Region }) {
  const pathname = usePathname() ?? '/';
  const page = resolveAdPage(pathname);

  if (!page) return null;

  if (region === 'top') {
    return (
      <>
        {page === AdPage.HOME && <AdPlacement page={page} position={AdPosition.HERO} />}
        <AdPlacement page={page} position={AdPosition.TOP_BANNER} />
      </>
    );
  }

  return (
    <>
      <AdPlacement page={page} position={AdPosition.BOTTOM} />
      <AdPlacement page={page} position={AdPosition.FOOTER} />
    </>
  );
}

