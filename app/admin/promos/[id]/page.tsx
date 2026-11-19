'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { usePromo, usePromoRewards } from '@/hooks/use-promos';
import PromoForm from '@/components/admin/promos/PromoForm';
import type { Promo, PromoReward } from '@/types/promos';
const arr = <T,>(value: unknown): T[] => Array.isArray(value) ? value as T[] : Array.isArray((value as any)?.data) ? (value as any).data : Array.isArray((value as any)?.items) ? (value as any).items : [];
const label = (v: unknown) => typeof v === 'string' ? v : v && typeof v === 'object' ? String((v as any).email ?? (v as any).username ?? (v as any)._id ?? '—') : '—';
export default function EditPromoPage() {
  const params = useParams<{ id: string }>();
  const id = String(params.id ?? '');
  const promoQuery = usePromo(id);
  const rewardsQuery = usePromoRewards(id);
  if (promoQuery.isLoading) return <main className="space-y-3 p-3"><div className="h-7 w-40 animate-pulse rounded bg-muted"/><div className="h-80 animate-pulse rounded-lg bg-muted"/></main>;
  if (promoQuery.isError || !promoQuery.data) return <main className="space-y-2 p-3"><p className="text-sm font-semibold">Campaign could not be loaded.</p><button onClick={() => void promoQuery.refetch()} className="h-8 rounded-md border px-3 text-xs">Retry</button><Link href="/admin/promos" className="ml-2 text-xs text-primary">Back to promotions</Link></main>;
  const promo = promoQuery.data as Promo;
  const rewards = arr<PromoReward>(rewardsQuery.data);
  return <main className="mx-auto w-full max-w-[1400px] space-y-3 p-2 sm:p-3"><header className="flex items-center justify-between gap-2"><div><h1 className="text-lg font-semibold tracking-tight">Edit promotion</h1><p className="mt-0.5 text-xs text-muted-foreground">{promo.name}</p></div><Link href="/admin/promos" className="text-xs text-primary hover:underline">← All promotions</Link></header><PromoForm promo={promo}/>
    <section className="overflow-hidden rounded-lg border bg-card"><div className="flex h-10 items-center justify-between border-b px-3"><h2 className="text-sm font-semibold">Campaign reward history</h2><span className="text-[11px] text-muted-foreground">{rewards.length} records</span></div>{rewardsQuery.isLoading ? <p className="p-3 text-xs text-muted-foreground">Loading reward history…</p> : rewardsQuery.isError ? <div className="p-3 text-xs text-destructive">Unable to load reward history. <button onClick={() => void rewardsQuery.refetch()} className="underline">Retry</button></div> : !rewards.length ? <p className="p-5 text-center text-xs text-muted-foreground">No reward records for this campaign.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-xs"><thead className="bg-muted/40 text-[10px] uppercase text-muted-foreground"><tr>{['User','Reward','Plan / points','Status','Created'].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead><tbody className="divide-y">{rewards.map((r) => <tr key={r._id}><td className="px-3 py-2">{label(r.userId)}</td><td className="px-3 py-2">{r.rewardType ?? r.type ?? '—'}</td><td className="px-3 py-2">{r.plan ?? (r.pointsAmount ? `${r.pointsAmount.toLocaleString()} points` : '—')}{r.durationDays ? ` · ${r.durationDays} days` : ''}</td><td className="px-3 py-2">{r.status ?? '—'}</td><td className="px-3 py-2">{r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}</td></tr>)}</tbody></table></div>}</section>
  </main>;
}
