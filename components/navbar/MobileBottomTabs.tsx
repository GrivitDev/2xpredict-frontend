'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaChartLine, FaCoins, FaHouse, FaNewspaper, FaTv } from 'react-icons/fa6';

const tabs = [
  { label: 'Home', href: '/', icon: FaHouse },
  { label: 'Predictions', href: '/predictions', icon: FaChartLine },
  { label: '2XLive TV', href: '/2xlive-tv', icon: FaTv },
  { label: 'BetLab', href: '/bet-lab', icon: FaCoins },
  { label: 'News & Highlights', href: '/news', icon: FaNewspaper },
];

export default function MobileBottomTabs() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-[90] isolate overflow-hidden border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#F6E9D6]/95 before:to-transparent before:content-[''] lg:hidden"
      style={{
        backgroundColor: 'var(--chrome-tabs-surface)',
        color: 'var(--chrome-foreground)',
        borderColor: 'var(--chrome-border)',
        WebkitBackdropFilter: 'blur(28px) saturate(185%)',
        backdropFilter: 'blur(28px) saturate(185%)',
        boxShadow: '0 -12px 34px rgba(43,2,17,0.24), inset 0 1px 0 rgba(255,255,255,0.24)',
      }}
    >
      <div className="mx-auto grid w-full max-w-[900px] grid-cols-5 items-stretch">
        {tabs.map(({ label, href, icon: Icon }) => {
          const active = href === '/'
            ? pathname === '/'
            : label === 'News & Highlights'
              ? pathname.startsWith('/news') || pathname.startsWith('/highlights')
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={label}
              href={href}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              title={label}
              className="group relative flex min-h-[68px] min-w-0 flex-col items-center justify-center gap-1 px-0.5 py-2 text-[9px] font-semibold leading-none transition-colors duration-200 sm:min-h-[72px] sm:text-[10px]"
              style={{ color: active ? 'var(--chrome-accent)' : 'var(--chrome-foreground)' }}
            >
              {active ? <span aria-hidden="true" className="absolute inset-x-[28%] top-0 h-[2px] rounded-full bg-[var(--chrome-accent)] shadow-[0_0_12px_rgba(244,225,205,0.5)]" /> : null}
              <span
                className="flex h-8 w-10 items-center justify-center rounded-xl border transition-all duration-200 group-hover:-translate-y-0.5"
                style={{
                  backgroundColor: active ? 'rgba(246,233,214,0.19)' : 'rgba(255,255,255,0.055)',
                  borderColor: active ? 'rgba(246,233,214,0.42)' : 'rgba(255,255,255,0.12)',
                  boxShadow: active ? '0 4px 16px rgba(38,4,18,0.20), inset 0 1px 0 rgba(255,255,255,0.22)' : 'inset 0 1px 0 rgba(255,255,255,0.10)',
                }}
              >
                <Icon className="h-[17px] w-[17px]" aria-hidden="true" />
              </span>
              <span className="block max-w-full whitespace-nowrap text-center tracking-tight">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

