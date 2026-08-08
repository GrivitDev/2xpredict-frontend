'use client';

import { useState } from 'react';

import Link from 'next/link';
import Image from 'next/image';

import { usePathname, useRouter } from 'next/navigation';

import {
  LayoutDashboard,
  TrendingUp,
  ShoppingCart,
  Gift,
  User,
  LogOut,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

import { useAuth } from '@/providers/auth-provider';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function DashboardSidebar({
  open,
  onClose,
}: Props) {
  const pathname = usePathname();

  const router = useRouter();

  const { logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);

  const links = [
    {
      title: 'Overview',

      items: [
        {
          name: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
        },
      ],
    },

    {
      title: 'Predictions',

      items: [
        {
          name: 'My Predictions',
          href: '/dashboard/predictions',
          icon: TrendingUp,
        },

        {
          name: 'My Purchases',
          href: '/dashboard/purchases',
          icon: ShoppingCart,
        },
      ],
    },

    {
      title: 'Rewards',

      items: [
        {
          name: 'Referrals & Promos',
          href: '/dashboard/referrals',
          icon: Gift,
        },
      ],
    },

    {
      title: 'Account',

      items: [
        {
          name: 'My Profile',
          href: '/dashboard/profile',
          icon: User,
        },
        {
          name: 'Subscriptions',
          href: '/dashboard/subscriptions',
          icon: User,
        },
      ],
    },
  ];

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="
            fixed
            inset-0
            z-40
            bg-black/50
            backdrop-blur-sm
            lg:hidden
          "
        />
      )}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          h-[100dvh]
          shrink-0
          flex-col
          overflow-hidden
          border-r
          border-border/60
          bg-background/95
          backdrop-blur-xl
          transition-all
          duration-300

          w-80

          lg:static
          lg:bg-background/80

          ${
            collapsed
              ? 'lg:w-24'
              : 'lg:w-80'
          }

          ${
            open
              ? 'translate-x-0'
              : '-translate-x-full'
          }

          lg:translate-x-0
        `}
      >
        {/* Background Glow */}

        <div
          className="
            pointer-events-none
            absolute
            -left-32
            -top-32
            h-72
            w-72
            rounded-full
            bg-primary/20
            blur-[120px]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            bottom-0
            right-0
            h-64
            w-64
            rounded-full
            bg-emerald-500/10
            blur-[120px]
          "
        />

        {/* Header */}

        <div
          className="
            relative
            flex
            items-center
            border-b
            border-border/60
            px-7
            py-8
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-3xl
                text-primary
                shadow-lg
                shadow-primary/30
              "
            >
            <Image
              src="/logo.png"
              alt="HonestPredict"
              width={82}
              height={82}
              className="h-34 w-34 object-contain"
            />
            </div>

            {!collapsed && (
              <div>
                <h1
                  className="
                    text-xl
                    font-black
                    tracking-tight
                  "
                >
                  Honest Predict
                </h1>

                <p
                  className="
                    text-xs
                    text-muted-foreground
                  "
                >
                  User Dashboard
                </p>
              </div>
            )}
          </div>
{/* Desktop Collapse Toggle */}

<button
  onClick={() => setCollapsed((prev) => !prev)}
  className="
    absolute
    -right-1
    z-50
    hidden
    p-2
    shadow-lg
    transition-all
    duration-300
    hover:scale-105
    hover:bg-accent
    lg:flex
    top-28
  "
>
  {collapsed ? (
    <PanelLeftOpen size={18} />
  ) : (
    <PanelLeftClose size={18} />
  )}
</button>
          {/* Mobile Close */}

          <button
            onClick={onClose}
            className="
              ml-auto
              rounded-xl
              p-2
              transition-colors
              hover:bg-accent
              lg:hidden
            "
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* Navigation */}

          <nav
            className="
              flex-1
              min-h-0
              space-y-7
              overflow-y-auto
              px-5
              py-6
              scrollbar-hide
            "
          >
          {links.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <p
                  className="
                    mb-3
                    px-3
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-muted-foreground/70
                  "
                >
                  {section.title}
                </p>
              )}

              <div className="space-y-2">
                {section.items.map((link) => {
                  const Icon = link.icon;

                  const active =
                    pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={onClose}
                      className={`
                        group
                        relative
                        flex
                        items-center
                        rounded-2xl
                        py-3.5
                        transition-all
                        duration-300

                        ${
                          collapsed
                            ? 'justify-center px-0'
                            : 'gap-4 px-4'
                        }

                        ${
                          active
                            ? `
                              bg-primary
                              text-primary-foreground
                              shadow-xl
                              shadow-primary/20
                            `
                            : `
                              text-muted-foreground
                              hover:bg-accent
                              hover:text-foreground
                            `
                        }
                      `}
                    >
                      <Icon
                        size={20}
                        className="
                          transition-transform
                          duration-300
                          group-hover:scale-110
                        "
                      />

                      {!collapsed && (
                        <span
                          className="
                            flex-1
                            font-medium
                          "
                        >
                          {link.name}
                        </span>
                      )}

                      {!collapsed && (
                        <ChevronRight
                          size={16}
                          className={`
                            transition-all

                            ${
                              active
                                ? 'opacity-100'
                                : 'opacity-0 group-hover:opacity-100'
                            }
                          `}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}

        <div
          className="
            shrink-0
            border-t
            border-border/60
            p-5
          "
        >
          <button
            onClick={async () => {
              await logout();

              router.push('/login');

              router.refresh();
            }}
            className={`
              group
              flex
              w-full
              items-center
              rounded-2xl
              py-3.5
              text-red-500
              transition-all
              hover:bg-red-500/10

              ${
                collapsed
                  ? 'justify-center'
                  : 'gap-4 px-4'
              }
            `}
          >
            <LogOut
              size={20}
              className="
                transition-transform
                group-hover:-translate-x-1
              "
            />

            {!collapsed && (
              <span className="font-medium">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}