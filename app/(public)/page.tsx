// frontend/app/(public)/page.tsx

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';

import {
  FaArrowRight,
  FaChartLine,
  FaFutbol,
  FaFlask,
  FaGlobe,
  FaNewspaper,
  FaShieldHalved,
  FaTelegram,
  FaWhatsapp,
  FaFacebookF,
  FaXTwitter,
  FaInstagram,
} from 'react-icons/fa6';

import { analyticsService } from '@/services/analytics.service';
import type { PublicAnalyticsStats } from '@/types/analytics';
import DeferredHomeSection from '@/components/home-sections/DeferredHomeSection';

const loadSettledWins = () => import('@/components/home-sections/settled-wins/SettledWinsSection');
const loadWonSlips = () => import('@/components/home-sections/won-slips/WonSlipsSection');
const loadFixtures = () => import('@/components/home-sections/fixtures/FixturesSection');
const loadStandings = () => import('@/components/home-sections/standings/StandingsSection');
const loadHomePricing = () => import('@/components/pricing/HomePricingPreview');
const loadLatestNews = () => import('@/components/home-sections/news-preview/LatestNewsPreviewSection');
const loadLatestHighlights = () => import('@/components/home-sections/highlights-preview/LatestHighlightsPreviewSection');

// ============================================================
// TYPES
// ============================================================

type Feature = {
  title: string;
  description: string;
  href: string;
  icon: typeof FaFutbol;
  label: string;
};

type LiveStat = {
  title: string;
  value: number | null;
  secondaryValue: number | null;
  secondaryLabel: string;
  icon: typeof FaFutbol;
};

// ============================================================
// DISPLAY HELPERS
// ============================================================

function formatCount(value: number | null | undefined): string {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return '—';
  }

  return new Intl.NumberFormat('en-NG', {
    maximumFractionDigits: 0,
  }).format(value);
}

// ============================================================
// ABOUT FEATURES
// ============================================================

const aboutFeatures: Feature[] = [
  {
    title: 'Daily Predictions',
    description:
      'Explore daily football predictions and match insights to help you understand the fixtures ahead.',
    href: '/predictions',
    icon: FaChartLine,
    label: 'Every match has a story',
  },
  {
    title: '120+ Leagues',
    description:
      'Follow football across a wide range of competitions, from familiar favourites to leagues around the world.',
    href: '/matches',
    icon: FaFutbol,
    label: 'Football without borders',
  },
  {
    title: 'Bet Lab',
    description:
      'Experiment with selections in our demo betting environment using real football fixtures and virtual points.',
    href: '/bet-lab',
    icon: FaFlask,
    label: 'Explore your possibilities',
  },
  {
    title: 'News',
    description:
      'Keep up with football stories, important developments and updates from across the game.',
    href: '/news',
    icon: FaNewspaper,
    label: 'Stay informed',
  },
  {
    title: 'Highlights',
    description:
      'Relive key moments and watch football match highlights.',
    href: '/highlights',
    icon: FaFutbol,
    label: 'Relive the moments',
  },
];

function getUpgradeAction(user: unknown): { label: string; href: string } | null {
  if (!user || typeof user !== 'object') return null;

  const account = user as {
    subscription?: { plan?: unknown; tier?: unknown };
    plan?: unknown;
    subscriptionPlan?: unknown;
  };

  const rawPlan =
    account.subscription?.plan ??
    account.subscription?.tier ??
    account.plan ??
    account.subscriptionPlan;

  const plan = typeof rawPlan === 'string' ? rawPlan.toLowerCase() : 'free';

  if (plan.includes('premium')) return null;
  if (plan.includes('vip')) return { label: 'Upgrade to Premium', href: '/pricing' };
  if (plan.includes('regular')) return { label: 'Upgrade to VIP', href: '/pricing' };

  return { label: 'Upgrade to Regular', href: '/pricing' };
}

// ============================================================
// PAGE
// ============================================================

export default function HomePage() {
  const { user } = useAuth();
  const upgradeAction = getUpgradeAction(user);
  // One public endpoint supplies the eight aggregate platform counts.
  // This keeps the home page independent of access-filtered prediction lists.
  const publicStatsQuery = useQuery<PublicAnalyticsStats>({
    queryKey: ['home-hero-stats', 'public-stats'],
    queryFn: () => analyticsService.getPublicStats(),
    staleTime: 60_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const publicStats = publicStatsQuery.data;

  const socialLinks = [
    {
      name: 'Telegram',
      href: process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL || 'https://t.me/2xpredict',
      icon: FaTelegram,
    },
    {
      name: 'WhatsApp',
      href:
        process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL ||
        'https://whatsapp.com/channel/xxxxxxxx',
      icon: FaWhatsapp,
    },
    {
      name: 'Facebook',
      href: process.env.NEXT_PUBLIC_FACEBOOK || 'https://facebook.com/2xpredict',
      icon: FaFacebookF,
    },
    {
      name: 'X',
      href: process.env.NEXT_PUBLIC_TWITTER || 'https://x.com/2xpredict',
      icon: FaXTwitter,
    },
    {
      name: 'Instagram',
      href: process.env.NEXT_PUBLIC_INSTAGRAM || 'https://instagram.com/2xpredict',
      icon: FaInstagram,
    },
  ];

  // Keep the original four-card layout and display all eight public counts.
  const liveStats: LiveStat[] = [
    {
      title: 'Market Predictions',
      value: publicStats?.marketsPredicted ?? null,
      secondaryValue: publicStats?.marketsWon ?? null,
      secondaryLabel: 'won',
      icon: FaChartLine,
    },
    {
      title: 'Matches Analysed',
      value: publicStats?.matchesPredicted ?? null,
      secondaryValue: publicStats?.settledMatches ?? null,
      secondaryLabel: 'settled matches',
      icon: FaFutbol,
    },
    {
      title: 'Registered Users',
      value: publicStats?.registeredUsers ?? null,
      secondaryValue: publicStats?.subscribers ?? null,
      secondaryLabel: 'subscribers',
      icon: FaGlobe,
    },
    {
      title: 'Leagues Covered',
      value: publicStats?.activeLeagues ?? null,
      secondaryValue: publicStats?.totalMarkets ?? null,
      secondaryLabel: 'total markets',
      icon: FaGlobe,
    },
  ];

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-background">

      {/* ========================================================
          HERO + OVERLAPPING STATISTICS
      ======================================================== */}

      <div
        className="
          mx-auto
          w-full
          max-w-[2600px]
        "
      >
        <section
          aria-labelledby="hero-heading"
          className="
            relative
            isolate
            h-[50svh]
            min-h-[250px]
            max-h-[300px]
            overflow-hidden
            border
            border-border/40
            bg-slate-950
            shadow-2xl
            shadow-brand-slate/10
          "
        >
          {/* Stadium background */}
          <Image
            src="/hero.png"
            alt=""
            fill
            priority
            sizes="
              (max-width: 640px) 100vw,
              (max-width: 1024px) 100vw,
              1600px
            "
            className="object-cover object-center"
          />

          {/* Readable text overlays */}
          <div
            aria-hidden="true"
            className="
              absolute
              inset-0
              bg-gradient-to-r
              from-[#080912]/95
              via-[#130911]/85
              to-[#130911]/35
            "
          />

          <div
            aria-hidden="true"
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-black/65
              via-transparent
              to-black/10
            "
          />

          {/* Subtle champagne light */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -left-20
              top-1/4
              h-72
              w-72
              rounded-full
              bg-brand-champagne/[0.06]
              blur-3xl
            "
          />

          {/* Social links */}
          <div
            aria-label="Follow 2xPredict"
            className="absolute right-3 top-3 z-30 flex items-center gap-1.5 sm:right-5 sm:top-4 sm:gap-2 lg:right-6"
          >
            {socialLinks.map(({ name, href, icon: Icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow 2xPredict on ${name}`}
                title={name}
                className="group relative inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white/90 backdrop-blur-md transition-all hover:border-brand-champagne/70 hover:bg-white/15 hover:text-brand-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-champagne sm:h-8 sm:w-8"
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                <span
                  role="tooltip"
                  className="pointer-events-none absolute right-0 top-full mt-2 whitespace-nowrap rounded-md border border-white/15 bg-slate-950/95 px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  {name}
                </span>
              </a>
            ))}
          </div>

          {/* Hero content */}
          <div
            className="
              relative
              z-10
              flex
              h-full
              flex-col
              items-start
              gap-1
              px-3
              pt-3
              pb-16
              sm:gap-2
              sm:px-8
              sm:pt-2
              sm:pb-16
              lg:px-10
            "
          >
            <div className="min-w-0 w-full max-w-3xl lg:max-w-none">

              {/* Large logo */}
              <Link
                href="/"
                aria-label="2xPredict home"
                className="
                  group
                  inline-flex
                  max-w-full
                  items-center
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-brand-champagne
                  focus-visible:ring-offset-4
                  focus-visible:ring-offset-slate-950
                "
              >
                <Image
                  src="/logo.png"
                  alt="2xPredict"
                  width={620}
                  height={230}
                  priority
                  className="
                    h-auto
                    w-[min(42vw,170px)]
                    object-contain
                    object-left
                    drop-shadow-[0_8px_28px_rgba(0,0,0,0.45)]
                    transition-transform
                    duration-300
                    group-hover:scale-[1.02]
                    sm:w-[230px]
                    lg:w-[270px]
                  "
                />
              </Link>

              {/* Brand introduction */}
              <div
                className="
                  flex
                  w-fit
                  max-w-full
                  items-center
                  justify-start
                  self-start
                  ml-0
                  mr-auto
                  mt-0
                  text-left
                  gap-1.5
                  rounded-full
                  border
                  border-white/20
                  bg-white/[0.07]
                  px-2
                  py-1
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.17em]
                  text-white/90
                  backdrop-blur-md
                  mt-2
                  sm:mt-0
                  sm:text-xs
                "
              >
                <span
                  aria-hidden="true"
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-brand-champagne
                    shadow-[0_0_12px_rgba(246,233,214,0.75)]
                  "
                />
                Express the Passion. Enjoy Every Moment.
              </div>

              <h1
                id="hero-heading"
                className="
                  mt-3
                  max-w-full
                  text-xl
                  font-black
                  leading-[1.12]
                  tracking-tight
                  text-white
                  lg:relative
                  lg:pr-60
                  sm:mt-2
                  sm:text-2xl
                  lg:text-3xl
                  lg:leading-[1.08]
                "
              >
                See the game.
                <br />
                <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span
                    className="
                      bg-gradient-to-r
                      from-brand-champagne
                      via-[#f3d5a6]
                      to-white
                      bg-clip-text
                      text-transparent
                    "
                  >
                    Read every possibility.
                  </span>
                  <span className="inline-flex flex-wrap items-center gap-1.5 sm:gap-2 lg:absolute lg:right-0 lg:bottom-0 lg:z-20 lg:w-56 lg:flex-col lg:items-stretch lg:gap-2">
{user ? (
                  <>
                    {upgradeAction && (
                      <Link
                        href={upgradeAction.href}
                        className="inline-flex min-h-7 items-center justify-center gap-1 rounded-md bg-brand-burgundy px-2 py-1 text-[9px] sm:text-xs font-bold text-white shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:text-xs lg:min-h-11 lg:w-full lg:px-4 lg:py-2.5 lg:text-sm"
                      >
                        {upgradeAction.label}
                        <FaArrowRight aria-hidden="true" className="h-3 w-3 lg:h-4 lg:w-4" />
                      </Link>
                    )}
                    <Link
                      href="/predictions"
                      className="inline-flex min-h-7 items-center justify-center gap-1 rounded-md border border-white/30 bg-white/[0.09] px-2 py-1 text-[9px] font-semibold sm:text-[11px] text-white backdrop-blur-md transition-all hover:border-brand-champagne/70 hover:bg-white/[0.15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:text-xs lg:min-h-11 lg:w-full lg:px-4 lg:py-2.5 lg:text-sm"
                    >
                      Explore Predictions
                      <FaArrowRight aria-hidden="true" className="h-3 w-3 lg:h-4 lg:w-4" />
                    </Link>
                    <Link
                      href="/bet-lab"
                      className="inline-flex min-h-7 items-center justify-center gap-1 rounded-md border border-white/30 bg-white/[0.09] px-2 py-1 text-[9px] font-semibold sm:text-[11px] text-white backdrop-blur-md transition-all hover:border-brand-champagne/70 hover:bg-white/[0.15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:text-xs lg:min-h-11 lg:w-full lg:px-4 lg:py-2.5 lg:text-sm"
                    >
                      <FaFlask aria-hidden="true" className="h-3 w-3 text-brand-champagne lg:h-4 lg:w-4" />
                      Try Bet Lab
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="inline-flex min-h-7 items-center justify-center gap-1 rounded-md bg-brand-burgundy px-2 py-1 text-[9px] sm:text-xs font-bold text-white shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:text-xs lg:min-h-11 lg:w-full lg:px-4 lg:py-2.5 lg:text-sm"
                    >
                      Register
                      <FaArrowRight aria-hidden="true" className="h-3 w-3" />
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex min-h-7 items-center justify-center rounded-md border border-white/30 bg-white/[0.09] px-2 py-1 text-[9px] font-semibold sm:text-[11px] text-white backdrop-blur-md transition-all hover:border-brand-champagne/70 hover:bg-white/[0.15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:text-xs lg:min-h-11 lg:w-full lg:px-4 lg:py-2.5 lg:text-sm"
                    >
                      Login
                    </Link>
                  </>
                )}
            
                  </span>
                </span>
              </h1>
            </div>

            {/* Responsible-use note positioned above the floating statistics card */}
            <div
              className="
                absolute
                bottom-16
                left-3
                right-3
                z-10
                flex
                items-center
                justify-center
                gap-1.5
                px-0
                text-center
                text-[10px]
                leading-3
                text-white/75
                sm:bottom-16
                sm:left-8
                sm:right-8
                sm:text-xs
                sm:leading-4
              "
            >
              <FaShieldHalved
                aria-hidden="true"
                className="h-3 w-3 shrink-0 text-brand-champagne"
              />
              <span>Football is unpredictable. Predictions are not guarantees. 18+ only.</span>
            </div>
          </div>
        </section>

        {/* ========================================================
            FLOATING LIVE STATISTICS CARD
        ======================================================== */}

        <section
          aria-label="Live platform statistics"
          className="
            relative
            z-20
            mx-auto
            -mt-10
            mb-2
            max-w-6xl
            px-1
            sm:-mt-14
            sm:mb-4
            sm:px-4
            lg:-mt-16
          "
        >
          <div
            className="
              relative
              overflow-hidden
              rounded-xl
              border
              border-border/70
              bg-card/90
              text-card-foreground
              shadow-2xl
              shadow-black/10
              backdrop-blur-2xl
              sm:rounded-3xl
            "
          >
            {/* Glass highlight */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-x-0
                top-0
                h-px
                bg-gradient-to-r
                from-transparent
                via-brand-burgundy/60
                to-transparent
              "
            />

            <div className="grid grid-cols-4">
              {liveStats.map(
                (
                  {
                    title,
                    value,
                    secondaryValue,
                    secondaryLabel,
                    icon: Icon,
                  },
                  index,
                ) => (
                  <div
                    key={title}
                    className={`
                      relative
                      min-w-0
                      px-1
                      py-1.5
                      sm:px-3
                      sm:py-2.5
                      ${
                        index < 3
                          ? 'border-r border-border/70'
                          : ''
                      }
                    `}
                  >
                    <div className="flex min-w-0 items-center gap-1 sm:gap-2">
                      <span
                        className="
                          flex
                          h-4
                          w-4
                          shrink-0
                          sm:h-5
                          sm:w-5
                          items-center
                          justify-center
                          rounded-md
                          bg-brand-burgundy/10
                          text-brand-accent
                        "
                      >
                        <Icon className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
                      </span>

                      <p
                        className="
                          min-w-0
                          text-[8px]
                          font-bold
                          leading-3
                          text-muted-foreground
                          sm:text-xs
                          sm:leading-4
                        "
                      >
                        {title}
                      </p>
                    </div>

                    <p
                      className="
                        mt-0.5
                        text-sm
                        font-black
                        tracking-tight
                        text-foreground
                        sm:mt-1
                        sm:text-3xl
                      "
                      aria-live="polite"
                    >
                      {formatCount(value)}
                    </p>

                    <div
                      className="
                        mt-0.5
                        flex
                        min-w-0
                        flex-wrap
                        items-center
                        gap-x-1
                        gap-y-0
                        border-t
                        border-border/60
                        pt-0.5
                        text-[8px]
                        leading-3
                        sm:mt-1
                        sm:gap-x-1.5
                        sm:gap-y-1
                        sm:pt-1
                        sm:text-xs
                        sm:leading-4
                      "
                    >
                      <span className="font-extrabold text-brand-accent">
                        {formatCount(secondaryValue)}
                      </span>

                      <span className="text-muted-foreground">
                        {secondaryLabel}
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>

            <div
              className="
                border-t
                border-border/60
                px-1.5
                py-1
                text-center
                text-[8px]
                leading-3
                sm:px-3
                sm:text-[10px]
                text-muted-foreground
                sm:text-[11px]
              "
            >
              {publicStatsQuery.isError
                ? 'Platform statistics are temporarily unavailable.'
                : 'Figures are provided by the platform&apos;s available data services.'}
            </div>
          </div>
        </section>
      </div>
      {/* Mount data-heavy sections only as visitors approach them. */}
      <DeferredHomeSection load={loadSettledWins} minHeight={170} label="Settled wins" />
      <DeferredHomeSection load={loadWonSlips} minHeight={210} label="Won slips" />
      <DeferredHomeSection load={loadFixtures} minHeight={360} label="Fixtures" />
      <DeferredHomeSection load={loadStandings} minHeight={340} label="Standings" />
      <DeferredHomeSection load={loadHomePricing} minHeight={220} label="Pricing" />
      <DeferredHomeSection load={loadLatestNews} minHeight={230} label="Latest football news" />
      <DeferredHomeSection load={loadLatestHighlights} minHeight={230} label="Latest football highlights" />
      {/* ========================================================
          ABOUT 2XPREDICT
      ======================================================== */}

      <section
        id="about"
        aria-labelledby="about-heading"
        className="
          relative
          mx-auto
          w-full
          max-w-7xl
          px-3
          pb-8
          pt-3
          sm:px-5
          sm:pb-12
          sm:pt-5
          lg:px-8
          lg:pb-16
        "
      >
        {/* Soft brand lighting that blends into the page */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-36
            top-0
            -z-0
            h-80
            w-80
            rounded-full
            bg-brand-burgundy/[0.055]
            blur-3xl
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -left-40
            top-1/3
            -z-0
            h-72
            w-72
            rounded-full
            bg-brand-slate/[0.045]
            blur-3xl
          "
        />

        <div className="relative z-10 mx-auto max-w-6xl">
          {/* Introduction */}
          <div className="mx-auto max-w-3xl text-center">
            <div
              className="
                mb-1
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-brand-burgundy/15
                bg-brand-burgundy/[0.045]
                px-3
                py-1.5
                text-[10px]
                font-extrabold
                uppercase
                tracking-[0.18em]
                text-brand-accent
                sm:text-xs
              "
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-brand-burgundy"
              />

              Get to know 2xPredict
            </div>

            <h2
              id="about-heading"
              className="
                mx-auto
                max-w-2xl
                text-2xl
                font-black
                leading-tight
                tracking-tight
                text-foreground
                sm:text-3xl
                lg:text-4xl
                lg:leading-[1.15]
              "
            >
              Football is more than the
              <span className="text-brand-accent">
                {' '}final score.
              </span>
            </h2>
          </div>

          {/* About and platform features */}
          <div
            className="
              mt-2
              grid
              gap-2
              sm:mt-4
              sm:gap-3
              lg:mt-4
              lg:grid-cols-[0.92fr_1.08fr]
              lg:items-start
              lg:gap-6
            "
          >
            {/* Our story */}
            <div className="min-w-0">
              <div
                className="
                  relative
                  overflow-hidden
                  rounded-2xl
                  border
                  border-border/70
                  bg-card/70
                  p-3
                  backdrop-blur-sm
                  sm:rounded-3xl
                  sm:p-6
                  lg:p-7
                "
              >
                <div
                  aria-hidden="true"
                  className="
                    absolute
                    inset-x-0
                    top-0
                    h-[2px]
                    bg-gradient-to-r
                    from-transparent
                    via-brand-burgundy/70
                    to-transparent
                  "
                />
                <h3
                  className="
                    text-xl
                    font-extrabold
                    leading-tight
                    tracking-tight
                    text-foreground
                    sm:text-2xl
                  "
                >
                  A better way to follow the game.
                </h3>

                <div className="mt-2 space-y-2 sm:mt-4 sm:space-y-3">
                  <p className="text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-7">
                    At 2xPredict, we believe following football should
                    be an engaging, informed and enjoyable experience.
                    You should be able to check a fixture, explore
                    predictions, catch up on the latest stories and
                    discover what is happening across different leagues
                    without having to jump between several places.
                  </p>

                  <p className="text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-7">
                    That is why we bring daily predictions, match
                    coverage, football news, highlights, curated odds
                    slips and Bet Lab together. Whether you are following
                    your favourite club or discovering another competition,
                    our goal is to make the information easier to find
                    and the experience easier to enjoy.
                  </p>

                  <p className="text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-7">
                    We are here for football fans who want to stay
                    informed, explore the game and make their own
                    decisions with a better understanding of the
                    information available to them.
                  </p>
                </div>

                {/* Brand statement */}
                <div
                  className="
                    mt-3
                    flex
                    items-center
                    gap-3
                    border-t
                    border-border/70
                    pt-3
                    sm:pt-4
                  "
                >
                  <div
                    aria-hidden="true"
                    className="h-9 w-1 shrink-0 rounded-full bg-brand-burgundy"
                  />

                  <div>
                    <p className="text-sm font-extrabold text-foreground">
                      Express the Passion. Enjoy Every Moment.
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                      Football insights. Better decisions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Explore calls to action */}
              <div
                className="
                  mt-3
                  flex
                  flex-wrap
                  items-center
                  gap-3
                  sm:mt-5
                "
              >
                <Link
                  href="/predictions"
                  className="
                    inline-flex
                    min-h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-brand-burgundy
                    px-4
                    py-2.5
                    text-sm
                    font-bold
                    text-white
                    shadow-sm
                    shadow-brand-burgundy/15
                    transition-all
                    hover:-translate-y-0.5
                    hover:brightness-110
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-brand-accent
                    focus-visible:ring-offset-2
                  "
                >
                  Explore Predictions

                  <FaArrowRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                  />
                </Link>

                <Link
                  href="/bet-lab"
                  className="
                    inline-flex
                    min-h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-border
                    bg-background/60
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-foreground
                    transition-colors
                    hover:border-brand-burgundy/30
                    hover:bg-brand-burgundy/5
                    hover:text-brand-accent
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-brand-accent
                    focus-visible:ring-offset-2
                  "
                >
                  Discover Bet Lab

                  <FaArrowRight
                    aria-hidden="true"
                    className="h-3 w-3"
                  />
                </Link>
              </div>
            </div>

            {/* What users can explore */}
            <div className="min-w-0">
              <div className="mb-2 flex items-end justify-between gap-3 sm:mb-4">
                <div>
                  <p
                    className="
                      text-[10px]
                      font-extrabold
                      uppercase
                      tracking-[0.16em]
                      text-brand-accent
                      sm:text-xs
                    "
                  >
                    Everything in one place
                  </p>

                  <h3
                    className="
                      mt-1.5
                      text-xl
                      font-extrabold
                      tracking-tight
                      text-foreground
                      sm:text-2xl
                    "
                  >
                    What you will find here
                  </h3>
                </div>

                <span
                  aria-hidden="true"
                  className="
                    hidden
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-border/70
                    bg-card/70
                    text-brand-accent
                    sm:flex
                  "
                >
                  <FaArrowRight className="h-4 w-4" />
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                {aboutFeatures.map(
                  (
                    {
                      title,
                      description,
                      href,
                      icon: Icon,
                      label,
                    },
                    index,
                  ) => (
                    <Link
                      key={title}
                      href={href}
                      className={`
                        group
                        relative
                        min-w-0
                        overflow-hidden
                        rounded-2xl
                        border
                        border-border/70
                        bg-card/60
                        p-2.5
                        transition-all
                        duration-200
                        hover:-translate-y-0.5
                        hover:border-brand-burgundy/30
                        hover:bg-card
                        hover:shadow-md
                        hover:shadow-brand-burgundy/[0.04]
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-brand-accent
                        sm:p-4
                        ${index === aboutFeatures.length - 1 ? 'sm:col-span-2' : ''}
                      `}
                    >
                      <div
                        aria-hidden="true"
                        className="
                          absolute
                          inset-x-0
                          top-0
                          h-[2px]
                          origin-left
                          scale-x-0
                          bg-brand-burgundy/70
                          transition-transform
                          duration-200
                          group-hover:scale-x-100
                        "
                      />

                      <div className="flex items-start gap-3">
                        <span
                          className="
                            inline-flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-brand-burgundy/10
                            text-brand-accent
                            transition-colors
                            group-hover:bg-brand-burgundy
                            group-hover:text-white
                          "
                        >
                          <Icon className="h-4 w-4" />
                        </span>

                        <div className="min-w-0 flex-1">
                          <p
                            className="
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-wider
                              text-muted-foreground
                            "
                          >
                            {label}
                          </p>

                          <h4
                            className="
                              mt-1
                              text-base
                              font-extrabold
                              tracking-tight
                              text-foreground
                              transition-colors
                              group-hover:text-brand-accent
                            "
                          >
                            {title}
                          </h4>
                        </div>

                        <FaArrowRight
                          aria-hidden="true"
                          className="
                            mt-1
                            h-3
                            w-3
                            shrink-0
                            text-muted-foreground/60
                            transition-all
                            group-hover:translate-x-0.5
                            group-hover:text-brand-accent
                          "
                        />
                      </div>

                      <p className="mt-2 text-[11px] leading-4 text-muted-foreground sm:text-sm sm:leading-6">
                        {description}
                      </p>
                    </Link>
                  ),
                )}
              </div>

              {/* Responsible platform note */}
              <div
                className="
                  mt-4
                  flex
                  items-start
                  gap-3
                  rounded-2xl
                  border
                  border-brand-burgundy/15
                  bg-brand-burgundy/[0.035]
                  p-4
                "
              >
                <span
                  className="
                    mt-0.5
                    inline-flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-brand-burgundy/10
                    text-brand-accent
                  "
                >
                  <FaShieldHalved className="h-4 w-4" />
                </span>

                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-foreground">
                    Information, not guarantees.
                  </h4>

                  <p className="mt-1 text-xs leading-6 text-muted-foreground sm:text-sm">
                    Football is unpredictable. Our predictions and
                    odds slips cannot guarantee outcomes. Use the
                    information responsibly, and remember that
                    betting is for adults aged 18 and above only.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
