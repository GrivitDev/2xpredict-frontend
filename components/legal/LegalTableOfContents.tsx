'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  useEffect,
  useState,
} from 'react';

import {
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface LegalItem {
  id: string;
  title: string;
}

interface LegalDocument {
  title: string;
  href: string;
  items: LegalItem[];
}

interface LegalTableOfContentsProps {
  documents: LegalDocument[];
}

export default function LegalTableOfContents({
  documents,
}: LegalTableOfContentsProps) {
  const pathname = usePathname();

  const [openDocument, setOpenDocument] =
    useState<string | null>(null);

  const [active, setActive] =
    useState('');

  useEffect(() => {
    const current =
      documents.find(
        (doc) =>
          doc.href === pathname
      );

    if (!current) return;

    const frame =
      requestAnimationFrame(() => {
        setOpenDocument(current.href);
      });

    return () =>
      cancelAnimationFrame(frame);

  }, [pathname, documents]);

  useEffect(() => {
    const current =
      documents.find(
        (doc) =>
          doc.href === pathname
      );

    if (!current) return;

    const sections =
      current.items
        .map((item) =>
          document.getElementById(item.id)
        )
        .filter(Boolean);

    const observer =
      new IntersectionObserver(

        (entries) => {

          entries.forEach((entry) => {

            if (entry.isIntersecting) {
              setActive(entry.target.id);
            }

          });

        },

        {
          rootMargin:
            '-20% 0px -70% 0px',
        }

      );

    sections.forEach((section) => {

      if (section) {
        observer.observe(section);
      }

    });

    return () => {

      sections.forEach((section) => {

        if (section) {
          observer.unobserve(section);
        }

      });

    };

  }, [pathname, documents]);

  return (
    <nav
      className="
        max-h-[calc(100vh-8rem)]
        overflow-y-auto
        rounded-3xl
        border
        border-border/50
        bg-background/70
        p-5
        shadow-sm
        backdrop-blur-md
        scrollbar-thin
      "
    >
      <h3
        className="
          mb-6
          text-xs
          font-bold
          uppercase
          tracking-[0.25em]
          text-muted-foreground
        "
      >
        Legal Documentation
      </h3>

      <div
        className="
          space-y-3
        "
      >
        {documents.map((document) => {

          const opened =
            openDocument === document.href;

          return (

            <div
              key={document.href}
              className="
                rounded-2xl
                border
                border-border/40
                bg-background/50
                transition-all
                duration-300
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  p-2
                "
              >
                <Link
                  href={document.href}
                  className={`
                    flex-1
                    rounded-xl
                    px-3
                    py-2.5
                    text-sm
                    font-semibold
                    transition-all
                    duration-200

                    ${
                      pathname === document.href
                        ? 'text-primary'
                        : 'text-foreground hover:text-primary'
                    }
                  `}
                >
                  {document.title}
                </Link>

                <button
                  type="button"
                  aria-expanded={opened}
                  onClick={() =>
                    setOpenDocument(
                      opened
                        ? null
                        : document.href
                    )
                  }
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    text-muted-foreground
                    transition-all
                    duration-200
                    hover:bg-muted
                    hover:text-primary
                  "
                >
                  {opened ? (
                    <ChevronDown
                      className="
                        h-4
                        w-4
                      "
                    />
                  ) : (
                    <ChevronRight
                      className="
                        h-4
                        w-4
                      "
                    />
                  )}
                </button>
              </div>

              {opened && (
                <ul
                  className="
                    mb-3
                    ml-6
                    space-y-1
                    border-l
                    border-border/60
                    pl-4
                  "
                >
                  {document.items.map(
                    (item) => (
                      <li
                        key={item.id}
                      >
                        <Link
                          href={`${document.href}#${item.id}`}
                          className={`
                            block
                            rounded-xl
                            px-3
                            py-2
                            text-sm
                            transition-all
                            duration-200

                            ${
                              active === item.id
                                ? `
                                  border
                                  border-primary/20
                                  bg-primary/10
                                  font-semibold
                                  text-primary
                                `
                                : `
                                  text-muted-foreground
                                  hover:bg-muted
                                  hover:text-foreground
                                `
                            }
                          `}
                        >
                          {item.title}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              )}
            </div>

          );

        })}
      </div>
    </nav>
  );
}