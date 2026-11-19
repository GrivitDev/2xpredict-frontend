'use client';

import { createPortal } from 'react-dom';
import { FaArrowRight, FaFutbol, FaLock, FaTicket, FaXmark } from 'react-icons/fa6';
import { formatPoints } from '@/lib/api-shapes';
import useBetLabScrollLock from './use-bet-lab-scroll-lock';
import type { TicketPick } from './bet-lab.utils';

type Props = {
  picks: TicketPick[];
  stake: string;
  combinedOdds: number;
  potentialReturn: number;
  isPlacing: boolean;
  mobileOpen?: boolean;
  locked?: boolean;
  onStakeChange: (value: string) => void;
  onRemovePick: (pick: TicketPick) => void;
  onPlaceTicket: () => void;
  onRequestAccess?: () => void;
  onCloseMobile?: () => void;
};

export default function BetSlipPanel({
  picks,
  stake,
  combinedOdds,
  potentialReturn,
  isPlacing,
  mobileOpen = false,
  locked = false,
  onStakeChange,
  onRemovePick,
  onPlaceTicket,
  onRequestAccess,
  onCloseMobile,
}: Props) {
  useBetLabScrollLock(mobileOpen);

  const content = locked ? (
    <div className="flex flex-col items-center justify-center px-3 py-6 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary"><FaLock className="h-3.5 w-3.5" /></span>
      <h3 className="mt-2 text-[11px] font-extrabold">Your slip is waiting</h3>
      <p className="mt-1 max-w-[210px] text-[9px] leading-4 text-muted-foreground">Register or log in to unlock selections, choose your stake and build a virtual ticket.</p>
      <button type="button" onClick={onRequestAccess} className="mt-3 inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-[9px] font-extrabold text-primary-foreground shadow-sm transition hover:brightness-110">
        <FaLock className="h-2.5 w-2.5" /> Unlock Bet Lab
      </button>
      <p className="mt-3 text-[8px] text-muted-foreground">Virtual play only · No real-money stakes</p>
    </div>
  ) : (
    <>
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/70 px-2.5 py-2">
        <div className="flex items-center gap-1.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary"><FaTicket className="h-3 w-3" /></span>
          <div>
            <p className="text-[10px] font-extrabold">Your selections</p>
            <p className="text-[8px] text-muted-foreground">Related same-match selections are priced together</p>
          </div>
        </div>
        <span className="rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[8px] font-extrabold tabular-nums text-primary">{picks.length}</span>
      </div>

      <div className="flex flex-col gap-1.5 p-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[8px] font-medium text-muted-foreground">{picks.length} selection{picks.length === 1 ? '' : 's'} added</p>
        </div>

        {picks.length ? (
          <div className="space-y-1">
            {picks.map((pick) => (
              <article key={`${pick.eventId}:${pick.marketCode}:${pick.selectionCode}`} className="rounded-md border border-border/75 bg-background/65 px-2 py-1.5">
                <div className="flex items-start gap-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold leading-4">{pick.eventName}</p>
                    <p className="text-[8px] font-medium text-muted-foreground">{pick.marketName}</p>
                    <p className="mt-0.5 text-[9px] font-extrabold text-foreground">{pick.selectionName}</p>
                  </div>
                  <button type="button" onClick={() => onRemovePick(pick)} aria-label={`Remove ${pick.selectionName}`} className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition hover:bg-rose-500/10 hover:text-rose-600"><FaXmark className="h-2.5 w-2.5" /></button>
                </div>
                <div className="mt-1 flex items-center justify-between border-t border-border/50 pt-1">
                  <span className="text-[8px] font-medium text-muted-foreground">Market odds</span>
                  <strong className="text-[10px] font-black tabular-nums text-sky-600 dark:text-sky-400">{pick.odds.toFixed(2)}</strong>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[100px] flex-col items-center justify-center rounded-md border border-dashed border-border px-2 py-4 text-center">
            <FaFutbol className="h-4 w-4 text-muted-foreground/45" />
            <p className="mt-1.5 text-[9px] font-extrabold">No selections yet</p>
            <p className="mt-0.5 max-w-[190px] text-[8px] leading-4 text-muted-foreground">Choose compatible selections from any available markets or fixtures.</p>
          </div>
        )}

        <div className="mt-auto space-y-1.5 border-t border-border/70 pt-2">
          <div>
            <label htmlFor="bet-lab-stake" className="mb-1 block text-[9px] font-bold">Stake (points)</label>
            <input
              id="bet-lab-stake"
              type="number"
              min={1}
              step={1}
              value={stake}
              onChange={(event) => onStakeChange(event.target.value)}
              className="h-8 w-full rounded-md border border-border bg-background px-2.5 text-[11px] font-bold tabular-nums outline-none transition focus:border-primary"
            />
          </div>
          <div className="space-y-1 rounded-md border border-border/60 bg-muted/35 p-2 text-[9px]">
            <div className="flex items-center justify-between gap-2"><span className="text-muted-foreground">Selections</span><strong className="font-extrabold tabular-nums">{picks.length}</strong></div>
            <div className="flex items-center justify-between gap-2"><span className="text-muted-foreground">Total odds</span><strong className="font-black tabular-nums text-sky-600 dark:text-sky-400">{picks.length ? combinedOdds.toFixed(2) : '—'}</strong></div>
            <div className="flex items-center justify-between gap-2"><span className="text-muted-foreground">Potential return</span><strong className="font-black tabular-nums text-emerald-600 dark:text-emerald-400">{picks.length && potentialReturn > 0 ? formatPoints(potentialReturn) : '—'}</strong></div>
          </div>
          <button
            type="button"
            onClick={onPlaceTicket}
            disabled={!picks.length || isPlacing}
            className="flex h-8 w-full items-center justify-center gap-1.5 rounded-md bg-primary px-2 text-[10px] font-extrabold text-primary-foreground shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isPlacing ? 'Placing ticket…' : 'Place bet'}
            {!isPlacing ? <FaArrowRight className="h-2.5 w-2.5" /> : null}
          </button>
          <p className="text-center text-[7px] leading-3 text-muted-foreground">Virtual play only. No cash stakes or real-money betting.</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden min-w-0 flex-col rounded-lg border border-border/80 bg-card shadow-sm xl:flex">
        {content}
      </aside>
      {mobileOpen && typeof document !== 'undefined' ? createPortal(
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/55 p-1.5 backdrop-blur-sm xl:hidden" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCloseMobile?.(); }}>
          <section className="max-h-[min(88dvh,720px)] w-full max-w-lg overflow-y-auto overscroll-y-contain touch-pan-y rounded-xl border border-border bg-card shadow-2xl [-webkit-overflow-scrolling:touch]">
            <div className="sticky top-0 z-10 flex shrink-0 justify-end border-b border-border/50 bg-card px-2 py-1">
              <button type="button" onClick={onCloseMobile} aria-label="Close selections" className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"><FaXmark className="h-3 w-3" /></button>
            </div>
            {content}
          </section>
        </div>,
        document.body,
      ) : null}
    </>
  );
}



