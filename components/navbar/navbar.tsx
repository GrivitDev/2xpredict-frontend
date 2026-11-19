'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { FaBars, FaCoins, FaCrown, FaMagnifyingGlass } from 'react-icons/fa6';
import NavLinks from './NavLinks';
import UserMenu from './UserMenu';
import UniversalSearch from './UniversalSearch';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useAuth } from '@/providers/auth-provider';
import { useGetWalletQuery } from '@/hooks/use-bet-lab-wallet';

function formatPoints(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(amount)
    : '—';
}

function getSubscription(user: unknown) {
  if (!user) return { planLabel: 'Guest', remainingLabel: 'Guest' };

  const record = user as Record<string, any>;
  const subscription = record.subscription ?? record.activeSubscription ?? {};

  const rawPlan = subscription.plan?.name
    ?? subscription.planName
    ?? subscription.plan
    ?? record.subscriptionPlan
    ?? record.plan
    ?? 'Free';

  const plan = typeof rawPlan === 'string'
    ? rawPlan
    : String(rawPlan?.name ?? rawPlan?.code ?? 'Free');

  const planLabel = plan.trim()
    ? plan.trim().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
    : 'Free';

  const expiry = subscription.expiryDate
    ?? subscription.expiresAt
    ?? record.subscriptionExpiryDate
    ?? record.expiryDate
    ?? record.expiresAt;

  if (!expiry) return { planLabel, remainingLabel: 'No expiry' };

  const remaining = new Date(expiry).getTime() - Date.now();

  if (!Number.isFinite(remaining) || remaining <= 0) {
    return { planLabel, remainingLabel: 'Expired' };
  }

  const days = Math.ceil(remaining / 86400000);

  return {
    planLabel,
    remainingLabel: `${days} ${days === 1 ? 'day' : 'days'} left`,
  };
}

function compactRemainingLabel(value: string) {
  const days = value.match(/^(\d+)\s+days?\s+left$/i);
  return days ? `${days[1]}d` : value;
}

function isAccountRoute(pathname: string) {
  return ['/dashboard', '/profile', '/purchases', '/subscriptions', '/referrals', '/bonuses'].some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isAdmin = pathname.startsWith('/admin');
  const [searchOpen, setSearchOpen] = useState(false);

  const { planLabel, remainingLabel } = useMemo(
    () => getSubscription(user),
    [user],
  );

  const { data: walletResponse } = useGetWalletQuery({
    enabled: Boolean(user),
    staleTime: 30_000,
  });

  const wallet = (walletResponse as any)?.data ?? walletResponse;

  const points = wallet?.availablePoints
    ?? wallet?.balance
    ?? wallet?.monthlyBalance
    ?? wallet?.currentBalance
    ?? null;

  const onBetLab = pathname.startsWith('/bet-lab');

  const onPredictionsOrAccount =
    pathname.startsWith('/predictions') || isAccountRoute(pathname);

  const onHomeNewsHighlights =
    pathname === '/' ||
    pathname.startsWith('/news') ||
    pathname.startsWith('/highlights');

  const hideBreadcrumb =
    pathname === '/' ||
    ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'].some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleShortcut);

    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const logo = (
    <Link
      href="/"
      aria-label="2xPredict home"
      className="inline-flex h-full min-w-0 shrink-0 items-center"
    >
      <Image
        src="/logo.png"
        alt="2xPredict"
        width={94}
        height={194}
        priority
        className="h-[46px] w-[111px] shrink-0 object-contain sm:h-[54px] sm:w-[112px] lg:h-16 lg:w-66"
      />
    </Link>
  );

  const searchButton = (
    <button
      type="button"
      onClick={() => setSearchOpen(true)}
      aria-label="Search this section"
      title="Search this section (Ctrl/⌘ K)"
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center border-0 bg-transparent p-0 text-[var(--chrome-foreground)] shadow-none outline-none transition-transform duration-200 hover:scale-110 hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--chrome-accent)]/75 focus-visible:ring-offset-0"
    >
      <FaMagnifyingGlass
        className="block h-[18px] w-[18px] shrink-0"
        aria-hidden="true"
      />
    </button>
  );

  const subscriptionBadge = (withDays: boolean) => (
    <Link
      href="/subscriptions"
      title={withDays ? `${planLabel} subscription · ${remainingLabel}` : `${planLabel} subscription`}
      style={{
        borderColor: 'var(--chrome-border)',
        backgroundColor: 'rgba(255,250,247,0.09)',
        color: 'var(--chrome-foreground)',
      }}
      className="inline-flex min-h-9 max-w-[88px] min-w-0 items-center gap-1 rounded-full border px-1.5 py-1.5 text-[9px] font-bold leading-tight transition-colors hover:bg-white/[0.18] sm:min-h-10 sm:max-w-[150px] sm:gap-2 sm:px-3 sm:py-2 sm:text-[11px] lg:max-w-[145px] xl:max-w-[215px] xl:text-[12px] max-[380px]:max-w-[72px]"
    >
      <FaCrown
        className="h-3.5 w-3.5 shrink-0 text-[var(--chrome-accent)]"
        aria-hidden="true"
      />

      <span className="truncate">
        {withDays ? (
          <>
            <span className="hidden xl:inline">
              {planLabel} · {remainingLabel}
            </span>
            <span className="xl:hidden">
              {planLabel} · {compactRemainingLabel(remainingLabel)}
            </span>
          </>
        ) : (
          planLabel
        )}
      </span>
    </Link>
  );

  const pointsBadge = (
    <Link
      href="/bet-lab"
      title="Bet Lab points"
      style={{
        borderColor: 'var(--chrome-border)',
        backgroundColor: 'rgba(255,250,247,0.09)',
        color: 'var(--chrome-foreground)',
      }}
      className="inline-flex min-h-9 max-w-[88px] min-w-0 shrink items-center gap-1 rounded-full border px-1.5 py-1.5 text-[9px] font-bold leading-tight transition-colors hover:bg-white/[0.18] sm:min-h-10 sm:max-w-[125px] sm:gap-1.5 sm:px-2.5 sm:py-2 sm:text-[11px] lg:max-w-[112px] xl:max-w-[150px] xl:gap-2 xl:px-3 max-[380px]:max-w-[72px]"
    >
      <FaCoins
        className="h-3.5 w-3.5 shrink-0 text-[var(--chrome-accent)]"
        aria-hidden="true"
      />

      <span className="truncate">
        {points == null ? 'Points' : `${formatPoints(points)} pts`}
      </span>
    </Link>
  );

  const contextualBadge = onBetLab
    ? pointsBadge
    : onPredictionsOrAccount
      ? subscriptionBadge(true)
      : onHomeNewsHighlights
        ? subscriptionBadge(false)
        : subscriptionBadge(true);

  return (
    <>
      <header
        className={`sticky top-0 isolate w-full shrink-0 overflow-visible border-b pt-[env(safe-area-inset-top)] transition-[box-shadow,background-color] duration-300 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#F6E9D6]/95 after:to-transparent after:content-[''] ${
          searchOpen ? 'z-[9998]' : 'z-[100]'
        }`}
        style={{
          backgroundColor: 'var(--chrome-surface)',
          color: 'var(--chrome-foreground)',
          borderColor: 'var(--chrome-border)',
          boxShadow:
            '0 12px 30px rgba(43,2,17,0.22), inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(255,255,255,0.09)',
        }}
      >
        <div className="relative mx-auto flex h-[54px] w-full max-w-[1920px] items-center gap-0 pl-0 pr-1 sm:h-[59px] sm:pr-2 lg:h-[65px] lg:pr-3.5 2xl:pr-5">
          {!searchOpen ? (
            <>
              {/* 1. Logo */}
              {logo}

              {/* 2. Main navigation - desktop */}
              <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
                <NavLinks />
              </div>

              {/* 3. Subscription / BetLab points badge */}
              <div className="flex min-w-0 flex-1 items-center justify-center px-1 lg:mr-5 lg:flex-none lg:px-0">
                {contextualBadge}
              </div>

              {/* 4. Compact action icons: Notifications, Account, Search */}
              <div className="flex shrink-0 items-center gap-0 lg:gap-0.5">
                {user ? <NotificationBell /> : null}

                <UserMenu />

                {searchButton}

                {isAdmin ? (
                  <button
                    type="button"
                    onClick={() =>
                      window.dispatchEvent(new Event('2xpredict:open-admin-sidebar'))
                    }
                    aria-label="Open admin sidebar"
                    title="Admin navigation"
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center border-0 bg-transparent p-0 text-[var(--chrome-foreground)] shadow-none outline-none transition-transform duration-200 hover:scale-110 hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--chrome-accent)]/75 focus-visible:ring-offset-0 lg:hidden"
                  >
                    <FaBars
                      className="block h-[19px] w-[19px] shrink-0"
                      aria-hidden="true"
                    />
                  </button>
                ) : null}
              </div>
            </>
          ) : null}

          <UniversalSearch
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
            isAdmin={isAdmin}
          />
        </div>
      </header>

      {!isAdmin &&
      !searchOpen &&
      (pathname.startsWith('/news') || pathname.startsWith('/highlights')) ? (
        <nav
          aria-label="News and highlights navigation"
          className="sticky top-[calc(54px+env(safe-area-inset-top))] z-[80] flex w-full items-center justify-center gap-2 border-b border-border bg-background/95 px-1 py-1 text-foreground backdrop-blur-2xl lg:hidden"
        >
          {[
            { label: 'News', href: '/news', active: pathname.startsWith('/news') },
            {
              label: 'Highlights',
              href: '/highlights',
              active: pathname.startsWith('/highlights'),
            },
          ].map(({ label, href, active }) => (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`relative min-w-[112px] rounded-xl px-2 py-1 text-center text-xs font-bold transition-colors ${
                active
                  ? 'bg-muted text-primary'
                  : 'bg-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              }`}
            >
              {label}

              {active ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-5 -bottom-2 h-[2px] rounded-full bg-primary"
                />
              ) : null}
            </Link>
          ))}
        </nav>
      ) : null}
    </>
  );
}