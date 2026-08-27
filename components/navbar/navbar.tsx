'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useNavbar } from './NavbarContext';

import {
  FaFacebookF,
  FaTelegram,
  FaXTwitter,
} from 'react-icons/fa6';

import NavLinks from './NavLinks';
import ThemeSwitcher from './ThemeSwitcher';
import UserMenu from './UserMenu';
import MobileMenu from './MobileMenu';

// ============================================================
// NAVBAR
// ============================================================

export default function Navbar() {
  const { visible } = useNavbar();

  
  return (
    <>
      {/* ============================================================
          NAVBAR
      ============================================================ */}

      <header
        className={`
          fixed
          inset-x-0
          top-0
          z-50
          px-2
          pt-2
          sm:px-4
          sm:pt-3
          transition-transform
          duration-300
          ease-out
          ${
            visible
              ? 'translate-y-0'
              : '-translate-y-[calc(100%+1rem)]'
          }
        `}
      >
        <div
          className="
            mx-auto
            w-full
            max-w-[1440px]
          "
        >
          <div
            className="
              flex
              min-h-17
              items-center
              justify-between
              rounded-2xl
              border
              border-border
              bg-background/95
              px-3
              shadow-lg
              shadow-black/5
              sm:min-h-20
              sm:px-5
              lg:px-7
            "
          >
            {/* ========================================================
                MOBILE CONTROLS
            ======================================================== */}

            <div
              className="
                flex
                items-center
                gap-1
                lg:hidden
              "
            >
              <div className="m-2 flex items-center">
                <MobileMenu />
              </div>

              <div className="ml-3 flex items-center">
                <UserMenu />
              </div>
            </div>

            {/* ========================================================
                DESKTOP NAVIGATION
            ======================================================== */}

            <div
              className="
                hidden
                min-w-0
                flex-1
                items-center
                lg:flex
              "
            >
              <NavLinks />
            </div>

            {/* ========================================================
                BRAND
            ======================================================== */}

            <Link
              href="/"
              aria-label="2xpredict home"
              className="
                group
                relative
                z-20
                ml-auto
                mr-8
                flex
                items-center
                gap-1
                rounded-xl
                px-1
                py-1
                sm:mr-8
                lg:absolute
                lg:left-1/2
                lg:top-1/2
                lg:ml-0
                lg:mr-0
                lg:-translate-x-1/2
                lg:-translate-y-1/2
              "
            >
              {/* LOGO */}

              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-xl
                  border
                  border-border/60
                  bg-card
                  shadow-md
                  sm:h-14
                  sm:w-14
                  lg:h-15
                  lg:w-15
                "
              >
                <Image
                  src="/logo.png"
                  alt="2xpredict"
                  width={60}
                  height={60}
                  priority
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                />
              </div>

              {/* BRAND NAME */}

              <div
                className="
                  flex
                  flex-col
                  leading-none
                "
              >
                <span
                  className="
                    text-base
                    font-extrabold
                    tracking-[-0.035em]
                    text-foreground
                    sm:text-lg
                    lg:text-xl
                  "
                >
                  2xpredict
                </span>

                <span
                  className="
                    mt-1
                    text-[7px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-gold
                    sm:text-[8px]
                  "
                >
                  Bet With Confidence
                </span>
              </div>
            </Link>

            {/* ========================================================
                DESKTOP RIGHT SIDE
            ======================================================== */}

            <div
              className="
                hidden
                flex-1
                items-center
                justify-end
                gap-1
                lg:flex
                sm:gap-2
              "
            >
              {/* SOCIAL */}

              <div
                className="
                  flex
                  items-center
                  gap-0.5
                "
              >
                <Link
                  href={
                    process.env.NEXT_PUBLIC_FACEBOOK || '#'
                  }
                  aria-label="Facebook"
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    text-muted-foreground
                    hover:bg-secondary
                    hover:text-foreground
                  "
                >
                  <FaFacebookF className="h-4 w-4" />
                </Link>

                <Link
                  href={
                    process.env
                      .NEXT_PUBLIC_TELEGRAM_CHANNEL || '#'
                  }
                  aria-label="Telegram"
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    text-muted-foreground
                    hover:bg-secondary
                    hover:text-foreground
                  "
                >
                  <FaTelegram className="h-4 w-4" />
                </Link>

                <Link
                  href={
                    process.env.NEXT_PUBLIC_TWITTER || '#'
                  }
                  aria-label="X"
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    text-muted-foreground
                    hover:bg-secondary
                    hover:text-foreground
                  "
                >
                  <FaXTwitter className="h-4 w-4" />
                </Link>
              </div>

              {/* ACCOUNT CONTROLS */}

              <div
                className="
                  flex
                  items-center
                  gap-1
                  border-l
                  border-border
                  pl-2
                "
              >
                <ThemeSwitcher />
                <UserMenu />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================
          PAGE SPACER
      ============================================================ */}

      <div
        aria-hidden="true"
        className="
          h-[5.25rem]
          sm:h-24
        "
      />
    </>
  );
}