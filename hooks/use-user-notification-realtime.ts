'use client';

import { useEffect } from 'react';
import type { Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '@/lib/axios';
import { useAuth } from '@/providers/auth-provider';
import { notificationQueryKeys } from './use-notifications';
import type {
  NotificationSocketEvents,
  NotificationUnreadCountResponse,
} from '@/types/notifications';

/**
 * Connects the authenticated user to the backend's private notification namespace.
 * REST queries remain the source of truth; socket events invalidate or reconcile cache.
 */
export function useUserNotificationRealtime(enabled = true): void {
  const { token, user, loading } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.userId;

  useEffect(() => {
    if (!enabled || loading || !token || !userId || typeof window === 'undefined') {
      return;
    }

    let socket: Socket | null = null;
    let cancelled = false;

    // Socket.IO is only needed for authenticated visitors. Load and connect it
    // after the initial page paint so the shared application bundle stays smaller
    // for anonymous visitors and the first screen is not competing for bandwidth.
    const connect = async () => {
      try {
        const { io } = await import('socket.io-client');
        if (cancelled) return;

        socket = io(`${API_BASE_URL}/user-notifications`, {
          auth: { token },
          transports: ['websocket', 'polling'],
          withCredentials: true,
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1_000,
          reconnectionDelayMax: 10_000,
          timeout: 10_000,
        });

        const reconcile = () => {
          void Promise.all([
            queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list() }),
            queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount() }),
          ]);
        };

        socket.on('notification:ready', reconcile);

        socket.on('notification:new', (notification: NotificationSocketEvents['notification:new']) => {
          queryClient.setQueryData<NotificationUnreadCountResponse>(
            notificationQueryKeys.unreadCount(),
            (current) => ({ unreadCount: Math.max(0, (current?.unreadCount ?? 0) + 1) }),
          );
          void Promise.all([
            queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list() }),
            queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount() }),
          ]);

          if (notification?.title) {
            toast(`${notification.title}${notification.message ? ` — ${notification.message.slice(0, 140)}` : ''}`, {
              duration: 5_000,
            });
          }
        });

        socket.on('notification:read', (_event: NotificationSocketEvents['notification:read']) => {
          queryClient.setQueryData<NotificationUnreadCountResponse>(
            notificationQueryKeys.unreadCount(),
            (current) => ({ unreadCount: Math.max(0, (current?.unreadCount ?? 0) - 1) }),
          );
          void Promise.all([
            queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list() }),
            queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount() }),
          ]);
        });

        socket.on('notification:read-all', (_event: NotificationSocketEvents['notification:read-all']) => {
          queryClient.setQueryData<NotificationUnreadCountResponse>(
            notificationQueryKeys.unreadCount(),
            { unreadCount: 0 },
          );
          void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list() });
        });

        // Socket failures are intentionally silent; the inbox remains available over REST.
        socket.on('connect_error', () => undefined);
      } catch {
        // The notification inbox remains available through its REST queries.
      }
    };

    const connectTimer = window.setTimeout(() => {
      void connect();
    }, 800);

    return () => {
      cancelled = true;
      window.clearTimeout(connectTimer);
      socket?.removeAllListeners();
      socket?.disconnect();
    };
  }, [enabled, loading, token, userId, queryClient]);
}

