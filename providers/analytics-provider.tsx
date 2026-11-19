'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { AnalyticsClient } from '@/lib/analytics/analytics-client';
import { API_BASE_URL } from '@/lib/axios';
import { setAnalyticsClient } from '@/hooks/use-analytics';

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const clientRef = useRef<AnalyticsClient | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const client = new AnalyticsClient(API_BASE_URL);
    clientRef.current = client;
    setAnalyticsClient(client);
    client.start();
    return () => {
      client.stop();
      setAnalyticsClient(null);
      clientRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!pathname || !clientRef.current) return;
    const query = typeof window !== 'undefined' ? window.location.search : '';
    clientRef.current.pageView(`${pathname}${query}`);
  }, [pathname]);

  return children;
}
