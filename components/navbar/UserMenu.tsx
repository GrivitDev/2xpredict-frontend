'use client';

import Link from 'next/link';

import {
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  LogIn,
  LogOut,
  ReceiptText,
  ShieldCheck,
  Trophy,
  UserCog,
  UserPlus,
  UserRound,
  UsersRound,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Button } from '@/components/ui/button';

import { useAuth } from '@/providers/auth-provider';


// ============================================================
// TYPES
// ============================================================

type MenuTone =
  | 'gold'
  | 'blue'
  | 'green'
  | 'purple'
  | 'rose'
  | 'amber';


// ============================================================
// MENU DATA
// ============================================================

const USER_MENU_ITEMS = [
  {
    href: '/dashboard/predictions',
    icon: Trophy,
    tone: 'blue' as const,
    title: 'My Predictions',
    description: 'View your prediction history',
  },
  {
    href: '/dashboard/purchases',
    icon: ReceiptText,
    tone: 'green' as const,
    title: 'My Purchases',
    description: 'Your prediction purchases',
  },
  {
    href: '/dashboard/subscriptions',
    icon: CreditCard,
    tone: 'purple' as const,
    title: 'My Subscriptions',
    description: 'Manage your plan',
  },
  {
    href: '/dashboard/referrals',
    icon: UsersRound,
    tone: 'rose' as const,
    title: 'My Referrals',
    description: 'Invite and earn rewards',
  },
  {
    href: '/dashboard/profile',
    icon: UserCog,
    tone: 'amber' as const,
    title: 'Profile',
    description: 'Personal account settings',
  },
] as const;


// ============================================================
// COMPONENT
// ============================================================

export default function UserMenu() {

  const {
    user,
    logout,
    loading,
  } = useAuth();


  if (loading) {
    return null;
  }


  const isAdmin =
    user?.role === 'admin';

  const dashboard =
    isAdmin
      ? '/admin'
      : '/dashboard';


  // ==========================================================
  // GUEST
  // ==========================================================

  if (!user) {
    return (
      <>
        {/* DESKTOP */}

        <div
          className="
            hidden
            items-center
            gap-1.5
            lg:flex
          "
        >
          <Link
            href="/login"
            className="
              flex
              h-10
              items-center
              rounded-xl
              px-3
              text-s
              font-semibold
              text-foreground
              transition-all
              duration-200
              hover:bg-secondary
              hover:text-foreground
            "
          >
            Login
          </Link>

          <Link
            href="/register"
            className="
              group
              relative
              flex
              h-10
              items-center
              overflow-hidden
              rounded-xl
              border
              border-primary/30
              bg-primary
              px-4
              text-s
              font-bold
              text-primary-foreground
              shadow-md
              shadow-primary/15
              transition-all
              duration-300
              hover:-translate-y-px
              hover:shadow-lg
              hover:shadow-primary/20
            "
          >
            <span
              className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-r
                from-white/0
                via-white/15
                to-white/0
                opacity-0
                transition-opacity
                duration-300
                group-hover:opacity-100
              "
            />

            <span className="relative z-10">
              Register
            </span>

            <span
              className="
                absolute
                bottom-0
                left-1/2
                h-0.5
                w-7
                -translate-x-1/2
                rounded-full
                bg-gold
              "
            />
          </Link>
        </div>


        {/* MOBILE */}

        <div className="lg:hidden">
          <DropdownMenu>

            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Account"
                className="
                  group
                  relative
                  h-10
                  w-10
                  rounded-xl
                  border
                  border-border
                  bg-card
                  text-foreground
                  shadow-sm
                  transition-all
                  duration-300
                  hover:border-gold/40
                  hover:bg-secondary
                  hover:text-foreground
                  hover:shadow-md
                  focus-visible:ring-gold/40
                "
              >
                <span
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-gold/25
                    bg-gold/10
                    text-gold
                    transition-all
                    duration-300
                    group-hover:border-gold/50
                    group-hover:bg-gold/15
                  "
                >
                  <UserRound className="h-4 w-4" />
                </span>

                <span
                  className="
                    absolute
                    bottom-0
                    left-1/2
                    h-0.5
                    w-5
                    -translate-x-1/2
                    rounded-full
                    bg-gold
                    opacity-70
                  "
                />
              </Button>
            </DropdownMenuTrigger>


            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="
                w-[230px]
                overflow-hidden
                rounded-2xl
                border
                border-border
                bg-popover
                p-2
                text-popover-foreground
                shadow-2xl
                shadow-black/10
                dark:shadow-black/40
              "
            >

              {/* HEADER */}

              <div
                className="
                  relative
                  mb-1
                  overflow-hidden
                  rounded-xl
                  border
                  border-border
                  bg-secondary/60
                  px-3
                  py-3
                "
              >
                <div
                  className="
                    pointer-events-none
                    absolute
                    -right-8
                    -top-8
                    h-20
                    w-20
                    rounded-full
                    bg-gold/10
                    blur-2xl
                  "
                />

                <div
                  className="
                    relative
                    flex
                    items-center
                    gap-3
                  "
                >
                  <span
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      border
                      border-gold/25
                      bg-gold/10
                      text-gold
                    "
                  >
                    <UserRound className="h-4 w-4" />
                  </span>

                  <div className="min-w-0">
                    <p className="text-s font-bold text-foreground">
                      My Account
                    </p>

                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Sign in or create an account
                    </p>
                  </div>
                </div>
              </div>


              <GuestMenuItem
                href="/login"
                icon={LogIn}
                tone="blue"
                title="Login"
                description="Access your account"
              />

              <GuestMenuItem
                href="/register"
                icon={UserPlus}
                tone="gold"
                title="Register"
                description="Create your account"
                gold
              />

            </DropdownMenuContent>

          </DropdownMenu>
        </div>
      </>
    );
  }


  // ==========================================================
  // AUTHENTICATED USER
  // ==========================================================

  return (
    <DropdownMenu>

      {/* TRIGGER */}

      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          aria-label={
            isAdmin
              ? 'Admin dashboard menu'
              : 'Dashboard menu'
          }
          className="
            group
            relative
            h-10
            gap-2
            rounded-xl
            border
            border-border
            bg-card
            px-2
            text-foreground
            shadow-sm
            transition-all
            duration-300
            hover:border-gold/40
            hover:bg-secondary
            hover:text-foreground
            hover:shadow-md
            focus-visible:ring-gold/40
            sm:px-2.5
          "
        >

          <span
            className="
              relative
              flex
              h-7
              w-7
              items-center
              justify-center
              overflow-hidden
              rounded-lg
              border
              border-gold/25
              bg-gold/10
              text-gold
              transition-all
              duration-300
              group-hover:border-gold/50
              group-hover:bg-gold/15
            "
          >
            {isAdmin ? (
              <ShieldCheck className="h-3.5 w-3.5" />
            ) : (
              <UserRound className="h-3.5 w-3.5" />
            )}
          </span>

          <span
            className="
              hidden
              text-s
              font-bold
              tracking-tight
              text-foreground
              sm:inline
            "
          >
            {isAdmin
              ? 'Admin'
              : 'Dashboard'}
          </span>

          <ChevronDown
            className="
              h-3.5
              w-3.5
              text-muted-foreground
              transition-all
              duration-300
              group-data-[state=open]:rotate-180
              group-hover:text-foreground
            "
          />

          <span
            className="
              absolute
              bottom-0
              left-1/2
              h-0.5
              w-6
              -translate-x-1/2
              rounded-full
              bg-gold
              opacity-60
              transition-all
              duration-300
              group-hover:w-10
              group-hover:opacity-100
            "
          />

        </Button>
      </DropdownMenuTrigger>


      {/* DROPDOWN */}

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="
          w-[290px]
          overflow-hidden
          rounded-2xl
          border
          border-border
          bg-popover
          p-0
          text-popover-foreground
          shadow-2xl
          shadow-black/10
          dark:shadow-black/40
        "
      >

        {/* HEADER */}

        <div
          className="
            relative
            overflow-hidden
            border-b
            border-border
            bg-secondary/70
            px-4
            py-4
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              -right-10
              -top-12
              h-32
              w-32
              rounded-full
              bg-gold/10
              blur-3xl
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-10
              -left-8
              h-24
              w-24
              rounded-full
              bg-primary/10
              blur-2xl
            "
          />

          <div
            className="
              absolute
              bottom-0
              left-0
              h-px
              w-28
              bg-gradient-to-r
              from-gold
              via-gold/40
              to-transparent
            "
          />

          <div className="relative flex items-center gap-3">

            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-gold/30
                bg-gold/10
                text-gold
                shadow-sm
              "
            >
              {isAdmin ? (
                <ShieldCheck className="h-5 w-5" />
              ) : (
                <UserRound className="h-5 w-5" />
              )}
            </div>

            <div className="min-w-0">
              <p
                className="
                  truncate
                  text-s
                  font-bold
                  text-foreground
                "
              >
                {isAdmin
                  ? 'Administrator'
                  : 'My Account'}
              </p>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-muted-foreground
                "
              >
                {isAdmin
                  ? 'Platform management'
                  : '2xpredict member'}
              </p>
            </div>

          </div>
        </div>


        {/* MENU */}

        <div className="p-2">

          <DashboardItem
            href={dashboard}
            icon={
              isAdmin
                ? ShieldCheck
                : LayoutDashboard
            }
            tone="gold"
            title="Dashboard"
            description={
              isAdmin
                ? 'Manage platform'
                : 'Your overview'
            }
          />

          {!isAdmin &&
            USER_MENU_ITEMS.map(item => (
              <DashboardItem
                key={item.href}
                {...item}
              />
            ))}

        </div>


        {/* LOGOUT */}

        <DropdownMenuSeparator className="mx-2 bg-border" />

        <div className="p-2">
          <DropdownMenuItem
            onClick={logout}
            className="
              group
              cursor-pointer
              rounded-xl
              p-2
              outline-none
              text-destructive
              transition-all
              duration-200
              hover:bg-destructive/10
              focus:bg-destructive/10
              data-[highlighted]:bg-destructive/10
              data-[highlighted]:text-destructive
            "
          >
            <span
              className="
                mr-3
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                bg-destructive/10
                text-destructive
                transition-transform
                duration-200
                group-hover:scale-105
              "
            >
              <LogOut className="h-4 w-4" />
            </span>

            <span className="font-semibold">
              Logout
            </span>
          </DropdownMenuItem>
        </div>

      </DropdownMenuContent>

    </DropdownMenu>
  );
}


// ============================================================
// GUEST MENU ITEM
// ============================================================

function GuestMenuItem({
  href,
  icon,
  tone,
  title,
  description,
  gold = false,
}: {
  href: string;
  icon: React.ElementType;
  tone: MenuTone;
  title: string;
  description: string;
  gold?: boolean;
}) {
  return (
    <DropdownMenuItem
      asChild
      className={`
        group
        cursor-pointer
        rounded-xl
        p-2
        outline-none
        transition-all
        duration-200
        ${
          gold
            ? `
              hover:bg-gold/10
              focus:bg-gold/10
              data-[highlighted]:bg-gold/10
            `
            : `
              hover:bg-secondary
              focus:bg-secondary
              data-[highlighted]:bg-secondary
            `
        }
        data-[highlighted]:text-foreground
      `}
    >
      <Link
        href={href}
        className="
          flex
          w-full
          items-center
          gap-3
        "
      >
        <MenuIcon
          icon={icon}
          tone={tone}
        />

        <div className="min-w-0 flex-1">
          <span
            className="
              block
              text-s
              font-semibold
              text-foreground
            "
          >
            {title}
          </span>

          <span
            className="
              block
              text-[11px]
              text-muted-foreground
            "
          >
            {description}
          </span>
        </div>

        <ChevronDown
          className="
            h-3.5
            w-3.5
            -rotate-90
            text-muted-foreground
            opacity-0
            transition-all
            group-hover:translate-x-0.5
            group-hover:opacity-100
          "
        />
      </Link>
    </DropdownMenuItem>
  );
}


// ============================================================
// DASHBOARD ITEM
// ============================================================

function DashboardItem({
  href,
  icon,
  tone,
  title,
  description,
}: {
  href: string;
  icon: React.ElementType;
  tone: MenuTone;
  title: string;
  description: string;
}) {
  return (
    <DropdownMenuItem
      asChild
      className="
        group
        cursor-pointer
        rounded-xl
        p-2
        outline-none
        transition-all
        duration-200
        hover:bg-secondary
        focus:bg-secondary
        data-[highlighted]:bg-secondary
        data-[highlighted]:text-foreground
      "
    >
      <Link
        href={href}
        className="
          flex
          w-full
          items-center
          gap-3
        "
      >
        <MenuIcon
          icon={icon}
          tone={tone}
        />

        <div className="min-w-0 flex-1">
          <span
            className="
              block
              text-s
              font-semibold
              text-foreground
            "
          >
            {title}
          </span>

          <span
            className="
              hidden
              text-[11px]
              text-muted-foreground
              sm:block
            "
          >
            {description}
          </span>
        </div>

        <ChevronDown
          className="
            h-3.5
            w-3.5
            -rotate-90
            text-muted-foreground
            opacity-0
            transition-all
            group-hover:translate-x-0.5
            group-hover:opacity-100
          "
        />
      </Link>
    </DropdownMenuItem>
  );
}


// ============================================================
// MENU ICON
// ============================================================

function MenuIcon({
  icon: Icon,
  tone,
}: {
  icon: React.ElementType;
  tone: MenuTone;
}) {

  const toneClasses: Record<MenuTone, string> = {
    gold: `
      bg-gold/10
      text-gold
      border-gold/15
      group-hover:bg-gold/15
      group-hover:border-gold/30
    `,

    blue: `
      bg-primary/10
      text-primary
      border-primary/15
      group-hover:bg-primary/15
      group-hover:border-primary/30
    `,

    green: `
      bg-emerald-500/10
      text-emerald-600
      border-emerald-500/15
      dark:text-emerald-400
      group-hover:bg-emerald-500/15
    `,

    purple: `
      bg-violet-500/10
      text-violet-600
      border-violet-500/15
      dark:text-violet-400
      group-hover:bg-violet-500/15
    `,

    rose: `
      bg-rose-500/10
      text-rose-600
      border-rose-500/15
      dark:text-rose-400
      group-hover:bg-rose-500/15
    `,

    amber: `
      bg-amber-500/10
      text-amber-600
      border-amber-500/15
      dark:text-amber-400
      group-hover:bg-amber-500/15
    `,
  };

  return (
    <span
      className={`
        flex
        h-9
        w-9
        shrink-0
        items-center
        justify-center
        rounded-lg
        border
        transition-all
        duration-200
        ${toneClasses[tone]}
      `}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}