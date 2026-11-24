'use client';

import { useEffect, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Footer from '@/components/footer';
import MobileBottomTabs from '@/components/navbar/MobileBottomTabs';
import Navbar from '@/components/navbar/navbar';
import { NavbarProvider } from '@/components/navbar/NavbarContext';
import { useUserNotificationRealtime } from '@/hooks/use-user-notification-realtime';

// Customer Care is global, but its launcher and chat workflows are not needed to
// paint the first screen. Load the widget shortly after the initial render.
const CustomerCareWidget = dynamic(
  () => import('@/components/customer-care/CustomerCareWidget'),
  { ssr: false },
);

function DeferredCustomerCareWidget() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  return ready ? <CustomerCareWidget /> : null;
}

/** Shared site chrome. Public and admin route layouts render content only. */
export default function AppShell({ children }: { children: ReactNode }) {
  useUserNotificationRealtime();

  return (
    <NavbarProvider>
      <div className="flex min-h-dvh w-full min-w-0 flex-col overflow-x-clip bg-background text-foreground">
        <Navbar />
        <div className="flex w-full min-w-0 flex-1 flex-col">{children}</div>
        <Footer />
        <MobileBottomTabs />
      </div>
      <DeferredCustomerCareWidget />
    </NavbarProvider>
  );
}
