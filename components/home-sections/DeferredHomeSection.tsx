'use client';

import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from 'react';

type SectionComponent = ComponentType<Record<string, never>>;
type SectionLoader = () => Promise<{ default: SectionComponent }>;

interface DeferredHomeSectionProps {
  load: SectionLoader;
  minHeight: number;
  label: string;
}

/**
 * Defers both the section's JavaScript chunk and its React Query requests until
 * the visitor approaches the section. The section is loaded only once.
 */
export default function DeferredHomeSection({
  load,
  minHeight,
  label,
}: DeferredHomeSectionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [Section, setSection] = useState<SectionComponent | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let started = false;
    let observer: IntersectionObserver | null = null;

    const mountSection = () => {
      if (started) return;
      started = true;
      observer?.disconnect();

      void load()
        .then((module) => {
          if (active) setSection(() => module.default);
        })
        .catch(() => {
          if (active) setFailed(true);
        });
    };

    const element = containerRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      mountSection();
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) mountSection();
        },
        { rootMargin: '700px 0px', threshold: 0 },
      );
      observer.observe(element);
    }

    return () => {
      active = false;
      observer?.disconnect();
    };
  }, [load]);

  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{ minHeight }}
      aria-busy={!Section && !failed}
      aria-label={label}
    >
      {Section ? (
        <Section />
      ) : failed ? (
        <div className="mx-auto max-w-6xl px-3 py-3 text-center text-xs text-muted-foreground">
          This section could not be loaded. Refresh the page to try again.
        </div>
      ) : (
        <div className="mx-auto w-full max-w-6xl px-3 py-3" aria-hidden="true">
          <div className="h-3 w-28 animate-pulse rounded bg-muted/50" />
          <div className="mt-3 h-16 animate-pulse rounded-xl bg-muted/25" />
        </div>
      )}
    </div>
  );
}
