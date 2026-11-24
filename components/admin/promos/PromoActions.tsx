'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { deactivatePromo } from '@/services/promos.service';
export default function PromoActions({ promoId, isActive, onChanged }: { promoId: string; isActive: boolean; onChanged?: () => void }) {
  const [loading, setLoading] = useState(false);
  if (!isActive) return <span className="text-[10px] text-muted-foreground">Inactive</span>;
  return <button type="button" disabled={loading} onClick={async () => {
    if (!window.confirm('Deactivate this campaign?')) return;
    setLoading(true);
    try { await deactivatePromo(promoId); toast.success('Campaign deactivated'); onChanged?.(); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to deactivate campaign'); }
    finally { setLoading(false); }
  }} className="text-xs text-status-danger disabled:opacity-50">{loading ? 'Disabling…' : 'Deactivate'}</button>;
}

