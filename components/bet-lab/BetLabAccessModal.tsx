'use client';

import { createPortal } from 'react-dom';
import Link from 'next/link';
import { FaLock, FaRightToBracket, FaUserPlus, FaXmark } from 'react-icons/fa6';
import useBetLabScrollLock from './use-bet-lab-scroll-lock';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function BetLabAccessModal({ open, onClose }: Props) {
  useBetLabScrollLock(open);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto overscroll-y-contain bg-slate-950/70 p-3 backdrop-blur-sm sm:items-center"
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="betlab-access-title"
        className="relative my-auto w-full max-w-[350px] overflow-hidden rounded-xl border border-primary/25 bg-card p-4 shadow-2xl"
      >
        <div className="pointer-events-none absolute -right-12 -top-16 h-36 w-36 rounded-full bg-primary/15 blur-3xl" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close access dialog"
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <FaXmark className="h-3 w-3" />
        </button>

        <div className="relative mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
          <FaLock className="h-4 w-4" />
        </div>
        <div className="relative mt-3 text-center">
          <p className="text-[8px] font-extrabold uppercase tracking-[0.22em] text-primary">Bet Lab access</p>
          <h2 id="betlab-access-title" className="mt-1.5 text-base font-extrabold tracking-tight text-foreground">Unlock the full experience</h2>
          <p className="mx-auto mt-1.5 max-w-[280px] text-[10px] leading-4 text-muted-foreground">
            Register or log in to use Bet Lab, unlock every market and build your virtual tickets.
          </p>
        </div>

        <div className="relative mt-4 grid grid-cols-2 gap-1.5">
          <Link href="/register" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-2 text-[10px] font-extrabold text-primary-foreground shadow-sm transition hover:brightness-110">
            <FaUserPlus className="h-3 w-3" /> Register
          </Link>
          <Link href="/login" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-background/80 px-2 text-[10px] font-extrabold text-foreground transition hover:border-primary/40 hover:bg-primary/5">
            <FaRightToBracket className="h-3 w-3 text-primary" /> Log in
          </Link>
        </div>
        <button type="button" onClick={onClose} className="relative mt-2 w-full py-1 text-[9px] font-semibold text-muted-foreground transition hover:text-foreground">
          Continue exploring fixtures
        </button>
      </section>
    </div>,
    document.body,
  );
}

