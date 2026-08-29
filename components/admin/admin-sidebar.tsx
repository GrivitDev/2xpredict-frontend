'use client';

import {
  useState,
} from 'react';

import Link from 'next/link';

import {
  usePathname,
} from 'next/navigation';

import {
  LayoutDashboard,
  PlusCircle,
  List,
  Users,
  CreditCard,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Megaphone,
  TicketPercent,
  Gift,
  PanelLeftClose,
  PanelLeftOpen,
  ChartNoAxesCombined,
} from 'lucide-react';

import {
  useAuth,
} from '@/providers/auth-provider';

interface Props {
  open: boolean;
  onClose: () => void;
}

const sections = [
  {
    title: 'Overview',
    items: [
      {
        name: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'Predictions',
    items: [
      {
        name: 'Create Prediction',
        href: '/admin/create-prediction',
        icon: PlusCircle,
      },
      {
        name: 'Manage Predictions',
        href: '/admin/predictions',
        icon: List,
      },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        name: 'Users',
        href: '/admin/users',
        icon: Users,
      },
      {
        name: 'Analytics',
        href: '/admin/analytics',
        icon: ChartNoAxesCombined,
      },
      {
        name: 'Subscriptions',
        href: '/admin/subscriptions',
        icon: CreditCard,
      },
      {
        name: 'Ads',
        href: '/admin/ads',
        icon: Megaphone,
      },
      {
        name: 'Promos',
        href: '/admin/promos',
        icon: Gift,
      },
      {
        name: 'Referrals',
        href: '/admin/referrals',
        icon: TicketPercent,
      },
    ],
  },
];

export default function AdminSidebar({
  open,
  onClose,
}: Props) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const [
    collapsed,
    setCollapsed,
  ] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed((value) => !value);
  };

  return (
    <>
      {/* MOBILE OVERLAY */}

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

      {/* SIDEBAR */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          h-screen
          shrink-0
          flex-col
          overflow-hidden
          border-r
          border-border/60
          bg-background/95
          backdrop-blur-xl
          transition-[width,transform]
          duration-300
          w-80
          lg:static
          lg:bg-background/80
          ${collapsed ? 'lg:w-24' : 'lg:w-80'}
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* GLOWS */}

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

        {/* HEADER */}

        <div
          className={`
            relative
            flex
            items-center
            border-b
            border-border/60
            px-7
            py-8
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                border
                border-primary/20
                bg-primary/10
                text-primary
                shadow-lg
                shadow-primary/10
              "
            >
              <ShieldCheck size={26} />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <h1 className="text-xl font-black tracking-tight">
                  Admin Center
                </h1>

                <p className="text-xs text-muted-foreground">
                  Platform Control
                </p>
              </div>
            )}
          </div>

          {/* DESKTOP COLLAPSE */}

          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={
              collapsed
                ? 'Expand sidebar'
                : 'Collapse sidebar'
            }
            className="
              ml-auto
              hidden
              rounded-xl
              p-2
              text-muted-foreground
              transition-colors
              hover:bg-accent
              hover:text-foreground
              lg:flex
            "
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>

          {/* MOBILE CLOSE */}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="
              ml-auto
              rounded-xl
              p-2
              text-muted-foreground
              transition-colors
              hover:bg-accent
              hover:text-foreground
              lg:hidden
            "
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* NAVIGATION */}

        <nav
          className="
            flex-1
            space-y-7
            overflow-y-auto
            px-5
            py-6
            scrollbar-hide
          "
        >
          {sections.map((section) => (
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
                {section.items.map((item) => {
                  const Icon = item.icon;

                  const active =
                    pathname === item.href ||
                    (
                      item.href !== '/admin' &&
                      pathname.startsWith(`${item.href}/`)
                    );

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      title={collapsed ? item.name : undefined}
                      className={`
                        group
                        relative
                        flex
                        items-center
                        rounded-2xl
                        py-3.5
                        transition-colors
                        duration-200
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
                          shrink-0
                          transition-transform
                          duration-200
                          group-hover:scale-105
                        "
                      />

                      {!collapsed && (
                        <>
                          <span className="flex-1 font-medium">
                            {item.name}
                          </span>

                          <ChevronRight
                            size={16}
                            className={`
                              transition-opacity
                              ${
                                active
                                  ? 'opacity-100'
                                  : 'opacity-0 group-hover:opacity-100'
                              }
                            `}
                          />
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* FOOTER */}

        <div className="border-t border-border/60 p-5">
          <button
            type="button"
            onClick={logout}
            title={collapsed ? 'Logout' : undefined}
            className={`
              group
              flex
              w-full
              items-center
              rounded-2xl
              py-3.5
              text-red-500
              transition-colors
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
                shrink-0
                transition-transform
                group-hover:-translate-x-0.5
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