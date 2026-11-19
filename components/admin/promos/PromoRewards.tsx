'use client';
import { usePromoRewards } from '@/hooks/use-promos';
import type { PromoReward } from '@/types/promos';
const arr = (value: unknown): PromoReward[] => Array.isArray(value) ? value as PromoReward[] : Array.isArray((value as any)?.data) ? (value as any).data : [];
export default function PromoRewards({ promoId }: { promoId: string }) {
  const query = usePromoRewards(promoId);
  const rows = arr(query.data);
  return <section className="overflow-hidden rounded-lg border bg-card"><h2 className="border-b px-3 py-2 text-sm font-semibold">Reward records</h2>{query.isLoading ? <p className="p-3 text-xs text-muted-foreground">Loading…</p> : query.isError ? <p className="p-3 text-xs text-destructive">Unable to load rewards.</p> : rows.length ? <div className="overflow-x-auto"><table className="w-full min-w-[500px] text-left text-xs"><thead className="bg-muted/40 text-[10px] uppercase text-muted-foreground"><tr><th className="px-3 py-2">User</th><th className="px-3 py-2">Reward</th><th className="px-3 py-2">Benefit</th><th className="px-3 py-2">Status</th></tr></thead><tbody className="divide-y">{rows.map((r) => <tr key={r._id}><td className="px-3 py-2">{typeof r.userId === 'object' ? r.userId.email ?? r.userId.username ?? '—' : r.userId ?? '—'}</td><td className="px-3 py-2">{r.rewardType ?? r.type ?? '—'}</td><td className="px-3 py-2">{r.plan ?? (r.pointsAmount ? `${r.pointsAmount.toLocaleString()} points` : '—')}{r.durationDays ? ` · ${r.durationDays} days` : ''}</td><td className="px-3 py-2">{r.status ?? '—'}</td></tr>)}</tbody></table></div> : <p className="p-4 text-xs text-muted-foreground">No reward records.</p>}</section>;
}
