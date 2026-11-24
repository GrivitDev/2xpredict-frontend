'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import type { IconType } from 'react-icons';
import {
  FaArrowRightFromBracket,
  FaBell,
  FaCreditCard,
  FaMoon,
  FaRightToBracket,
  FaShieldHalved,
  FaSun,
  FaUser,
  FaUserPlus,
  FaUsers,
} from 'react-icons/fa6';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useAuth } from '@/providers/auth-provider';

export default function UserMenu() {
  const { user, logout, loading } = useAuth();

  const isAdmin = user?.role === 'admin';

  const displayName = String(
    (user as any)?.fullName ?? (user as any)?.username ?? 'My account',
  );

  const email = String((user as any)?.email ?? '');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          title="Account"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center border-0 bg-transparent p-0 text-[var(--chrome-foreground)] shadow-none outline-none transition-transform duration-200 hover:scale-110 hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--chrome-accent)]/75 focus-visible:ring-offset-0"
        >
          <FaUser
            className="block h-[18px] w-[18px] shrink-0"
            aria-hidden="true"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="z-[9999] w-[260px] rounded-xl border border-border/70 bg-popover p-1.5 text-popover-foreground shadow-xl"
      >
        <div className="rounded-lg bg-primary/10 px-3 py-3">
          <p className="truncate text-xs font-bold">
            {loading
              ? 'Loading account…'
              : user
                ? displayName
                : 'Your 2xPredict account'}
          </p>

          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {loading
              ? 'Please wait'
              : user
                ? email || (isAdmin ? 'Administrator' : '2xPredict member')
                : 'Sign in to access your account'}
          </p>
        </div>

        {loading ? null : user ? (
          <>
            <AccountLink
              href="/notifications"
              icon={FaBell}
              label="Notifications"
            />

            {isAdmin ? (
              <AccountLink
                href="/admin"
                icon={FaShieldHalved}
                label="Admin dashboard"
              />
            ) : (
              <>
                <AccountLink
                  href="/profile"
                  icon={FaUser}
                  label="Profile"
                />

                <AccountLink
                  href="/subscriptions"
                  icon={FaCreditCard}
                  label="Subscriptions"
                />

                <AccountLink
                  href="/referrals"
                  icon={FaUsers}
                  label="Referrals"
                />
              </>
            )}

            <DropdownMenuSeparator className="my-1 bg-border/70" />

            <DropdownMenuItem
              onSelect={() => {
                void logout();
              }}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-destructive outline-none focus:bg-destructive/10 focus:text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive"
            >
              <FaArrowRightFromBracket
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              Sign out
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <AccountLink
              href="/login"
              icon={FaRightToBracket}
              label="Sign in"
            />

            <AccountLink
              href="/register"
              icon={FaUserPlus}
              label="Create an account"
            />
          </>
        )}

        <DropdownMenuSeparator className="my-1 bg-border/70" />

        <ThemeMenuItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ThemeMenuItem() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';
  const nextTheme = isDark ? 'light' : 'dark';
  const Icon = isDark ? FaSun : FaMoon;

  return (
    <DropdownMenuItem
      onSelect={() => setTheme(nextTheme)}
      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium outline-none focus:bg-muted data-[highlighted]:bg-muted"
    >
      <Icon
        className="h-3.5 w-3.5 text-brand-accent"
        aria-hidden="true"
      />

      <span>
        Switch to {nextTheme} theme
      </span>
    </DropdownMenuItem>
  );
}

function AccountLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: IconType;
  label: string;
}) {
  return (
    <DropdownMenuItem
      asChild
      className="cursor-pointer rounded-lg px-2.5 py-2 outline-none focus:bg-muted data-[highlighted]:bg-muted"
    >
      <Link href={href} className="flex w-full items-center gap-2.5 text-xs font-medium">
        <Icon
          className="h-3.5 w-3.5 text-brand-accent"
          aria-hidden="true"
        />

        <span className="flex-1">{label}</span>
      </Link>
    </DropdownMenuItem>
  );
}
