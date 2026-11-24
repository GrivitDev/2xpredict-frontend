'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { TERMS_OF_USE_SECTIONS } from '@/lib/terms-of-use-sections';

type TermsNavigationContextValue = {
  activeSection: string;
  mobileTocOpen: boolean;
  setMobileTocOpen: (open: boolean) => void;
};

const TermsNavigationContext =
  createContext<TermsNavigationContextValue | null>(null);

/** Keeps only the table-of-contents interaction in the client bundle. */
export function TermsOfUseNavigationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [activeSection, setActiveSection] = useState('ownership');
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const elements = TERMS_OF_USE_SECTIONS
      .map(({ id }) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: '-12% 0px -72% 0px', threshold: 0 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const value = useMemo(
    () => ({ activeSection, mobileTocOpen, setMobileTocOpen }),
    [activeSection, mobileTocOpen],
  );

  return (
    <TermsNavigationContext.Provider value={value}>
      {children}
    </TermsNavigationContext.Provider>
  );
}

function useTermsNavigation() {
  const context = useContext(TermsNavigationContext);
  if (!context) {
    throw new Error(
      'Terms navigation components must be used inside TermsOfUseNavigationProvider.',
    );
  }
  return context;
}

function TableOfContents({
  activeSection,
  onNavigate,
}: {
  activeSection: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Table of contents">
      <ul className="list-none space-y-0.5 p-0">
        {TERMS_OF_USE_SECTIONS.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              onClick={onNavigate}
              aria-current={activeSection === section.id ? 'location' : undefined}
              className={`block rounded-md px-2 py-1 text-[12px] leading-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                activeSection === section.id
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              }`}
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function TermsOfUseMobileNavigation() {
  const { activeSection, mobileTocOpen, setMobileTocOpen } =
    useTermsNavigation();

  return (
    <div className="mb-2 md:hidden">
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card/60">
        <button
          type="button"
          aria-expanded={mobileTocOpen}
          aria-controls="mobile-terms-toc"
          onClick={() => setMobileTocOpen(!mobileTocOpen)}
          className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50"
        >
          <span>Table of contents</span>
          <span
            aria-hidden="true"
            className={`text-muted-foreground transition-transform ${
              mobileTocOpen ? 'rotate-180' : ''
            }`}
          >
            ▾
          </span>
        </button>
        {mobileTocOpen && (
          <div id="mobile-terms-toc" className="border-t border-border/50 p-1.5">
            <TableOfContents
              activeSection={activeSection}
              onNavigate={() => setMobileTocOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function TermsOfUseDesktopNavigation() {
  const { activeSection } = useTermsNavigation();

  return (
    <aside className="sticky top-4 hidden h-fit self-start md:block">
      <div className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-lg border border-border/60 bg-card/50 p-2">
        <h2 className="mb-1 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          On this page
        </h2>
        <TableOfContents activeSection={activeSection} />
      </div>
    </aside>
  );
}
