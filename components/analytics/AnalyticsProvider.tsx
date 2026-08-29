'use client';

import {
  useEffect,
  useRef,
} from 'react';

import {
  usePathname,
} from 'next/navigation';

import {
  AnalyticsClient,
} from '@/lib/analytics/analytics-client';

import {
  setAnalyticsClient,
} from '@/hooks/use-analytics';

import AnalyticsInteractionTracker from './AnalyticsInteractionTracker';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export default function AnalyticsProvider({
  children,
}: AnalyticsProviderProps) {
  const pathname =
    usePathname();

  const clientRef =
    useRef<AnalyticsClient | null>(
      null,
    );

  const previousPathRef =
    useRef<string | null>(null);

  const pageStartedAtRef =
    useRef<number | null>(null);

  // =========================================================
  // CLIENT INITIALIZATION
  // =========================================================

  useEffect(() => {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      if (
        process.env.NODE_ENV !==
        'production'
      ) {
        console.warn(
          'NEXT_PUBLIC_API_URL is not configured. Website analytics disabled.',
        );
      }

      return;
    }

    const client =
      new AnalyticsClient(apiUrl);

    clientRef.current =
      client;

    setAnalyticsClient(
      client,
    );

    client.start();

    return () => {
      client.stop();

      clientRef.current =
        null;

      setAnalyticsClient(
        null,
      );
    };
  }, []);

  // =========================================================
  // ROUTE TRACKING
  // =========================================================

  useEffect(() => {
    const client =
      clientRef.current;

    if (!client) {
      return;
    }

    /*
     * Read the query string directly from
     * the browser instead of using useSearchParams().
     *
     * This keeps the global AnalyticsProvider
     * from forcing a CSR bailout during Next.js
     * production prerendering.
     */
    const query =
      typeof window !== 'undefined'
        ? window.location.search
        : '';

    const currentPath =
      query.length > 0
        ? `${pathname}${query}`
        : pathname;

    const previousPath =
      previousPathRef.current;

    if (
      previousPath ===
      currentPath
    ) {
      return;
    }

    if (previousPath) {
      const durationMs =
        Math.max(
          0,
          Date.now() -
            (pageStartedAtRef.current ??
              Date.now()),
        );

      client.pageExit(
        previousPath,
      );

      /*
       * Keep the calculation here for page
       * tracking state, while the AnalyticsClient
       * remains responsible for active time.
       */
      void durationMs;
    }

    pageStartedAtRef.current =
      Date.now();

    previousPathRef.current =
      currentPath;

    client.pageView(
      currentPath,
    );
  }, [pathname]);

  // =========================================================
  // ACTIVE HEARTBEATS
  // =========================================================

  useEffect(() => {
    const client =
      clientRef.current;

    if (!client) {
      return;
    }

    const timer =
      window.setInterval(() => {
        if (
          document.visibilityState ===
          'visible'
        ) {
          client.heartbeat();
        }
      }, 30000);

    return () => {
      window.clearInterval(
        timer,
      );
    };
  }, []);

  // =========================================================
  // PAGE EXIT / BROWSER CLOSE
  // =========================================================

  useEffect(() => {
    const client =
      clientRef.current;

    if (!client) {
      return;
    }

    const handleVisibilityChange =
      () => {
        if (
          document.visibilityState ===
          'hidden'
        ) {
          client.updateActiveTime();

          void client.syncSession();

          void client.flush(true);

          return;
        }

        client.updateActiveTime();
      };

    const handlePageHide =
      () => {
        client.updateActiveTime();

        void client.endSession();

        void client.flush(true);
      };

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange,
    );

    window.addEventListener(
      'pagehide',
      handlePageHide,
    );

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange,
      );

      window.removeEventListener(
        'pagehide',
        handlePageHide,
      );
    };
  }, []);

  return (
    <>
      <AnalyticsInteractionTracker />

      {children}
    </>
  );
}