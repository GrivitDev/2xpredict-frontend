'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaChartLine, FaCoins, FaHouse, FaNewspaper, FaPlay, FaTv } from 'react-icons/fa6';

const links = [
  { name: 'Home', href: '/', icon: FaHouse },
  { name: 'Predictions', href: '/predictions', icon: FaChartLine },
  { name: 'BetLab', href: '/bet-lab', icon: FaCoins },
  { name: '2XLive TV', href: '/2xlive-tv', icon: FaTv },
  { name: 'News', href: '/news', icon: FaNewspaper },
  { name: 'Highlights', href: '/highlights', icon: FaPlay },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="flex min-w-0 items-end justify-center gap-0.5 xl:gap-1 mb-1">
      {links.map(({ name, href, icon: Icon }) => {
        const active = href === '/'
          ? pathname === '/'
          : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`group relative inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-2 text-xs font-bold tracking-[0.005em] transition-all duration-200 xl:gap-2 xl:px-2.5 xl:text-[13px] ${
              active
                ? 'bg-white/[0.16] text-[var(--chrome-accent)] shadow-[inset_0_0_0_1px_rgba(255,250,247,0.13),0_4px_16px_rgba(42,16,28,0.08)]'
                : 'text-white hover:bg-white/[0.12] hover:text-white'
            }`}
          >
            <Icon className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 xl:h-4 xl:w-4 ${active ? 'text-[var(--chrome-accent)]' : 'text-white'}`} aria-hidden="true" />
            <span>{name}</span>
            {active ? <span aria-hidden="true" className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-[var(--chrome-accent)]/90 shadow-[0_0_10px_rgba(244,225,205,0.45)]" /> : null}
          </Link>
        );
      })}
    </nav>
  );
}
