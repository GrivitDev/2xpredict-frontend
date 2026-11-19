'use client';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { deactivatePromo } from '@/services/promos.service';
import type { Promo } from '@/types/promos';

const money = (value: unknown, currency?: string) => typeof value === 'number' ? new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-NG', { style: 'currency', currency: currency === 'USD' ? 'USD' : 'NGN', maximumFractionDigits: 2 }).format(value) : '—';
const title = (value?: string) => value ? value.replaceAll('_', ' ') : '—';
export default function PromoTable({ promos, onRefresh }: { promos: Promo[]; onRefresh?: () => void }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const deactivate = async (promo: Promo) => {
    if (!window.confirm(`Deactivate “${promo.name}”?`)) return;
    setBusyId(promo._id);
    try { await deactivatePromo(promo._id); toast.success('Campaign deactivated'); onRefresh?.(); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Could not deactivate campaign'); }
    finally { setBusyId(null); }
  };
  return <section className="overflow-hidden rounded-lg border bg-card">
    <div className="flex h-10 items-center justify-between border-b px-3"><h2 className="text-sm font-semibold">Campaigns</h2><span className="text-[11px] text-muted-foreground">{promos.length} records</span></div>
    {!promos.length ? <p className="px-3 py-8 text-center text-xs text-muted-foreground">No campaigns found.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[880px] text-left text-xs"><thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground"><tr>{['Campaign','Kind / purpose','Discount / benefit','Eligible plans','Redemptions','Window','Status',''].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr></thead><tbody className="divide-y divide-border/60">{promos.map((p) => <tr key={p._id} className="hover:bg-muted/20">
      <td className="px-3 py-2.5"><div className="font-semibold">{p.name}</div><div className="mt-0.5 text-[10px] text-muted-foreground">{p.promoCode || p.campaignType}</div></td>
      <td className="px-3 py-2.5"><div className="capitalize">{title(p.promotionKind)}</div><div className="text-[10px] text-muted-foreground">{title(p.purpose)}</div></td>
      <td className="px-3 py-2.5">{p.discountType ? <>{p.discountType === 'percentage' ? `${p.discountValue}%` : money(p.discountValue, p.amountCurrency)} off</> : '—'}{p.pointsAmount ? <div className="text-[10px] text-muted-foreground">+ {p.pointsAmount.toLocaleString()} points</div> : p.rewardType ? <div className="text-[10px] text-muted-foreground">{p.rewardType === 'subscription' ? `${p.rewardPlan ?? ''} access` : 'Points reward'}</div> : null}</td>
      <td className="px-3 py-2.5 capitalize">{p.eligiblePlans?.length ? p.eligiblePlans.join(', ') : 'All / rule-based'}</td>
      <td className="px-3 py-2.5 tabular-nums">{p.redemptionCount ?? 0}{p.totalRedemptionLimit != null ? ` / ${p.totalRedemptionLimit}` : ''}<div className="text-[10px] text-muted-foreground">{p.reservedRedemptions ?? 0} reserved</div></td>
      <td className="whitespace-nowrap px-3 py-2.5">{p.startDate ? new Date(p.startDate).toLocaleDateString() : '—'}<div className="text-[10px] text-muted-foreground">to {p.endDate ? new Date(p.endDate).toLocaleDateString() : '—'}</div></td>
      <td className="px-3 py-2.5"><span className={`rounded px-1.5 py-1 text-[10px] font-semibold ${p.isActive ? 'bg-emerald-500/10 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
      <td className="px-3 py-2.5"><div className="flex items-center gap-2"><Link href={`/admin/promos/${p._id}`} className="font-medium text-primary hover:underline">Edit</Link>{p.isActive && <button disabled={busyId === p._id} onClick={() => void deactivate(p)} className="text-red-600 hover:underline disabled:opacity-50">{busyId === p._id ? '…' : 'Disable'}</button>}</div></td>
    </tr>)}</tbody></table></div>}
  </section>;
}
