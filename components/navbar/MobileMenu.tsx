'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  usePathname,
  useRouter,
} from 'next/navigation';

import {
  ChevronRight,
  Handshake,
  Home,
  Info,
  LogOut,
  Menu,
  Sparkles,
} from 'lucide-react';

import {
  FaFacebookF,
  FaTelegram,
  FaXTwitter,
} from 'react-icons/fa6';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';

import ThemeSwitcher from './ThemeSwitcher';


// ============================================================
// PUBLIC LINKS
// ============================================================

const PUBLIC_LINKS = [
  {
    name: 'Home',
    href: '/',
    icon: Home,
  },
  {
    name: 'Community',
    href: '/community',
    icon: Handshake,
  },
  {
    name: 'Pricing',
    href: '/pricing',
    icon: Handshake,
  },
  {
    name: 'Contact',
    href: '/about',
    icon: Info,
  },
] as const;


// ============================================================
// COMPONENT
// ============================================================

export default function MobileMenu() {
  const pathname = usePathname();
  const router = useRouter();

  const {
    user,
    logout,
  } = useAuth();


  // ==========================================================
  // ACTIVE LINK
  // ==========================================================

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };


  // ==========================================================
  // LINK CLASS
  // ==========================================================

  const linkClass = (active: boolean) =>
    `
      group
      relative
      flex
      items-center
      gap-3
      overflow-hidden
      rounded-xl
      border
      px-3.5
      py-3
      text-s
      font-semibold
      transition-all
      duration-200

      ${
        active
          ? `
            border-primary/20
            bg-primary/10
            text-foreground
            shadow-sm
          `
          : `
            border-transparent
            text-muted-foreground
            hover:border-border
            hover:bg-secondary
            hover:text-foreground
          `
      }
    `;


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };


  return (
    <div className="lg:hidden">

      <Sheet>

        {/* =====================================================
            TRIGGER
        ===================================================== */}

        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open navigation menu"
            className="
              relative
              h-10
              w-10
              overflow-hidden
              rounded-xl
              border
              border-border
              bg-card
              text-foreground
              shadow-sm
              transition-all
              duration-200
              hover:border-primary/30
              hover:bg-secondary
              hover:text-foreground
            "
          >
            <Menu className="relative z-10 h-5 w-5" />

            <span
              className="
                pointer-events-none
                absolute
                bottom-0
                left-1/2
                h-0.5
                w-5
                -translate-x-1/2
                rounded-full
                bg-gold
              "
            />
          </Button>
        </SheetTrigger>


        {/* =====================================================
            SHEET
        ===================================================== */}

        <SheetContent
          side="right"
          className="
            flex
            w-[min(88vw,380px)]
            flex-col
            overflow-hidden
            border-l
            border-border
            bg-background
            p-0
            text-foreground
            shadow-2xl
            shadow-black/20
            dark:bg-background
            dark:shadow-black/50
          "
        >

          {/* Decorative background */}

          <div
            className="
              pointer-events-none
              absolute
              -right-24
              -top-24
              h-72
              w-72
              rounded-full
              bg-primary/10
              blur-3xl
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -left-32
              top-[38%]
              h-64
              w-64
              rounded-full
              bg-gold/5
              blur-3xl
            "
          />


          {/* ===================================================
              HEADER
          =================================================== */}

          <SheetHeader
            className="
              relative
              border-b
              border-border
              bg-card
              px-5
              pb-5
              pt-6
              text-left
            "
          >
            <SheetTitle asChild>
              <Link
                href="/"
                className="
                  group
                  flex
                  items-center
                  gap-3
                  text-left
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
                    border-primary/20
                    bg-background
                    shadow-md
                    transition-transform
                    duration-200
                    group-hover:scale-105
                  "
                >
                  <Image
                    src="/logo.png"
                    alt="2xpredict"
                    width={48}
                    height={48}
                    priority
                    className="h-full w-full object-cover"
                  />

                  <span
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      rounded-xl
                      ring-1
                      ring-inset
                      ring-white/10
                    "
                  />
                </div>


                <div className="min-w-0">

                  <p
                    className="
                      text-xl
                      font-black
                      tracking-[-0.04em]
                      text-foreground
                    "
                  >
                    2xpredict
                  </p>

                  <div
                    className="
                      mt-1
                      flex
                      items-center
                      gap-1.5
                    "
                  >
                    <span
                      className="
                        h-1.5
                        w-1.5
                        rounded-full
                        bg-gold
                        shadow-[0_0_8px_rgb(214_168_79_/_60%)]
                      "
                    />

                    <p
                      className="
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.18em]
                        text-muted-foreground
                      "
                    >
                      Bet With Confidence
                    </p>
                  </div>

                </div>

              </Link>
            </SheetTitle>

            <div
              className="
                absolute
                bottom-0
                left-5
                h-px
                w-20
                bg-gradient-to-r
                from-gold
                to-transparent
              "
            />
          </SheetHeader>


          {/* ===================================================
              CONTENT
          =================================================== */}

          <div
            className="
              relative
              flex-1
              overflow-y-auto
              px-4
              py-5
              scrollbar-hide
            "
          >

            {/* =================================================
                EXPLORE
            ================================================= */}

            <section>

              <div
                className="
                  mb-3
                  flex
                  items-center
                  justify-between
                  px-2
                "
              >
                <div className="flex items-center gap-2">

                  <Sparkles
                    className="
                      h-3.5
                      w-3.5
                      text-gold
                    "
                  />

                  <p
                    className="
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.2em]
                      text-muted-foreground
                    "
                  >
                    Explore
                  </p>

                </div>
              </div>


              <div className="space-y-1">

                {PUBLIC_LINKS.map((link) => {

                  const Icon = link.icon;
                  const active = isActive(link.href);

                  return (
                    <SheetClose
                      asChild
                      key={link.href}
                    >
                      <Link
                        href={link.href}
                        className={linkClass(active)}
                      >

                        {active && (
                          <span
                            className="
                              absolute
                              inset-y-2
                              left-0
                              w-0.5
                              rounded-full
                              bg-gold
                            "
                          />
                        )}

                        <span
                          className={`
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            transition-all
                            duration-200

                            ${
                              active
                                ? `
                                  bg-primary
                                  text-primary-foreground
                                  shadow-sm
                                `
                                : `
                                  bg-secondary
                                  text-muted-foreground
                                  group-hover:bg-primary/10
                                  group-hover:text-primary
                                `
                            }
                          `}
                        >
                          <Icon className="h-4 w-4" />
                        </span>


                        <span className="flex-1">
                          {link.name}
                        </span>


                        <ChevronRight
                          className={`
                            h-4
                            w-4
                            transition-all
                            duration-200

                            ${
                              active
                                ? `
                                  text-primary
                                  opacity-100
                                `
                                : `
                                  text-muted-foreground/40
                                  opacity-0
                                  group-hover:translate-x-0.5
                                  group-hover:opacity-100
                                `
                            }
                          `}
                        />

                      </Link>
                    </SheetClose>
                  );
                })}

              </div>

            </section>


            {/* =================================================
                APPEARANCE
            ================================================= */}

            <section className="mt-7">

              <div
                className="
                  mb-3
                  flex
                  items-center
                  gap-2
                  px-2
                "
              >
                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-primary
                  "
                />

                <p
                  className="
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.2em]
                    text-muted-foreground
                  "
                >
                  Appearance
                </p>
              </div>


              <div
                className="
                  rounded-xl
                  border
                  border-border
                  bg-card
                  p-2
                  shadow-sm
                "
              >
                <ThemeSwitcher />
              </div>

            </section>

          </div>


          {/* ===================================================
              FOOTER
          =================================================== */}

          <div
            className="
              relative
              border-t
              border-border
              bg-card
              px-4
              pb-5
              pt-4
            "
          >

            {/* Authentication */}

            {!user ? (

              <div className="grid grid-cols-2 gap-2">

                <SheetClose asChild>
                  <Link
                    href="/login"
                    className="
                      flex
                      h-11
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-border
                      bg-background
                      text-s
                      font-bold
                      text-foreground
                      transition-all
                      hover:border-primary/30
                      hover:bg-secondary
                    "
                  >
                    Login
                  </Link>
                </SheetClose>


                <SheetClose asChild>
                  <Link
                    href="/register"
                    className="
                      relative
                      flex
                      h-11
                      items-center
                      justify-center
                      overflow-hidden
                      rounded-xl
                      bg-primary
                      text-s
                      font-bold
                      text-primary-foreground
                      shadow-md
                      shadow-primary/15
                      transition-all
                      hover:-translate-y-px
                      hover:shadow-lg
                    "
                  >
                    <span className="relative z-10">
                      Register
                    </span>

                    <span
                      className="
                        absolute
                        bottom-0
                        left-1/2
                        h-0.5
                        w-8
                        -translate-x-1/2
                        rounded-full
                        bg-gold
                      "
                    />
                  </Link>
                </SheetClose>

              </div>

            ) : (

              <Button
                onClick={handleLogout}
                className="
                  h-11
                  w-full
                  rounded-xl
                  bg-destructive
                  font-bold
                  text-destructive-foreground
                  shadow-sm
                  hover:bg-destructive/90
                "
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>

            )}


            {/* Social Media */}

            <div
              className="
                mt-4
                flex
                items-center
                justify-center
                gap-2
                border-t
                border-border
                pt-4
              "
            >

              <p
                className="
                  mr-1
                  hidden
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-muted-foreground
                  xs:block
                "
              >
                Follow
              </p>


              <SocialLink
                href={process.env.NEXT_PUBLIC_FACEBOOK || '#'}
                label="Facebook"
                className="
                  hover:border-[#1877F2]/30
                  hover:bg-[#1877F2]/10
                  hover:text-[#1877F2]
                "
              >
                <FaFacebookF className="h-3.5 w-3.5" />
              </SocialLink>


              <SocialLink
                href={process.env.NEXT_PUBLIC_TWITTER || '#'}
                label="X"
                className="
                  hover:border-foreground/30
                  hover:bg-secondary
                  hover:text-foreground
                "
              >
                <FaXTwitter className="h-3.5 w-3.5" />
              </SocialLink>


              <SocialLink
                href={process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL || '#'}
                label="Telegram"
                className="
                  hover:border-[#229ED9]/30
                  hover:bg-[#229ED9]/10
                  hover:text-[#229ED9]
                "
              >
                <FaTelegram className="h-4 w-4" />
              </SocialLink>

            </div>

          </div>

        </SheetContent>

      </Sheet>

    </div>
  );
}


// ============================================================
// SOCIAL LINK
// ============================================================

function SocialLink({
  href,
  label,
  className,
  children,
}: {
  href: string;
  label: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-lg
        border
        border-border
        bg-background
        text-muted-foreground
        transition-all
        duration-200
        ${className}
      `}
    >
      {children}
    </Link>
  );
}