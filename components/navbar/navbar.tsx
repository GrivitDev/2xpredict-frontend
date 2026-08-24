'use client';

import Image from 'next/image';
import Link from 'next/link';

import {
  Mail,
} from 'lucide-react';

import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaTelegram,
} from 'react-icons/fa6';

import NavLinks from './NavLinks';
import ThemeSwitcher from './ThemeSwitcher';
import UserMenu from './UserMenu';
import MobileMenu from './MobileMenu';

export default function Navbar() {
  return (
    <>
      {/* ======================================================================
          NAVBAR
      ======================================================================= */}

      <header
        className="
          fixed
          inset-x-0
          top-0
          z-50

          px-2
          pt-2

          sm:px-4
          sm:pt-3
        "
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
              relative
              flex
              min-h-17
              items-center
              justify-between
              overflow-hidden

              rounded-2xl

              border
              border-border

              bg-background/95

              px-3

              shadow-lg
              shadow-black/5

              backdrop-blur-xl

              supports-[backdrop-filter]:bg-background/85

              sm:min-h-20
              sm:px-5

              lg:px-7
            "
          >

            {/* ================================================================
                PREMIUM BACKGROUND LIGHT
            ================================================================= */}

            <div
              className="
                pointer-events-none
                absolute
                inset-0

                bg-[radial-gradient(circle_at_50%_-80%,rgb(22_139_255_/_12%),transparent_45%)]

                dark:bg-[radial-gradient(circle_at_50%_-80%,rgb(22_139_255_/_18%),transparent_45%)]
              "
            />

            {/* Gold bottom accent */}

            <div
              className="
                pointer-events-none
                absolute
                bottom-0
                left-1/2

                h-px

                w-40

                -translate-x-1/2

                bg-gradient-to-r
                from-transparent
                via-gold
                to-transparent

                opacity-70

                sm:w-56
              "
            />

            {/* ================================================================
                MOBILE LEFT CONTROLS

                Hamburger
                +
                Dashboard/User
            ================================================================= */}

            <div
              className="
                relative
                z-30

                flex
                items-center
                gap-1

                lg:hidden
              "
            >

              {/* Hamburger */}
              <div className="flex items-center m-2">
                <MobileMenu />
              </div>
              {/* Dashboard / Account */}

              <div className="ml-3 flex items-center">
                <UserMenu />
              </div>

            </div>


            {/* ================================================================
                DESKTOP LEFT NAVIGATION
            ================================================================= */}

            <div
              className="
                relative
                z-10

                hidden
                min-w-0
                flex-1
                items-center

                lg:flex
              "
            >
              <NavLinks />
            </div>


            {/* ================================================================
                BRAND

                Mobile:
                Slightly right of center

                Desktop:
                Perfectly centered
            ================================================================= */}

            <Link
              href="/"
              aria-label="2xpredict home"
                className="
                  group
                  relative
                  z-20
                  flex
                  items-center
                  gap-1
                  rounded-xl
                  px-1
                  py-1
                  transition-transform
                  duration-200

                  ml-auto
                  mr-8

                  sm:mr-8

                  lg:absolute
                  lg:left-1/2
                  lg:top-1/2
                  lg:ml-0
                  lg:mr-0
                  lg:-translate-x-1/2
                  lg:-translate-y-1/2

                  hover:scale-[1.02]
                "
            >

              {/* ==============================================================
                  LOGO
              ============================================================== */}

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
                  border-border/60

                  bg-card/80

                  shadow-md

                  transition-all
                  duration-300

                  sm:h-14
                  sm:w-14

                  lg:h-15
                  lg:w-15

                  group-hover:border-gold/50

                  group-hover:shadow-lg
                  group-hover:shadow-gold/10
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


              {/* ==============================================================
                  BRAND NAME
              ============================================================== */}

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


            {/* ================================================================
                DESKTOP RIGHT SIDE

                Social
                Contact
                Theme
                Dashboard
            ================================================================= */}

            <div
              className="
                relative
                z-10

                hidden

                flex-1

                items-center
                justify-end

                gap-1

                lg:flex

                sm:gap-2
              "
            >

              {/* ==============================================================
                  SOCIAL MEDIA
              ============================================================== */}

              <div
                className="
                  flex
                  items-center
                  gap-0.5
                "
              >

                {/* Instagram */}

                <Link
                  href="#"
                  aria-label="Instagram"
                  className="
                    flex
                    h-9
                    w-9

                    items-center
                    justify-center

                    rounded-lg

                    text-muted-foreground

                    transition-all
                    duration-200

                    hover:-translate-y-px

                    hover:bg-secondary

                    hover:text-foreground
                  "
                >
                  <FaInstagram className="h-4 w-4" />
                </Link>


                {/* Facebook */}

                <Link
                  href="#"
                  aria-label="Facebook"
                  className="
                    flex
                    h-9
                    w-9

                    items-center
                    justify-center

                    rounded-lg

                    text-muted-foreground

                    transition-all
                    duration-200

                    hover:-translate-y-px

                    hover:bg-secondary

                    hover:text-foreground
                  "
                >
                  <FaFacebookF className="h-4 w-4" />
                </Link>


                {/* Telegram */}

                <Link
                  href="#"
                  aria-label="Telegram"
                  className="
                    flex
                    h-9
                    w-9

                    items-center
                    justify-center

                    rounded-lg

                    text-muted-foreground

                    transition-all
                    duration-200

                    hover:-translate-y-px

                    hover:bg-secondary

                    hover:text-foreground
                  "
                >
                  <FaTelegram className="h-4 w-4" />
                </Link>


                {/* X */}

                <Link
                  href="#"
                  aria-label="X"
                  className="
                    flex
                    h-9
                    w-9

                    items-center
                    justify-center

                    rounded-lg

                    text-muted-foreground

                    transition-all
                    duration-200

                    hover:-translate-y-px

                    hover:bg-secondary

                    hover:text-foreground
                  "
                >
                  <FaXTwitter className="h-4 w-4" />
                </Link>

              </div>


              {/* ==============================================================
                  CONTACT
              ============================================================== */}

              <Link
                href="/contact"
                aria-label="Contact us"
                title="Contact us"
                className="
                  flex
                  h-9
                  w-9

                  items-center
                  justify-center

                  rounded-lg

                  border
                  border-border

                  bg-card

                  text-muted-foreground

                  shadow-sm

                  transition-all
                  duration-200

                  hover:-translate-y-px

                  hover:border-gold/40

                  hover:bg-secondary

                  hover:text-foreground

                  hover:shadow-md
                "
              >
                <Mail className="h-4 w-4" />
              </Link>


              {/* ==============================================================
                  ACCOUNT CONTROLS
              ============================================================== */}

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


      {/* ======================================================================
          PAGE SPACER

          Keeps page content below the fixed navbar.
      ======================================================================= */}

      <div
        className="
          h-20

          sm:h-22
        "
      />
    </>
  );
}