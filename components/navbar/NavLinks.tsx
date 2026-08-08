'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { name: 'Home', href: '/' },
  { name: 'Live Scores', href: '/livescore' },
  { name: 'Community', href: '/community' },
  { name: 'Articles', href: '/articles' },
  { name: 'About', href: '/about' },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav
      className="
        flex
        items-center
        gap-1
      "
    >
      {links.map((link) => {
        const active =
          link.href === '/'
            ? pathname === '/'
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`
              group
              relative
              rounded-full
              px-4
              py-2
              text-sm
              font-medium
              transition-all
              duration-300

              ${
                active
                  ? 'text-foreground'
                  : `
                    text-muted-foreground
                    hover:text-foreground
                  `
              }
            `}
          >
            {active && (
              <span
                className="
                  absolute
                  inset-0
                  rounded-full
                  border
                  border-primary/20
                  bg-primary/10
                  backdrop-blur-md
                "
              />
            )}

            {!active && (
              <span
                className="
                  absolute
                  inset-x-3
                  bottom-1
                  h-px
                  scale-x-0
                  bg-primary/50
                  transition-transform
                  duration-300
                  group-hover:scale-x-100
                "
              />
            )}

            <span
              className="
                relative
                z-10
              "
            >
              {link.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}