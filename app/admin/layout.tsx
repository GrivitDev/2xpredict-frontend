'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import AdminSidebar from '@/components/admin/admin-sidebar';
import { FaArrowUp } from 'react-icons/fa6';
import { AdminRealtimeProvider } from '@/components/admin/realtime/AdminRealtimeProvider';
import AdminRealtimeStatusBar from '@/components/admin/realtime/AdminRealtimeStatusBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    const openSidebar = () => setSidebarOpen(true);
    window.addEventListener('2xpredict:open-admin-sidebar', openSidebar);
    return () => window.removeEventListener('2xpredict:open-admin-sidebar', openSidebar);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'admin') router.replace('/');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100dvh_-_76px_-_env(safe-area-inset-top))] sm:min-h-[calc(100dvh_-_84px_-_env(safe-area-inset-top))] lg:min-h-[calc(100dvh_-_92px)] w-full flex-1 items-center justify-center bg-background">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <AdminRealtimeProvider>
      <div className="flex min-h-[calc(100dvh_-_76px_-_env(safe-area-inset-top))] sm:min-h-[calc(100dvh_-_84px_-_env(safe-area-inset-top))] lg:min-h-[calc(100dvh_-_92px)] w-full min-w-0 flex-1 overflow-x-clip bg-background text-foreground">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="min-w-0 flex-1">
          <div className="min-w-0 p-1 sm:p-1 lg:p-1">
            <AdminRealtimeStatusBar />
            {children}
          </div>
        </main>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          title="Back to top"
          className="fixed bottom-5 right-5 z-[60] inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-card text-primary shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-1 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:bottom-6 sm:right-6"
        >
          <FaArrowUp className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </AdminRealtimeProvider>
  );
}

