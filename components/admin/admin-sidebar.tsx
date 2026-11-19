'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaChartLine,
  FaCoins,
  FaCreditCard,
  FaFutbol,
  FaGift,
  FaGear,
  FaGaugeHigh,
  FaHouse,
  FaLock,
  FaMoneyBillWave,
  FaBell,
  FaShieldHalved,
  FaTicket,
  FaUsers,
  FaXmark,
} from 'react-icons/fa6';
import { useAuth } from '@/providers/auth-provider';

interface Props {
  open: boolean;
  onClose: () => void;
}

const groups = [
  {
    title: 'Overview',
    items: [
      { name: 'Home', href: '/', icon: FaHouse },
      { name: 'Dashboard', href: '/admin', icon: FaGaugeHigh },
      { name: 'Analytics', href: '/admin/website-analytics', icon: FaChartLine },
      { name: 'System', href: '/admin/system-monitor', icon: FaGear },
    ],
  },
  {
    title: 'Products',
    items: [
      { name: 'Odds', href: '/admin/odds-center', icon: FaCoins },
      { name: 'Picks', href: '/admin/pick-center', icon: FaShieldHalved },
      { name: 'Predictions', href: '/admin/predictions-center', icon: FaFutbol },
      { name: 'Slips', href: '/admin/slip-center', icon: FaTicket },
    ],
  },
  {
    title: 'Manage',
    items: [
      { name: 'Users', href: '/admin/users', icon: FaUsers },
      { name: 'Notifications', href: '/admin/notifications', icon: FaBell },
      { name: 'customer', href: '/admin/customer-care', icon: FaUsers },
      { name: 'Bonuses', href: '/admin/bonuses', icon: FaGift },
      { name: 'Promos', href: '/admin/promos', icon: FaTicket },
      { name: 'Referrals', href: '/admin/referrals', icon: FaUsers },
      { name: 'Payments', href: '/admin/subscriptions', icon: FaCreditCard },
      { name: 'Ads', href: '/admin/ads', icon: FaMoneyBillWave },
    ],
  },
];

export default function AdminSidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close admin navigation"
          onClick={onClose}
          className="fixed inset-x-0 bottom-0 top-[calc(76px_+_env(safe-area-inset-top))] z-[70] bg-black/45 backdrop-blur-[2px] sm:top-[calc(84px_+_env(safe-area-inset-top))] lg:hidden"
        />
      ) : null}

      <aside
        aria-label="Admin sidebar"
        className={`fixed left-0 top-[calc(76px_+_env(safe-area-inset-top))] z-[80] flex h-[calc(100dvh_-_76px_-_env(safe-area-inset-top))] w-[min(84vw,290px)] shrink-0 flex-col border-r border-border/80 bg-card shadow-xl transition-transform duration-200 sm:top-[calc(84px_+_env(safe-area-inset-top))] sm:h-[calc(100dvh_-_84px_-_env(safe-area-inset-top))] lg:sticky lg:top-[92px] lg:z-30 lg:h-[calc(100dvh_-_92px)] lg:w-[84px] lg:max-w-[15vw] lg:translate-x-0 lg:shadow-none ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="border-b border-border/70 px-2 py-3 text-center lg:px-1.5 lg:py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary lg:text-[8px] lg:tracking-[0.08em]">Administration</p>
          <p className="mt-1 text-sm font-semibold text-foreground lg:text-[10px] lg:leading-tight">Control Center</p>
        </div>

        <nav
          className="min-h-0 flex-1 space-y-5 overflow-y-auto px-2.5 py-3 lg:space-y-3 lg:px-1.5 lg:py-2"
          aria-label="Administration navigation"
        >
          {groups.map((group) => (
            <section key={group.title}>
              <h2 className="mb-1.5 px-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground lg:mb-1 lg:px-0 lg:text-center lg:text-[7px] lg:tracking-normal">
                {group.title}
              </h2>
              <div className="space-y-0.5 lg:space-y-1">
                {group.items.map(({ name, href, icon: Icon }) => {
                  const active =
                    href === '/'
                      ? pathname === '/'
                      : href === '/admin'
                        ? pathname === href
                        : pathname === href || pathname.startsWith(`${href}/`);

                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      title={name}
                      aria-label={name}
                      aria-current={active ? 'page' : undefined}
                      className={`flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-[12px] font-medium transition-colors lg:min-h-[58px] lg:flex-col lg:justify-center lg:gap-1 lg:rounded-md lg:px-1 lg:py-1.5 lg:text-[9px] lg:leading-tight ${active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-primary/[0.07] hover:text-foreground'}`}
                    >
                      <Icon className="h-4 w-4 shrink-0 lg:h-4 lg:w-4" aria-hidden="true" />
                      <span className="min-w-0 flex-1 lg:flex-none lg:whitespace-normal lg:break-words lg:text-center">
                        {name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        <div className="border-t border-border/70 p-2.5 lg:p-1.5">
          <button
            type="button"
            onClick={() => {
              void logout();
              onClose();
            }}
            className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 lg:min-h-[54px] lg:flex-col lg:justify-center lg:gap-1 lg:rounded-md lg:px-1 lg:py-1.5 lg:text-[9px]"
          >
            <FaLock className="h-3.5 w-3.5 shrink-0 lg:h-4 lg:w-4" aria-hidden="true" />
            <span className="flex-1 lg:flex-none lg:text-center">Sign out</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close admin navigation"
            className="mt-1 flex h-8 w-full items-center justify-center rounded-lg text-muted-foreground hover:bg-muted lg:hidden"
          >
            <FaXmark className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </aside>
    </>
  );
}
