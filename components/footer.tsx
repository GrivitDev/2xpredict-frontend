'use client';

import Image from 'next/image';
import Link from 'next/link';

import { ArrowUpRight } from 'lucide-react';

import {
  FaFacebookF,
  FaXTwitter,
  FaTelegram,
} from 'react-icons/fa6';

import { useAuth } from '@/providers/auth-provider';

/* ============================================================================
   NAVIGATION
============================================================================ */

const explore = [
  { name: 'Home', href: '/' },
  { name: 'Live Scores', href: '/live-scores' },
  { name: 'Articles', href: '/articles' },
  { name: 'Pricing', href: '/pricing' },
];

const company = [
  { name: 'About Us', href: '/about' },
  { name: 'Contact', href: '/about#contact' },
];

const legal = [
  { name: 'Privacy Policy', href: '/privacy-policy' },
  {
    name: 'Terms & Conditions',
    href: '/terms-and-conditions',
  },
];

/* ============================================================================
   SOCIALS
============================================================================ */

const socials = [
  {
    name: 'X',
    icon: FaXTwitter,
    href: process.env.NEXT_PUBLIC_TWITTER || '#',
  },
  {
    name: 'Facebook',
    icon: FaFacebookF,
    href: process.env.NEXT_PUBLIC_FACEBOOK || '#',
  },
  {
    name: 'Telegram',
    icon: FaTelegram,
    href: process.env.NEXT_PUBLIC_TELEGRAM || '#',
  },
];

/* ============================================================================
   FOOTER
============================================================================ */

export default function Footer() {
  const { user } = useAuth();

  const exploreLinks = user
    ? [
        ...explore,
        {
          name: 'Dashboard',
          href:
            user.role === 'admin'
              ? '/admin'
              : '/dashboard',
        },
      ]
    : explore;

  return (
    <footer
      className="
        relative
        overflow-hidden
        border-t
        border-border/50
        bg-background
      "
    >
      {/* BACKGROUND */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >
        <div
          className="
            absolute
            left-1/2
            top-0
            h-[420px]
            w-[900px]
            -translate-x-1/2
            rounded-full
            bg-primary/[0.045]
            blur-[130px]
            dark:bg-primary/[0.08]
          "
        />

        <div
          className="
            absolute
            right-[-160px]
            top-[180px]
            h-[400px]
            w-[400px]
            rounded-full
            bg-gold/[0.035]
            blur-[120px]
            dark:bg-gold/[0.06]
          "
        />

        <div
          className="
            absolute
            inset-0
            opacity-[0.018]
          "
          style={{
            backgroundImage: `
              linear-gradient(to right,currentColor 1px,transparent 1px),
              linear-gradient(to bottom,currentColor 1px,transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* MAIN CONTAINER */}

      <div
        className="
          relative
          mx-auto
          max-w-[1500px]
          px-4
          py-6
          sm:px-6
          sm:py-8
          lg:px-8
          lg:py-10
        "
      >
        {/* BRAND STATEMENT */}

        <div
          className="
            relative
            overflow-hidden
            rounded-[28px]
            border
            border-border/60
            bg-card/40
            px-3
            py-3
            shadow-xl
            shadow-black/[0.03]
            backdrop-blur-2xl
            sm:px-2
            sm:py-2
            lg:px-2
            lg:py-3
          "
        >
          <div
            className="
              absolute
              inset-x-0
              top-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-gold/70
              to-transparent
            "
          />

          <div
            className="
              flex
              flex-col-reverse
              items-center
              gap-3
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            {/* BRAND STATEMENT */}

            <div
              className="
                flex
                w-full
                justify-center
                lg:ml-10
                lg:w-auto
                lg:justify-end
              "
            >
              <div
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  border
                  border-gold/20
                  bg-gold/[0.06]
                  px-3
                  py-1.5
                  shadow-sm
                  shadow-gold/5
                  backdrop-blur-md
                  sm:gap-3
                  sm:px-4
                  sm:py-2
                "
              >
                <span
                  className="
                    h-1.5
                    w-1.5
                    shrink-0
                    rounded-full
                    bg-gold
                    shadow-[0_0_10px_rgba(234,179,8,0.7)]
                  "
                />

                <span className="text-[9px] font-black uppercase tracking-[0.14em] text-foreground sm:text-[10px] sm:tracking-[0.18em]">
                  We Analyze
                </span>

                <span className="text-gold">•</span>

                <span className="text-[9px] font-black uppercase tracking-[0.14em] text-foreground sm:text-[10px] sm:tracking-[0.18em]">
                  We Predict
                </span>

                <span className="text-gold">•</span>

                <span className="text-[9px] font-black uppercase tracking-[0.14em] text-gold sm:text-[10px] sm:tracking-[0.18em]">
                  You WIN
                </span>
              </div>
            </div>

            {/* BRAND */}

            <Link
              href="/"
              className="
                group
                inline-flex
                w-fit
                items-center
                gap-1
                lg:mr-30
              "
            >
              <div
                className="
                  relative
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-xl
                  border
                  border-border/70
                  bg-background
                  shadow-lg
                  transition-all
                  duration-300
                  group-hover:border-gold/40
                  group-hover:shadow-gold/10
                  sm:h-13
                  sm:w-13
                "
              >
                <Image
                  src="/logo.png"
                  alt="2xpredict"
                  width={56}
                  height={56}
                  priority
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <div
                  className="
                    text-lg
                    font-black
                    tracking-[-0.04em]
                    text-foreground
                    sm:text-xl
                  "
                >
                  2xpredict
                </div>

                <div
                  className="
                    mt-0.5
                    text-[8px]
                    font-semibold
                    uppercase
                    tracking-[0.25em]
                    text-gold
                  "
                >
                  Bet With Confidence
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* CONTENT GRID */}

        <div
          className="
            mt-5
            grid
            gap-6
            sm:grid-cols-2
            lg:mt-8
            lg:grid-cols-[1.5fr_1fr_1fr_1.4fr]
            lg:gap-10
          "
        >
          {/* ABOUT */}

          <div>
            <p
              className="
                max-w-sm
                text-s
                leading-6
                text-muted-foreground
              "
            >
              Follow the game with sharper insights,
              live coverage, premium predictions and
              carefully curated football analysis.
            </p>

            <Link
              href="/about"
              className="
                group
                mt-3
                inline-flex
                items-center
                gap-2
                text-s
                font-semibold
                text-foreground
                transition-colors
                hover:text-primary
              "
            >
              Discover 2xpredict

              <ArrowUpRight
                className="
                  h-4
                  w-4
                  transition-transform
                  duration-300
                  group-hover:-translate-y-0.5
                  group-hover:translate-x-0.5
                "
              />
            </Link>
          </div>

          {/* MOBILE NAVIGATION GROUP */}

          <div
            className="
              grid
              grid-cols-2
              gap-6
              lg:contents
            "
          >
            <FooterColumn
              title="Explore"
              items={exploreLinks}
            />

            <FooterColumn
              title="Company"
              items={company}
            />
          </div>

          {/* PREMIUM */}

          <div className="hidden lg:block">
            <div
              className="
                relative
                -mt-4
                overflow-hidden
                rounded-2xl
                border
                border-gold/15
                bg-gradient-to-br
                from-gold/[0.08]
                via-card/50
                to-primary/[0.04]
                p-3
                shadow-lg
              "
            >
              <div
                className="
                  absolute
                  -right-10
                  -top-10
                  h-28
                  w-28
                  rounded-full
                  bg-gold/10
                  blur-3xl
                "
              />

              <div
                className="
                  relative
                  flex
                  items-center
                  justify-between
                "
              >
                <span
                  className="
                    rounded-full
                    border
                    border-gold/20
                    bg-gold/10
                    px-2.5
                    py-1
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-gold
                  "
                >
                  Premium
                </span>

                <span className="text-xs text-muted-foreground">
                  VIP
                </span>
              </div>

              <h3
                className="
                  relative
                  mt-3
                  text-lg
                  font-bold
                  tracking-tight
                  text-foreground
                "
              >
                Go beyond ordinary predictions.
              </h3>

              <p
                className="
                  relative
                  mt-2
                  text-s
                  leading-5
                  text-muted-foreground
                "
              >
                Unlock premium predictions,
                exclusive insights and deeper match
                analysis.
              </p>

              <Link
                href="/pricing"
                className="
                  group
                  relative
                  mt-4
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-gold/25
                  bg-gold
                  px-3.5
                  py-2
                  text-xs
                  font-bold
                  text-background
                  transition-all
                  duration-300
                  hover:-translate-y-px
                  hover:bg-gold/90
                "
              >
                View Plans

                <ArrowUpRight
                  className="
                    h-3.5
                    w-3.5
                    transition-transform
                    duration-300
                    group-hover:-translate-y-0.5
                    group-hover:translate-x-0.5
                  "
                />
              </Link>
            </div>
          </div>
        </div>

        {/* DIVIDER */}

        <div
          className="
            my-2
            h-px
            bg-gradient-to-r
            from-transparent
            via-border
            to-transparent
          "
        />

        {/* BOTTOM AREA */}

        <div
          className="
            flex
            flex-col
            gap-4
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          {/* LEGAL + COPYRIGHT */}

          <div className="flex flex-col gap-2">
            <div
              className="
                flex
                flex-wrap
                items-center
                gap-x-4
                gap-y-1
              "
            >
              {legal.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="
                    text-xs
                    font-medium
                    text-muted-foreground
                    transition-colors
                    hover:text-foreground
                  "
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div
              className="
                flex
                flex-wrap
                items-center
                gap-x-3
                text-xs
                text-muted-foreground
              "
            >
              <span>© 2026 2xpredict</span>
              <span>•</span>
              <span>All rights reserved.</span>
            </div>
          </div>

          {/* DEVELOPER */}

          <div
            className="
              text-xs
              leading-5
              text-muted-foreground
              lg:text-center
            "
          >
            <p>
              Designed & Developed by{' '}
              <a
                href="https://wa.me/2348164580712?text=Hello%20GrivitDev,%20I%20would%20like%20to%20know%20more%20about%20your%20website%20development%20services."
                target="_blank"
                rel="noopener noreferrer"
                className="
                  font-semibold
                  text-foreground
                  transition-colors
                  hover:text-primary
                "
              >
                GrivitDev
              </a>
            </p>

            <p className="text-[11px]">
              Digital experiences built with precision.
            </p>
          </div>

          {/* SOCIALS */}

          <div className="flex items-center gap-1.5">
            {socials.map(
              ({ name, icon: Icon, href }) => (
                <Link
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  title={name}
                  className="
                    group
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-border/70
                    bg-card/40
                    text-muted-foreground
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:border-gold/30
                    hover:bg-secondary
                    hover:text-foreground
                  "
                >
                  <Icon
                    className="
                      h-3.5
                      w-3.5
                      transition-transform
                      duration-300
                      group-hover:scale-110
                    "
                  />
                </Link>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================================
   FOOTER COLUMN
============================================================================ */

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: {
    name: string;
    href: string;
  }[];
}) {
  return (
    <div>
      <div
        className="
          mb-1
          flex
          items-center
          gap-1
        "
      >
        <span className="h-px w-4 bg-gold/70" />

        <h3
          className="
            text-[11px]
            font-bold
            uppercase
            tracking-[0.2em]
            text-foreground
          "
        >
          {title}
        </h3>
      </div>

      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="
                group
                inline-flex
                items-center
                text-s
                text-muted-foreground
                transition-colors
                duration-200
                hover:text-foreground
              "
            >
              <span>{item.name}</span>

              <ArrowUpRight
                className="
                  ml-1
                  h-3
                  w-3
                  -translate-x-1
                  translate-y-1
                  opacity-0
                  transition-all
                  duration-200
                  group-hover:translate-x-0
                  group-hover:translate-y-0
                  group-hover:opacity-100
                "
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}