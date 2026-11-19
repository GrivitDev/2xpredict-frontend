'use client';

import type { ReactNode } from 'react';
import Footer from '@/components/footer';
import MobileBottomTabs from '@/components/navbar/MobileBottomTabs';
import Navbar from '@/components/navbar/navbar';
import { NavbarProvider } from '@/components/navbar/NavbarContext';
import CustomerCareWidget from '@/components/customer-care/CustomerCareWidget';
import { useUserNotificationRealtime } from '@/hooks/use-user-notification-realtime';

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
      <CustomerCareWidget />
    </NavbarProvider>
  );
}
