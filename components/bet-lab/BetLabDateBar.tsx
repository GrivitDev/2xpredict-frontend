'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { FaChevronLeft, FaChevronRight, FaClockRotateLeft, FaReceipt } from 'react-icons/fa6';
import { dateStepLabel, fullDateLabel, localDateKey, shiftDate } from './bet-lab.utils';

type Props = {
  selectedDate: string;
  onChange: (date: string) => void;
};

export default function BetLabDateBar({ selectedDate, onChange }: Props) {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const today = localDateKey(new Date());

  return (
    <header className="sticky top-0 z-[60] -mx-2 mb-1.5 border-b border-border/70 bg-background/90 px-2 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.035)] backdrop-blur-2xl sm:-mx-3 sm:px-3 2xl:-mx-4 2xl:px-4">
      <div className="mx-auto grid max-w-[1800px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 xl:grid-cols-[1fr_auto_1fr]">
        <div className="flex min-w-0 items-center justify-start xl:col-start-2">
          <div className="flex h-9 min-w-0 items-center rounded-lg border border-primary/30 bg-card/95 px-1 shadow-[0_0_18px_rgba(128,35,65,0.08)] sm:h-10 sm:min-w-[250px] sm:px-1.5">
            <button
              type="button"
              onClick={() => onChange(shiftDate(selectedDate, -1))}
              aria-label="Previous day"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <FaChevronLeft className="h-2.5 w-2.5" />
            </button>
            <div className="relative min-w-0 flex-1 px-1 text-center">
              <button
                type="button"
                onClick={() => dateInputRef.current?.click()}
                title={fullDateLabel(selectedDate)}
                className="block w-full truncate text-[13px] font-bold tracking-tight text-foreground sm:text-xs"
              >
                {dateStepLabel(selectedDate)}
              </button>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={(event) => onChange(event.target.value)}
                aria-label="Choose match date"
                className="pointer-events-none absolute h-px w-px opacity-0"
                tabIndex={-1}
              />
              <span className="hidden text-[9px] text-muted-foreground sm:block">{fullDateLabel(selectedDate)}</span>
            </div>
            <button
              type="button"
              onClick={() => onChange(shiftDate(selectedDate, 1))}
              aria-label="Next day"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <FaChevronRight className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>

        <nav aria-label="Bet Lab pages" className="flex items-center justify-end gap-1 xl:col-start-3 xl:row-start-1 xl:justify-self-end xl:gap-2">
          <Link
            href="/bet-lab/tickets"
            aria-label="My tickets"
            title="My tickets"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/70 bg-card/80 text-foreground transition hover:border-primary/40 hover:bg-primary/8 xl:h-9 xl:w-auto xl:gap-1.5 xl:px-2.5"
          >
            <FaReceipt className="h-3 w-3 text-primary" />
            <span className="hidden text-[10px] font-semibold xl:inline">My Tickets</span>
          </Link>
          <Link
            href="/bet-lab/history"
            aria-label="History"
            title="History"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/70 bg-card/80 text-foreground transition hover:border-primary/40 hover:bg-primary/8 xl:h-9 xl:w-auto xl:gap-1.5 xl:px-2.5"
          >
            <FaClockRotateLeft className="h-3 w-3 text-primary" />
            <span className="hidden text-[10px] font-semibold xl:inline">History</span>
          </Link>
        </nav>
      </div>
      {selectedDate !== today ? (
        <button type="button" onClick={() => onChange(today)} className="mx-auto mt-0 block text-[8px] font-bold text-primary xl:hidden">
          Return to today
        </button>
      ) : null}
    </header>
  );
}



