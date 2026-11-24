'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import {
  FaBell,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaEnvelope,
  FaInbox,
  FaSliders,
} from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationPreferencesQuery,
  useNotificationsQuery,
  useUnreadNotificationCountQuery,
  useUpdateNotificationPreferencesMutation,
} from '@/hooks/use-notifications';
import type {
  NotificationCategory,
  NotificationEmailCategories,
  UserNotification,
} from '@/types/notifications';
import {
  NotificationVisual,
  notificationActionLabel,
} from './NotificationVisual';

const categories: Array<{ value: NotificationCategory; label: string }> = [
  { value: 'ACCOUNT', label: 'Account' },
  { value: 'REFERRALS', label: 'Referrals' },
  { value: 'BONUSES', label: 'Bonuses' },
  { value: 'PAYMENTS', label: 'Payments' },
  { value: 'SUBSCRIPTIONS', label: 'Subscriptions' },
  { value: 'BET_LAB', label: 'Bet Lab' },
  { value: 'WALLET', label: 'Wallet' },
  { value: 'PROMOTIONS', label: 'Promotions' },
  { value: 'CUSTOMER_CARE', label: 'Customer care' },
  { value: 'SYSTEM', label: 'System' },
];

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function categoryLabel(category: NotificationCategory): string {
  return categories.find((item) => item.value === category)?.label ?? category;
}

export default function NotificationsInbox() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<NotificationCategory | 'ALL'>('ALL');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const list = useNotificationsQuery({
    query: {
      page,
      limit: 20,
      ...(category === 'ALL' ? {} : { category }),
      ...(unreadOnly ? { unreadOnly: true } : {}),
    },
  }, { enabled: Boolean(user) });
  const unread = useUnreadNotificationCountQuery({ enabled: Boolean(user) });
  const preferences = useNotificationPreferencesQuery({
    enabled: Boolean(user) && showPreferences,
    staleTime: 5 * 60_000,
  });
  const markRead = useMarkNotificationReadMutation();
  const markAllRead = useMarkAllNotificationsReadMutation();
  const updatePreferences = useUpdateNotificationPreferencesMutation();

  const items = list.data?.items ?? [];
  const pagination = list.data?.pagination;
  const lockedCategories = new Set(preferences.data?.essentialCategoriesLocked ?? []);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user, router]);

  const handleOpen = async (notification: UserNotification) => {
    try {
      if (!notification.readAt) {
        await markRead.mutateAsync({ path: { id: notification.id } });
      }
      if (notification.actionUrl) router.push(notification.actionUrl);
    } catch {
      toast.error('Could not update this notification. Please try again.');
    }
  };

  const updateCategoryPreference = async (key: NotificationCategory, checked: boolean) => {
    const current = preferences.data?.emailCategories ?? ({} as NotificationEmailCategories);
    try {
      await updatePreferences.mutateAsync({ categories: { ...current, [key]: checked } });
      toast.success('Email preference updated.');
    } catch {
      toast.error('Could not save your email preference.');
    }
  };

  const updateEmailEnabled = async (checked: boolean) => {
    try {
      await updatePreferences.mutateAsync({ emailEnabled: checked });
      toast.success(checked ? 'Email notifications enabled.' : 'Email notifications paused.');
    } catch {
      toast.error('Could not save your email preference.');
    }
  };

  if (authLoading) {
    return <main className="mx-auto w-full max-w-5xl px-3 py-8 sm:px-5"><div className="h-28 animate-pulse rounded-2xl bg-muted" /></main>;
  }
  if (!user) return null;

  return (
    <main className="mx-auto w-full max-w-5xl px-3 py-5 pb-28 sm:px-5 sm:py-7 lg:px-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-accent">
            <FaBell className="h-3 w-3" /> Account updates
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Notifications</h1>
          <p className="mt-1 text-xs text-muted-foreground">Account activity, payments, subscriptions and other important updates.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-muted-foreground">
            {unread.data?.unreadCount ?? 0} unread
          </span>
          <Button variant="outline" size="sm" disabled={!unread.data?.unreadCount || markAllRead.isPending} onClick={() => markAllRead.mutate(undefined, { onSuccess: () => toast.success('All notifications marked as read.'), onError: () => toast.error('Could not mark notifications as read.') })}>
            <FaCheck className="mr-1.5 h-3 w-3" /> Mark all read
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowPreferences((value) => !value)}>
            <FaSliders className="mr-1.5 h-3 w-3" /> Email settings
          </Button>
        </div>
      </div>

      {showPreferences ? (
        <Card className="mb-5 border-border/70">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm"><FaEnvelope className="text-brand-accent" /> Email notification preferences</CardTitle>
            <p className="text-[11px] text-muted-foreground">These settings affect email delivery only. In-app notifications remain enabled.</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {preferences.isPending ? <p className="text-xs text-muted-foreground">Loading preferences…</p> : preferences.isError ? <p className="text-xs text-destructive">Could not load email preferences.</p> : preferences.data ? (
              <>
                <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-3 py-3">
                  <div>
                    <p className="text-xs font-semibold">Email notifications</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">Pause or resume non-essential notification emails.</p>
                  </div>
                  <Switch checked={preferences.data.emailEnabled} disabled={updatePreferences.isPending} onCheckedChange={(checked) => void updateEmailEnabled(checked)} aria-label="Enable email notifications" />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {categories.map((item) => {
                    const locked = lockedCategories.has(item.value as 'ACCOUNT' | 'PAYMENTS' | 'SUBSCRIPTIONS');
                    return (
                      <div key={item.value} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2.5">
                        <div>
                          <p className="text-xs font-medium">{item.label}</p>
                          {locked ? <p className="mt-0.5 text-[10px] text-muted-foreground">Required security or billing email</p> : null}
                        </div>
                        <Switch
                          size="sm"
                          checked={Boolean(preferences.data.emailCategories[item.value])}
                          disabled={locked || !preferences.data.emailEnabled || updatePreferences.isPending}
                          onCheckedChange={(checked) => void updateCategoryPreference(item.value, checked)}
                          aria-label={`${item.label} email notifications`}
                        />
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] leading-relaxed text-muted-foreground">{preferences.data.note}</p>
              </>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-border/70">
        <CardHeader className="gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm"><FaInbox className="text-brand-accent" /> Your inbox</CardTitle>
            <p className="mt-1 text-[11px] text-muted-foreground">New updates appear here automatically.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={category}
              onChange={(event) => { setCategory(event.target.value as NotificationCategory | 'ALL'); setPage(1); }}
              className="h-8 rounded-lg border border-border bg-background px-2 text-[11px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Filter notifications by category"
            >
              <option value="ALL">All categories</option>
              {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <label className="inline-flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-medium">
              <Switch size="sm" checked={unreadOnly} onCheckedChange={(checked) => { setUnreadOnly(checked); setPage(1); }} aria-label="Show unread notifications only" />
              Unread only
            </label>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {list.isPending ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-xl bg-muted" />)}
            </div>
          ) : list.isError ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm font-semibold">Notifications could not be loaded</p>
              <p className="mt-1 text-xs text-muted-foreground">Check your connection and try again.</p>
              <Button size="sm" variant="outline" className="mt-4" onClick={() => void list.refetch()}>Retry</Button>
            </div>
          ) : items.length ? (
            <div className="divide-y divide-border/60">
              {items.map((notification) => {
                const actionLabel = notificationActionLabel(
                  notification.presentation,
                  notification.actionUrl,
                );
                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => void handleOpen(notification)}
                    className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/40 sm:px-5"
                  >
                    <NotificationVisual
                      presentation={notification.presentation}
                      className="h-11 w-11 rounded-xl"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-foreground sm:text-sm">{notification.title}</span>
                        {!notification.readAt ? <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase text-brand-accent">Unread</span> : null}
                      </span>
                      <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground">{notification.message}</span>
                      <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground/80">
                        <span>{categoryLabel(notification.category)}</span><span aria-hidden="true">·</span><span>{formatDate(notification.createdAt)}</span>
                        {actionLabel ? <span className="font-bold text-brand-accent">· {actionLabel}</span> : null}
                      </span>
                    </span>
                    {!notification.readAt ? <FaCheck className="mt-1 h-3 w-3 shrink-0 text-brand-accent/70" aria-label="Unread" /> : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center px-5 py-14 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground"><FaInbox className="h-5 w-5" /></span>
              <p className="text-sm font-semibold">No notifications found</p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">There are no notifications matching the selected filters.</p>
            </div>
          )}
        </CardContent>

        {pagination && pagination.pages > 1 ? (
          <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 sm:px-5">
            <p className="text-[10px] text-muted-foreground">Page {pagination.page} of {pagination.pages} · {pagination.total} notifications</p>
            <div className="flex items-center gap-1.5">
              <Button size="icon-sm" variant="outline" disabled={page <= 1 || list.isFetching} onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label="Previous page"><FaChevronLeft className="h-3 w-3" /></Button>
              <Button size="icon-sm" variant="outline" disabled={page >= pagination.pages || list.isFetching} onClick={() => setPage((value) => Math.min(pagination.pages, value + 1))} aria-label="Next page"><FaChevronRight className="h-3 w-3" /></Button>
            </div>
          </div>
        ) : null}
      </Card>
    </main>
  );
}


