'use client';

import { useEffect, useState } from 'react';
import { usePlanConfigQuery, useUpdatePlanConfigMutation } from '@/hooks/use-plan-config';
import type { BankDetails } from '@/types/plan-config';
import { AdminError, AdminNotice, AdminPanel, adminInput, adminPrimaryButton } from '@/components/admin/AdminWorkspace';

const emptyBank: BankDetails = { bankName: '', accountName: '', accountNumber: '', instructions: '' };
type CurrencyKey = 'NGN' | 'USD';

export default function BankDetailsPanel() {
  const query = usePlanConfigQuery();
  const mutation = useUpdatePlanConfigMutation();
  const [draft, setDraft] = useState<{ NGN: BankDetails; USD: BankDetails }>({ NGN: emptyBank, USD: emptyBank });
  useEffect(() => {
    if (query.data) setDraft({
      NGN: { ...emptyBank, ...(query.data.bankDetails ?? {}) },
      USD: { ...emptyBank, ...(query.data.bankDetailsUSD ?? {}) },
    });
  }, [query.data]);

  const update = (currency: CurrencyKey, key: keyof BankDetails, value: string) => setDraft((current) => ({ ...current, [currency]: { ...current[currency], [key]: value } }));
  const save = (currency: CurrencyKey) => mutation.mutate({ body: currency === 'NGN' ? { bankDetails: draft.NGN } : { bankDetailsUSD: draft.USD } });
  const editor = (currency: CurrencyKey, title: string) => (
    <div className="space-y-2 rounded-md border border-border/70 p-2.5">
      <div className="flex items-center justify-between gap-2"><h3 className="text-[11px] font-semibold">{title}</h3><button type="button" className={adminPrimaryButton} disabled={mutation.isPending} onClick={() => save(currency)}>Save {currency}</button></div>
      <div className="grid grid-cols-2 gap-2">{([['bankName', 'Bank name'], ['accountName', 'Account name'], ['accountNumber', 'Account number']] as Array<[keyof BankDetails, string]>).map(([key, label]) => <label key={key} className="min-w-0"><span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span><input className={adminInput} maxLength={160} value={draft[currency][key]} onChange={(event) => update(currency, key, event.target.value)} /></label>)}</div>
      <label className="block"><span className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Instructions</span><textarea className="min-h-14 w-full resize-y rounded-md border border-border bg-background px-2 py-1.5 text-[11px]" maxLength={2000} value={draft[currency].instructions} onChange={(event) => update(currency, 'instructions', event.target.value)} /></label>
    </div>
  );

  return (
    <AdminPanel title="Bank transfer details" meta="Stored independently for NGN and USD">
      {query.isLoading ? <div className="p-3 text-[11px] text-muted-foreground">Loading bank details…</div> : query.isError ? <div className="p-2.5"><AdminError error={query.error} retry={() => void query.refetch()} /></div> : (
        <div className="space-y-2 p-2.5">
          <div className="grid gap-2 lg:grid-cols-2">{editor('NGN', 'Nigeria · NGN')}{editor('USD', 'International · USD')}</div>
          {mutation.isError && <AdminError error={mutation.error} retry={() => mutation.reset()} />}
          {mutation.isSuccess && <AdminNotice kind="success">Bank details updated.</AdminNotice>}
        </div>
      )}
    </AdminPanel>
  );
}
