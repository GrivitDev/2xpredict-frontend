'use client';

import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { FaEnvelope, FaRotate } from 'react-icons/fa6';
import { Switch } from '@/components/ui/switch';
import { useNotificationPreferencesQuery, useUpdateNotificationPreferencesMutation } from '@/hooks/use-notifications';
import type { NotificationCategory, NotificationEmailCategories } from '@/types/notifications';

const categories: Array<{ value: NotificationCategory; label: string; description: string }> = [
  { value: 'ACCOUNT', label: 'Account', description: 'Account and security activity' },
  { value: 'REFERRALS', label: 'Referrals', description: 'Referral registrations and rewards' },
  { value: 'BONUSES', label: 'Bonuses', description: 'Bonus grants and expiries' },
  { value: 'PAYMENTS', label: 'Payments', description: 'Payment submissions and decisions' },
  { value: 'SUBSCRIPTIONS', label: 'Subscriptions', description: 'Plan activations, renewals and expiry' },
  { value: 'BET_LAB', label: 'Bet Lab', description: 'Ticket activity and settlement updates' },
  { value: 'WALLET', label: 'Wallet', description: 'Virtual wallet credits and debits' },
  { value: 'PROMOTIONS', label: 'Promotions', description: 'Campaigns and unlocked rewards' },
  { value: 'CUSTOMER_CARE', label: 'Customer care', description: 'Replies and support request updates' },
  { value: 'SYSTEM', label: 'System', description: 'Platform announcements' },
];

export default function AccountNotificationPreferences() {
  const preferences = useNotificationPreferencesQuery({ staleTime: 30_000 });
  const update = useUpdateNotificationPreferencesMutation();
  const lockedCategories = useMemo(() => new Set(preferences.data?.essentialCategoriesLocked ?? []), [preferences.data?.essentialCategoriesLocked]);

  async function setEmailEnabled(checked: boolean) {
    try {
      await update.mutateAsync({ emailEnabled: checked });
      toast.success(checked ? 'Email notifications enabled.' : 'Email notifications paused.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update email preferences.');
    }
  }

  async function setCategory(category: NotificationCategory, checked: boolean) {
    const current = preferences.data?.emailCategories ?? ({} as NotificationEmailCategories);
    try {
      await update.mutateAsync({ categories: { ...current, [category]: checked } });
      toast.success(`${category.replace(/_/g, ' ')} email preference updated.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update email preferences.');
    }
  }

  return (
    <section className="rounded-xl border border-border/70 bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-brand-accent"><FaEnvelope /></span><div><h2 className="text-sm font-bold">Email notification preferences</h2><p className="text-[10px] text-muted-foreground">Control the categories of notification email sent to you.</p></div></div>
        <button type="button" onClick={() => void preferences.refetch()} disabled={preferences.isFetching} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[10px] font-semibold text-muted-foreground hover:bg-muted"><FaRotate className={preferences.isFetching ? 'animate-spin' : ''} /> Refresh</button>
      </div>

      {preferences.isLoading ? <div className="mt-3 space-y-2">{[0, 1, 2, 3].map((item) => <div key={item} className="h-12 animate-pulse rounded-lg bg-muted" />)}</div> : null}
      {preferences.isError ? <p className="mt-3 text-xs text-destructive">Notification preferences could not be loaded. <button type="button" onClick={() => void preferences.refetch()} className="font-semibold underline">Retry</button></p> : null}

      {preferences.data ? (
        <>
          <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/35 px-3 py-3">
            <div><p className="text-xs font-semibold">Email notifications</p><p className="mt-0.5 text-[10px] text-muted-foreground">Pause or resume non-essential notification emails.</p></div>
            <Switch checked={preferences.data.emailEnabled} disabled={update.isPending} onCheckedChange={(checked) => void setEmailEnabled(checked)} aria-label="Enable email notifications" />
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {categories.map((category) => {
              const locked = lockedCategories.has(category.value as 'ACCOUNT' | 'PAYMENTS' | 'SUBSCRIPTIONS');
              return (
                <div key={category.value} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2.5">
                  <div className="min-w-0"><p className="text-xs font-semibold">{category.label}</p><p className="mt-0.5 text-[9px] text-muted-foreground">{locked ? 'Required security or billing email' : category.description}</p></div>
                  <Switch size="sm" checked={Boolean(preferences.data.emailCategories?.[category.value])} disabled={locked || !preferences.data.emailEnabled || update.isPending} onCheckedChange={(checked) => void setCategory(category.value, checked)} aria-label={`${category.label} email notifications`} />
                </div>
              );
            })}
          </div>
          <p className="mt-3 rounded-lg bg-muted/35 p-3 text-[10px] leading-5 text-muted-foreground">{preferences.data.note} In-app notifications remain available separately through the notification inbox.</p>
        </>
      ) : null}
    </section>
  );
}

