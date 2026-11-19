'use client';

import { useRouter } from 'next/navigation';
import { FaBell, FaInbox } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { useAuth } from '@/providers/auth-provider';
import {
  useMarkNotificationReadMutation,
  useNotificationsQuery,
  useUnreadNotificationCountQuery,
} from '@/hooks/use-notifications';
import type { UserNotification } from '@/types/notifications';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  NotificationVisual,
  notificationActionLabel,
} from './NotificationVisual';

function notificationTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function NotificationBell() {
  const router = useRouter();
  const { user } = useAuth();
  const enabled = Boolean(user);
  const unread = useUnreadNotificationCountQuery({ enabled, staleTime: 15_000 });
  const recent = useNotificationsQuery(
    { query: { page: 1, limit: 5 } },
    { enabled, staleTime: 15_000 },
  );
  const markRead = useMarkNotificationReadMutation();
  const notifications = recent.data?.items ?? [];
  const unreadCount = unread.data?.unreadCount ?? 0;

  const openNotification = async (notification: UserNotification) => {
    try {
      if (!notification.readAt) {
        await markRead.mutateAsync({ path: { id: notification.id } });
      }
      if (notification.actionUrl) router.push(notification.actionUrl);
    } catch {
      toast.error('Could not update this notification. Please try again.');
    }
  };

  if (!enabled) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
          title="Notifications"
          className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0 text-[var(--chrome-foreground)] outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-[var(--chrome-accent)]/75 sm:h-11 sm:w-11"
        >
          <FaBell className="h-[18px] w-[18px]" aria-hidden="true" />
          {unreadCount > 0 ? (
            <span className="absolute right-0.5 top-0.5 inline-flex min-h-[17px] min-w-[17px] items-center justify-center rounded-full border border-[var(--chrome-surface)] bg-[var(--chrome-accent)] px-1 text-[9px] font-extrabold leading-none text-[#3b1727] shadow-sm">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={10} className="z-[160] w-[min(92vw,390px)] gap-0 overflow-hidden rounded-2xl border border-border/70 bg-popover p-0 shadow-2xl">
        <PopoverHeader className="flex-row items-center justify-between border-b border-border/70 px-4 py-3">
          <div>
            <PopoverTitle className="text-sm font-bold">Notifications</PopoverTitle>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {unreadCount === 0 ? 'You are all caught up' : `${unreadCount} unread`}
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">2xPredict</span>
        </PopoverHeader>

        <div className="max-h-[min(65vh,440px)] overflow-y-auto">
          {recent.isPending ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : notifications.length ? (
            <div className="divide-y divide-border/60">
              {notifications.map((notification) => {
                const actionLabel = notificationActionLabel(
                  notification.presentation,
                  notification.actionUrl,
                );
                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => void openNotification(notification)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60"
                  >
                    <NotificationVisual
                      presentation={notification.presentation}
                      className="h-9 w-9 rounded-lg"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="line-clamp-1 text-xs font-bold text-foreground">{notification.title}</span>
                        {!notification.readAt ? <span className="shrink-0 text-[9px] font-bold text-primary">NEW</span> : null}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-[11px] leading-relaxed text-muted-foreground">{notification.message}</span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] text-muted-foreground/80">
                        <span>{notificationTime(notification.createdAt)}</span>
                        {actionLabel ? <span className="font-bold text-primary">· {actionLabel}</span> : null}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center px-5 py-8 text-center">
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground"><FaInbox /></span>
              <p className="text-xs font-semibold">No notifications yet</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Updates from your account will appear here.</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border/70 bg-muted/30 px-3 py-2">
          <span className="text-[10px] text-muted-foreground">In-app notifications</span>
          <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => router.push('/notifications')}>
            <FaInbox className="mr-1.5 h-3 w-3" /> View all
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
