'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useAdminRealtime } from '@/hooks/use-admin-realtime';
import type { AdminRealtimeState } from '@/types/admin-realtime';

const EMPTY_STATE: AdminRealtimeState = {
  connectionStatus: 'disconnected',
  modules: [],
  recentEvents: [],
};

const AdminRealtimeContext = createContext<AdminRealtimeState>(EMPTY_STATE);

export function AdminRealtimeProvider({ children }: { children: ReactNode }) {
  const state = useAdminRealtime(true);
  return <AdminRealtimeContext.Provider value={state}>{children}</AdminRealtimeContext.Provider>;
}

export function useAdminRealtimeState(): AdminRealtimeState {
  return useContext(AdminRealtimeContext);
}
