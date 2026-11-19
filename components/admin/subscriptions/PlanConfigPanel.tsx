'use client';

import { useEffect, useState } from 'react';
import { usePlanConfigQuery, useUpdatePlanConfigMutation } from '@/hooks/use-plan-config';
import type { PlanConfig, PlanConfigUpdate } from '@/types/plan-config';
import { AdminError, AdminNotice, AdminPanel, adminInput, adminPrimaryButton } from '@/components/admin/AdminWorkspace';

const priceFields = [
  ['regularPrice', 'Regular · NGN'], ['vipPrice', 'VIP · NGN'], ['premiumPrice', 'Premium · NGN'],
  ['regularPriceUSD', 'Regular · USD'], ['vipPriceUSD', 'VIP · USD'], ['premiumPriceUSD', 'Premium · USD'],
] as const;
const initialConfig = (config: PlanConfig): PlanConfig => ({
  ...config,
  bankDetails: { ...(config.bankDetails ?? { bankName: '', accountName: '', accountNumber: '', instructions: '' }) },
  bankDetailsUSD: { ...(config.bankDetailsUSD ?? { bankName: '', accountName: '', accountNumber: '', instructions: '' }) },
  planLabels: { ...(config.planLabels ?? {}), free: config.planLabels?.free ?? 'Free Plan', regular: config.planLabels?.regular ?? 'Regular Plan', vip: config.planLabels?.vip ?? 'VIP Plan', premium: config.planLabels?.premium ?? 'Premium Plan' },
});

export default function PlanConfigPanel() {
  const query = usePlanConfigQuery();
  const mutation = useUpdatePlanConfigMutation();
  const [draft, setDraft] = useState<PlanConfig | null>(null);
  useEffect(() => { if (query.data) setDraft(initialConfig(query.data)); }, [query.data]);

  const updatePrice = (key: typeof priceFields[number][0], value: string) => setDraft((current) => current ? { ...current, [key]: value === '' ? 0 : Number(value) } : current);
  const updateLabel = (key: keyof PlanConfig['planLabels'], value: string) => setDraft((current) => current ? { ...current, planLabels: { ...current.planLabels, [key]: value } } : current);

  const save = () => {
    if (!draft) return;
    if (priceFields.some(([key]) => !Number.isFinite(Number(draft[key])) || Number(draft[key]) < 0 || Number(draft[key]) > 1_000_000_000)) return;
    if (Object.values(draft.planLabels).some((value) => !String(value).trim() || value.length > 80)) return;
    const body: PlanConfigUpdate = {
      regularPrice: Number(draft.regularPrice),
      vipPrice: Number(draft.vipPrice),
      premiumPrice: Number(draft.premiumPrice),
      regularPriceUSD: Number(draft.regularPriceUSD),
      vipPriceUSD: Number(draft.vipPriceUSD),
      premiumPriceUSD: Number(draft.premiumPriceUSD),
      planLabels: draft.planLabels,
    };
    mutation.mutate({ body });
  };

  return (
    <AdminPanel title="Subscription pricing" meta="NGN and USD · paid plans are fixed at 30 days" actions={<button type="button" className={adminPrimaryButton} disabled={!draft || mutation.isPending} onClick={save}>{mutation.isPending ? 'Saving…' : 'Save pricing'}</button>}>
      {query.isLoading ? <div className="p-3 text-[11px] text-muted-foreground">Loading pricing…</div> : query.isError ? <div className="p-2.5"><AdminError error={query.error} retry={() => void query.refetch()} /></div> : draft ? (
        <div className="space-y-2 p-2.5">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">{priceFields.map(([key, label]) => <label key={key} className="min-w-0"><span className="mb-1 block truncate text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span><input className={adminInput} type="number" min="0" max="1000000000" step="any" value={draft[key]} onChange={(event) => updatePrice(key, event.target.value)} /></label>)}</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{(['free', 'regular', 'vip', 'premium'] as const).map((key) => <label key={key} className="min-w-0"><span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">{key} label</span><input className={adminInput} maxLength={80} value={draft.planLabels[key]} onChange={(event) => updateLabel(key, event.target.value)} /></label>)}</div>
          {mutation.isError && <AdminError error={mutation.error} retry={() => mutation.reset()} />}
          {mutation.isSuccess && <AdminNotice kind="success">Pricing updated.</AdminNotice>}
        </div>
      ) : null}
    </AdminPanel>
  );
}

