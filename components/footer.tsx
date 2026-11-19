'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  FaArrowRight,
  FaCrown,
  FaCircle,
  FaRightToBracket,
  FaUserPlus,
  FaFacebookF,
  FaInstagram,
  FaTelegram,
  FaXTwitter,
} from 'react-icons/fa6';

import { useAuth } from '@/providers/auth-provider';

type FooterPlan = 'free' | 'regular' | 'vip' | 'premium';

type SubscriptionRecord = {
  plan?: string;
  tier?: string;
  status?: string;
  expiresAt?: string;
  expiryDate?: string;
  endDate?: string;
};

type UserRecord = {
  plan?: string;
  subscriptionPlan?: string;
  subscription?: SubscriptionRecord | null;
  subscriptionExpiryDate?: string;
  expiryDate?: string;
};

const socials = [
  {
    name: 'Facebook',
    href: process.env.NEXT_PUBLIC_FACEBOOK,
    icon: FaFacebookF,
  },
  {
    name: 'X',
    href: process.env.NEXT_PUBLIC_TWITTER,
    icon: FaXTwitter,
  },
  {
    name: 'Instagram',
    href: process.env.NEXT_PUBLIC_INSTAGRAM,
    icon: FaInstagram,
  },
  {
    name: 'Telegram',
    href: process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL,
    icon: FaTelegram,
  },
].filter((social) => Boolean(social.href && social.href !== '#'));

function getFooterPlan(user: unknown): FooterPlan {
  if (!user || typeof user !== 'object') {
    return 'free';
  }

  const account = user as UserRecord;
  const subscription = account.subscription;

  const rawPlan =
    subscription?.plan ??
    subscription?.tier ??
    account.plan ??
    account.subscriptionPlan ??
    'free';

  const plan = String(rawPlan).trim().toLowerCase();

  const inactiveStatuses = [
    'expired',
    'inactive',
    'failed',
    'rejected',
    'suspended',
  ];

  const subscriptionStatus = String(
    subscription?.status ?? '',
  ).toLowerCase();

  if (inactiveStatuses.includes(subscriptionStatus)) {
    return 'free';
  }

  const expiry =
    subscription?.expiryDate ??
    subscription?.expiresAt ??
    subscription?.endDate ??
    account.subscriptionExpiryDate ??
    account.expiryDate;

  if (expiry) {
    const expiryTime = new Date(expiry).getTime();

    if (
      Number.isFinite(expiryTime) &&
      expiryTime <= Date.now()
    ) {
      return 'free';
    }
  }

  if (plan === 'regular') return 'regular';
  if (plan === 'vip') return 'vip';
  if (plan === 'premium') return 'premium';

  return 'free';
}

const primaryButtonClass = `
  inline-flex
  min-h-9
  items-center
  justify-center
  gap-1.5
  rounded-lg
  bg-primary
  px-3.5
  py-2
  text-xs
  sm:min-h-11
  sm:gap-2
  sm:rounded-xl
  sm:px-5
  sm:py-2.5
  sm:text-sm
  font-bold
  text-primary-foreground
  shadow-md
  shadow-primary/15
  transition-all
  duration-200
  hover:-translate-y-0.5
  hover:brightness-110
  hover:shadow-lg
  hover:shadow-primary/20
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-primary
  focus-visible:ring-offset-2
  focus-visible:ring-offset-background
`;

const secondaryButtonClass = `
  inline-flex
  min-h-9
  items-center
  justify-center
  gap-1.5
  rounded-lg
  border
  border-border
  bg-background
  px-3.5
  py-2
  text-xs
  sm:min-h-11
  sm:gap-2
  sm:rounded-xl
  sm:px-5
  sm:py-2.5
  sm:text-sm
  font-semibold
  text-foreground
  transition-all
  duration-200
  hover:border-primary/40
  hover:bg-primary/5
  hover:text-primary
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-primary
  focus-visible:ring-offset-2
  focus-visible:ring-offset-background
`;

export default function Footer() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const isAdmin = pathname.startsWith('/admin');
  const plan = getFooterPlan(user);

  return (
    <footer
      aria-label="Site footer"
      className={`
        relative
        isolate
        w-full
        shrink-0
        overflow-hidden
        border-t
        border-border
        bg-background
        text-foreground
        ${
          isAdmin
            ? 'pb-0'
            : 'pb-[calc(6rem_+_env(safe-area-inset-bottom))] lg:pb-0'
        }
      `}
    >
      {/* Subtle brand accent */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-[2px]
          bg-gradient-to-r
          from-transparent
          via-primary
          to-transparent
        "
      />

      {/* Restrained slate and burgundy surface accents */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-28
          top-12
          -z-10
          h-56
          w-56
          rounded-full
          bg-primary/5
          blur-3xl
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-24
          bottom-20
          -z-10
          h-48
          w-48
          rounded-full
          bg-muted/40
          blur-3xl
        "
      />

      <div className="relative mx-auto w-full max-w-[1440px] px-3 sm:px-5 lg:px-8">

        {/* Copyright and Terms of Use */}
        <div
          className="
            flex
            min-h-10
            items-center
            justify-between
            gap-2
            border-b
            border-border/80
            py-2
          "
        >
          <p className="whitespace-nowrap text-[10px] font-medium text-muted-foreground sm:text-xs">
            © {new Date().getFullYear()} 2xPredict. All rights reserved.
          </p>

          <Link
            href="/terms-of-use"
            className="
              inline-flex
              shrink-0
              items-center
              gap-1.5
              text-[10px]
              font-semibold
              text-foreground
              underline-offset-4
              transition-colors
              hover:text-primary
              hover:underline
              sm:text-xs
            "
          >
            Terms of Use
            <FaArrowRight aria-hidden="true" className="h-2.5 w-2.5" />
          </Link>
        </div>

        {/* Brand identity */}
        <section
          aria-label="About 2xPredict"
          className="
            relative
            flex
            flex-col
            items-center
            justify-center
            gap-1.5
            py-1
            text-center
          "
        >
          {/* Social links — right side of the main footer content */}
          {socials.length > 0 && (
            <nav
              aria-label="Social media links"
              className="
                flex
                shrink-0
                items-center
                justify-end
                gap-0.5
                self-end
                lg:absolute
                lg:right-0
                lg:top-8
              "
            >
              {socials.map(({ name, href, icon: Icon }) => {
                if (!href) return null;

                return (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow 2xPredict on ${name}`}
                    title={name}
                    className="
                      inline-flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      text-muted-foreground
                      transition-all
                      duration-200
                      hover:bg-primary/10
                      hover:text-primary
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-primary
                    "
                  >
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </a>
                );
              })}
            </nav>
          )}

          {/* Centered logo and caption */}
          <div
            className="
              mx-auto
              flex
              w-fit
              max-w-full
              flex-row
              items-center
              justify-center
              gap-1
              sm:gap-4
            "
          >
            <Link
              href="/"
              aria-label="2xPredict home"
              className="
                group
                flex
                shrink-0
                items-center
                no-underline
              "
            >
              <Image
                src="/logo.png"
                alt="2xPredict logo"
                width={92}
                height={142}
                priority={false}
                className="
                  h-[70px]
                  w-[158px]
                  shrink-0
                  object-contain
                  transition-transform
                  duration-200
                  group-hover:scale-[1.03]
                  sm:h-[80px]
                  sm:w-[172px]
                "
              />
            </Link>

            <div
              aria-hidden="true"
              className="
                h-11
                w-px
                shrink-0
                sm:h-14
                bg-gradient-to-b
                from-transparent
                via-border
                to-transparent
              "
            />

            <div className="min-w-0 text-left">
              <p
                className="
                  text-sm
                  font-bold
                  leading-tight
                  tracking-tight
                  text-foreground
                  sm:text-lg
                "
              >
                Express the Passion. <br />
                <span className="text-primary">
                  {' '}Enjoy Every Moment.
                </span>
              </p>
            </div>
          </div>

          {/* Account and subscription action */}
          <div
            className="
              flex
              w-full
              flex-col
              items-center
              gap-2
              sm:gap-3
            "
          >
            {loading ? (
              <div
                role="status"
                className="
                  flex
                  min-h-9
                  items-center
                  gap-1.5
                  rounded-lg
                  border
                  border-border
                  bg-background
                  px-3
                  text-xs
                  sm:min-h-11
                  sm:gap-2
                  sm:rounded-xl
                  sm:px-5
                  sm:text-sm
                  text-muted-foreground
                "
              >
                <span
                  aria-hidden="true"
                  className="
                    h-3.5
                    w-3.5
                    animate-spin
                    rounded-full
                    border-2
                    border-primary/25
                    border-t-primary
                  "
                />
                Checking account...
              </div>
            ) : !user ? (
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <Link
                  href="/register"
                  className={primaryButtonClass}
                >
                  <FaUserPlus
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                  />
                  Register Now

                  <FaArrowRight
                    aria-hidden="true"
                    className="h-3 w-3"
                  />
                </Link>

                <Link
                  href="/login"
                  className={secondaryButtonClass}
                >
                  <FaRightToBracket
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                  />
                  Log In
                </Link>
              </div>
            ) : plan === 'free' ? (
              <>
                <Link
                  href="/pricing"
                  className={primaryButtonClass}
                >
                  <FaCrown
                    aria-hidden="true"
                    className="h-4 w-4"
                  />
                  Subscribe Now

                  <FaArrowRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                  />
                </Link>

                <p className="text-xs text-muted-foreground">
                  Unlock more of the 2xPredict experience.
                </p>
              </>
            ) : plan === 'regular' ? (
              <>
                <Link
                  href="/pricing"
                  className={primaryButtonClass}
                >
                  <FaCrown
                    aria-hidden="true"
                    className="h-4 w-4"
                  />
                  Upgrade to VIP

                  <FaArrowRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                  />
                </Link>

                <p className="text-xs text-muted-foreground">
                  Take your football insights to the next level.
                </p>
              </>
            ) : plan === 'vip' ? (
              <>
                <Link
                  href="/pricing"
                  className={primaryButtonClass}
                >
                  <FaCrown
                    aria-hidden="true"
                    className="h-4 w-4"
                  />
                  Upgrade to Premium

                  <FaArrowRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                  />
                </Link>

                <p className="text-xs text-muted-foreground">
                  Discover the full Premium experience.
                </p>
              </>
            ) : (
              <div
                className="
                  inline-flex
                  max-w-full
                  items-center
                  gap-1
                  rounded-2xl
                  border
                  border-primary/20
                  bg-primary/5
                  px-2
                  py-1
                  text-left
                "
              >
                <span
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-primary/10
                    text-primary
                    sm:h-10
                    sm:w-10
                    sm:rounded-xl
                  "
                >
                  <FaCrown
                    aria-hidden="true"
                    className="h-4 w-4 sm:h-5 sm:w-5"
                  />
                </span>

                <div>
                  <p className="text-xs font-bold text-foreground sm:text-sm">
                    Enjoy your Premium experience.
                  </p>

                  <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground sm:text-xs">
                    Thank you for being part of 2xPredict.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Compact design and development credit */}
        <div className="flex flex-wrap items-center justify-center gap-x-1 text-center text-[10px] leading-4 text-muted-foreground sm:gap-x-1.5 sm:text-xs">
          <span>Designed &amp; developed by</span>
          <span className="font-semibold text-foreground">GrivitTech</span>
          <span aria-hidden="true" className="text-border">|</span>
          <a
            href="https://www.grivittech.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit www.grivittech.com"
            className="font-semibold text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            www.grivittech.com
          </a>
        </div>
        </section>

        {/* Responsible gambling notice */}
        <section
          aria-labelledby="responsible-gambling-heading"
          className="
            border-t
            border-border
            py-1
            sm:py-1.5
          "
        >
          <div
            className="
              mx-auto
              flex
              w-full
              max-w-7xl
              flex-col
              items-center
              gap-0.5
              text-center
            "
          >
            <div className="max-w-6xl space-y-0.5">
              <p
                className="
                  text-xs
                  font-bold
                  leading-4
                  text-foreground
                  sm:text-sm
                  sm:leading-5
                "
              >
                18+ Only. 2XPREDICT is for adults aged 18 and above.
              </p>

              <p
                className="
                  text-[10px]
                  leading-4
                  text-muted-foreground
                  sm:text-xs
                  sm:leading-5
                "
              >
                Betting can be harmful and psychologically dangerous.
              </p>
            </div>

            <div
              className="
                inline-flex
                items-center
                text-[10px]
                font-bold
                leading-4
                text-primary
                sm:text-xs
              "
            >
              <FaCircle
                aria-hidden="true"
                className="h-1.5 w-1.5"
              />

              Gamble wisely. Your wellbeing comes first.
            </div>
          </div>
        </section>
      </div>
    </footer>
  );
}