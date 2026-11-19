'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { betLabService, type BetLabVirtualPointsSettings, type BetLabSettingsResponse } from '@/services/bet-lab.service';
import { AdminError, AdminNotice, AdminPanel, adminInput, adminPrimaryButton } from '@/components/admin/AdminWorkspace';

const defaults: BetLabVirtualPointsSettings = {
  registrationBonus: 10_000,
  monthlyAllowanceByPlan: {
    free: 1_000,
    regular: 3_000,
    vip: 5_000,
    premium: 10_000,
  },
};

const normalizeSettings = (response: BetLabSettingsResponse): BetLabVirtualPointsSettings => {
  const points = response as any;
  return {
    registrationBonus: Number(points?.registrationBonus ?? defaults.registrationBonus),
    monthlyAllowanceByPlan: {
      free: Number(points?.monthlyAllowanceByPlan?.free ?? defaults.monthlyAllowanceByPlan.free),
      regular: Number(points?.monthlyAllowanceByPlan?.regular ?? defaults.monthlyAllowanceByPlan.regular),
      vip: Number(points?.monthlyAllowanceByPlan?.vip ?? defaults.monthlyAllowanceByPlan.vip),
      premium: Number(points?.monthlyAllowanceByPlan?.premium ?? defaults.monthlyAllowanceByPlan.premium),
    },
  };
};

const fields = [
  { key: 'free', label: 'Free', description: 'Monthly virtual points for Free users' },
  { key: 'regular', label: 'Regular', description: 'Monthly virtual points for Regular subscribers' },
  { key: 'vip', label: 'VIP', description: 'Monthly virtual points for VIP subscribers' },
  { key: 'premium', label: 'Premium', description: 'Monthly virtual points for Premium subscribers' },
] as const;

const positiveInteger = (value: number) => Number.isSafeInteger(value) && value >= 0;

export default function BetLabSettingsPanel() {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['admin-bet-lab-settings'],
    queryFn: () => betLabService.getSettings(),
    staleTime: 15_000,
  });
  const [draft, setDraft] = useState<BetLabVirtualPointsSettings>(defaults);

  useEffect(() => {
    if (query.data) setDraft(normalizeSettings(query.data));
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: (payload: BetLabVirtualPointsSettings) =>
      betLabService.updateSettings(payload),
    onSuccess: async (saved) => {
      client.setQueryData(['admin-bet-lab-settings'], saved);
      await client.invalidateQueries({ queryKey: ['admin-bet-lab-settings'] });
    },
  });

  const updateAllowance = (plan: keyof BetLabVirtualPointsSettings['monthlyAllowanceByPlan'], value: string) => {
    setDraft((current) => ({
      ...current,
      monthlyAllowanceByPlan: {
        ...current.monthlyAllowanceByPlan,
        [plan]: value === '' ? 0 : Number(value),
      },
    }));
    mutation.reset();
  };

  const valid =
    positiveInteger(Number(draft.registrationBonus)) &&
    fields.every(({ key }) => positiveInteger(Number(draft.monthlyAllowanceByPlan[key])));

  const save = () => {
    if (!valid) return;
    mutation.mutate({
      registrationBonus: Number(draft.registrationBonus),
      monthlyAllowanceByPlan: {
        free: Number(draft.monthlyAllowanceByPlan.free),
        regular: Number(draft.monthlyAllowanceByPlan.regular),
        vip: Number(draft.monthlyAllowanceByPlan.vip),
        premium: Number(draft.monthlyAllowanceByPlan.premium),
      },
    });
  };

  return (
    <AdminPanel
      title="Bet Lab virtual points"
      meta="Configure the one-time welcome bonus and monthly points by subscription plan"
      actions={
        <button type="button" className={adminPrimaryButton} disabled={!query.data || !valid || mutation.isPending} onClick={save}>
          {mutation.isPending ? 'Saving…' : 'Save settings'}
        </button>
      }
    >
      {query.isLoading ? (
        <div className="p-3 text-[11px] text-muted-foreground">Loading Bet Lab settings…</div>
      ) : query.isError ? (
        <div className="p-2.5">
          <AdminError error={query.error} retry={() => void query.refetch()} />
        </div>
      ) : (
        <div className="space-y-3 p-2.5">
          <div className="rounded-md border border-border/70 p-3">
            <label className="block max-w-sm">
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">One-time registration bonus</span>
              <input
                className={adminInput}
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={draft.registrationBonus}
                onChange={(event) => {
                  setDraft((current) => ({ ...current, registrationBonus: event.target.value === '' ? 0 : Number(event.target.value) }));
                  mutation.reset();
                }}
              />
              <span className="mt-1 block text-[10px] text-muted-foreground">Granted once when a user’s Bet Lab wallet is first created. Updating this value does not reissue bonuses.</span>
            </label>
          </div>

          <div>
            <h3 className="mb-2 text-[11px] font-semibold">Monthly allowance by plan</h3>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {fields.map(({ key, label, description }) => (
                <label key={key} className="min-w-0 rounded-md border border-border/70 p-2.5">
                  <span className="block text-[11px] font-semibold">{label}</span>
                  <span className="mb-2 mt-0.5 block min-h-7 text-[10px] text-muted-foreground">{description}</span>
                  <input
                    className={adminInput}
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={draft.monthlyAllowanceByPlan[key]}
                    onChange={(event) => updateAllowance(key, event.target.value)}
                  />
                </label>
              ))}
            </div>
          </div>

          {!valid && <p className="text-[10px] text-destructive">Enter whole numbers of zero or greater for every points value.</p>}
          {mutation.isError && <AdminError error={mutation.error} retry={() => mutation.reset()} />}
          {mutation.isSuccess && <AdminNotice kind="success">Bet Lab virtual-points settings saved.</AdminNotice>}

          <div className="rounded-md bg-muted/40 px-3 py-2 text-[10px] leading-4 text-muted-foreground">
            Settings affect wallet initialization and eligible monthly allowance refreshes. Existing balances are not rewritten immediately. The welcome bonus remains one-time, and monthly credits follow the existing wallet period rules.
          </div>
        </div>
      )}
    </AdminPanel>
  );
}

