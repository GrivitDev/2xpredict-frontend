'use client';

import { FaLock } from 'react-icons/fa6';
import type { ApiRecord } from '@/lib/api-shapes';
import { marketCodeOf, marketNameOf, marketShortLabel } from './bet-lab.utils';

type Props = {
  markets: ApiRecord[];
  activeMarketCode: string;
  loading?: boolean;
  locked?: boolean;
  emptyMessage?: string;
  onSelect: (marketCode: string) => void;
  onRequestAccess?: () => void;
};

export default function MarketSelector({
  markets,
  activeMarketCode,
  loading = false,
  locked = false,
  emptyMessage,
  onSelect,
  onRequestAccess,
}: Props) {
  return (
    <div className="border-b border-border/70 bg-card/95 px-2 py-1.5 sm:px-2.5">
      {loading && !markets.length ? (
        <div className="flex gap-1.5 overflow-hidden">
          {[0, 1, 2, 3, 4, 5].map((item) => <span key={item} className="h-6 w-20 shrink-0 animate-pulse rounded-md bg-muted" />)}
        </div>
      ) : markets.length ? (
        <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none" role="tablist" aria-label="Betting markets">
          {markets.map((market) => {
            const code = marketCodeOf(market);
            const active = code === activeMarketCode;
            const label = marketShortLabel(market);
            return (
              <button
                key={code}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => locked ? onRequestAccess?.() : onSelect(code)}
                title={marketNameOf(market)}
                className={`inline-flex min-h-7 shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-[8px] font-bold transition sm:text-[9px] ${active ? 'border-primary bg-primary text-primary-foreground shadow-sm' : 'border-border bg-background/75 text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}
              >
                {locked ? <FaLock className={`h-2.5 w-2.5 ${active ? 'text-primary-foreground/80' : 'text-muted-foreground'}`} /> : null}
                {label}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="py-2 text-[10px] text-muted-foreground">{emptyMessage ?? (locked ? 'Sign in to view the supported markets.' : 'No supported markets are currently available.')}</p>
      )}
    </div>
  );
}



