'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Headset } from 'lucide-react';

const links = [
  { name: 'Home', href: '/' },
  { name: 'Community', href: '/community' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Contact', href: '/about', icon: true },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="
        relative
        flex
        items-center
        gap-1
        rounded-xl
        border
        border-border
        bg-card/80
        p-1
        shadow-sm
        backdrop-blur-md
        sm:gap-1.5
      "
    >
      {/* Subtle premium highlight */}
      <span
        className="
          pointer-events-none
          absolute
          inset-0
          rounded-xl
          bg-gradient-to-r
          from-primary/[0.03]
          via-transparent
          to-gold/[0.04]
        "
      />

      {links.map((link) => {
        const active =
          link.href === '/'
            ? pathname === '/'
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            aria-label={link.icon ? link.name : undefined}
            title={link.icon ? link.name : undefined}
            className={`
              group
              relative
              flex
              items-center
              justify-center
              gap-2
              rounded-lg
              transition-all
              duration-200

              ${
                link.icon
                  ? 'h-10 w-10'
                  : 'px-4 py-2.5'
              }

              ${
                active
                  ? `
                    bg-primary
                    text-primary-foreground
                    shadow-md
                    shadow-primary/15
                  `
                  : `
                    text-muted-foreground
                    hover:bg-secondary
                    hover:text-foreground
                  `
              }
            `}
          >
            {link.icon ? (
              <Headset
                className="
                  h-[17px]
                  w-[17px]
                  transition-transform
                  duration-200
                  group-hover:scale-105
                "
                strokeWidth={1.8}
              />
            ) : (
              <span
                className="
                  relative
                  z-10
                  text-s
                  font-semibold
                  tracking-[-0.01em]
                "
              >
                {link.name}
              </span>
            )}

            {/* Active gold detail */}
            {active && (
              <span
                className="
                  absolute
                  bottom-1
                  left-1/2
                  h-0.5
                  w-5
                  -translate-x-1/2
                  rounded-full
                  bg-gold
                "
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}