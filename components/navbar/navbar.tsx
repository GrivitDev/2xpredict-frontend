'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  motion,
  useScroll,
  useMotionValueEvent,
} from 'framer-motion';
import {
  useState,
} from 'react';

import NavLinks from './NavLinks';
import ThemeSwitcher from './ThemeSwitcher';
import UserMenu from './UserMenu';
import MobileMenu from './MobileMenu';
import {
  useNavbar,
} from './NavbarContext';



export default function Navbar() {
  const { scrollY } = useScroll();

const {
  visible,
  setVisible,
} = useNavbar();

  const [lastScroll, setLastScroll] =
    useState(0);

  useMotionValueEvent(
    scrollY,
    'change',
    (latest) => {
      if (latest < 30) {
        setVisible(true);
        setLastScroll(latest);
        return;
      }

      if (latest > lastScroll) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      setLastScroll(latest);
    },
  );

return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{
          y: visible ? 0 : -120,
        }}
        transition={{
          duration: 0.28,
          ease: 'easeOut',
        }}
        className="
          fixed
          inset-x-0
          top-0
          z-50
          px-3
          pt-3
          sm:px-5
        "
      >
        <div
          className="
            mx-auto
            max-w-7xl
          "
        >
          <div
className="
  flex
  h-16
  items-center
  justify-between
  rounded-4xl

  border
  border-emerald-500/80

  bg-background/80

  px-4

  shadow-lg
  shadow-emerald-500/10

  backdrop-blur-2xl
  supports-[backdrop-filter]:bg-background/65

  sm:px-6
"
          >
            {/* Logo */}

            <Link
              href="/"
              className="
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-xl
                  border
                  border-border
                  bg-muted/40
                "
              >
                <Image
                  src="/logo.png"
                  alt="PredictPro"
                  width={40}
                  height={40}
                  priority
                />
              </div>

              <div className="hidden sm:block">
                <p
                  className="
                    text-lg
                    font-bold
                    tracking-tight
                    text-foreground
                  "
                >
                  PredictPro
                </p>

                <p
                  className="
                    text-xs
                    text-muted-foreground
                  "
                >
                  Football Predictions
                </p>
              </div>
            </Link>

<div
className="
  hidden
  lg:flex

  items-center

  rounded-4xl

  border
  border-blue-400/70

  bg-gradient-to-r
  from-blue-500/10
  via-cyan-500/10
  to-blue-500/10

  backdrop-blur-xl

  p-1

  shadow-lg
  shadow-blue-500/15
"
>
  <NavLinks />
</div>

            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <div
                className="
                  hidden
                  lg:flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-border
                  bg-muted/40
                  px-2
                  py-1
                "
              >
                <ThemeSwitcher />
                <UserMenu />
              </div>

              <div className="lg:hidden">
                <MobileMenu />
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Spacer */}
      <div className="h-20" />
    </>
  );
}