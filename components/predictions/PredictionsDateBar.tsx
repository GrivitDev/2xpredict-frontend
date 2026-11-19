'use client';

import { useRef } from 'react';
import type { IconType } from 'react-icons';
import {
  FaChevronLeft,
  FaChevronRight,
  FaFutbol,
  FaStar,
  FaTicketSimple,
  FaCircleCheck,
} from 'react-icons/fa6';
import {
  dateStepLabel,
  fullDateLabel,
  shiftDate,
} from '@/components/bet-lab/bet-lab.utils';

export type PredictionMode = 'general' | 'special' | 'settled' | 'slips';

type Props = {
  selectedDate: string;
  onDateChange: (date: string) => void;
  mode: PredictionMode;
  onModeChange: (mode: PredictionMode) => void;
};

const modes: Array<{
  id: PredictionMode;
  label: string;
  icon: IconType;
}> = [
  { id: 'general', label: 'Picks', icon: FaFutbol },
  { id: 'special', label: 'Specials', icon: FaStar },
  { id: 'settled', label: 'Settled', icon: FaCircleCheck },
  { id: 'slips', label: 'Slips', icon: FaTicketSimple },
];

/**
 * Keeps Bet Lab's date control and replaces its page links with the four
 * prediction views. Date selection deliberately remains independent of view.
 */
export default function PredictionsDateBar({
  selectedDate,
  onDateChange,
  mode,
  onModeChange,
}: Props) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="sticky top-0 z-[60] -mx-1 border-b border-border/70 bg-background/90 px-2 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.035)] backdrop-blur-2xl sm:-mx-1 sm:px-2 lg:-mx-1 lg:px-2">
      <div className="mx-auto grid max-w-[1800px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 xl:grid-cols-[1fr_auto_1fr]">
        <div className="flex min-w-0 items-center justify-start xl:col-start-2">
          <div className="flex h-9 min-w-0 items-center rounded-lg border border-primary/30 bg-card/95 px-1 shadow-[0_0_18px_rgba(128,35,65,0.08)] sm:h-10 sm:min-w-[250px] sm:px-1.5">
            <button
              type="button"
              onClick={() => onDateChange(shiftDate(selectedDate, -1))}
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
                onChange={(event) => onDateChange(event.target.value)}
                aria-label="Choose prediction date"
                className="pointer-events-none absolute h-px w-px opacity-0"
                tabIndex={-1}
              />
              <span className="hidden text-[9px] text-muted-foreground sm:block">
                {fullDateLabel(selectedDate)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onDateChange(shiftDate(selectedDate, 1))}
              aria-label="Next day"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <FaChevronRight className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>

        <nav
          aria-label="Prediction views"
          className="flex min-w-0 items-center justify-end gap-1 overflow-x-auto scrollbar-none xl:col-start-3 xl:row-start-1 xl:justify-self-end xl:gap-1"
        >
          {modes.map(({ id, label, icon: Icon }) => {
            const active = mode === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => onModeChange(id)}
                className={`${id === 'slips' ? 'hidden xl:inline-flex' : 'inline-flex'} h-7 shrink-0 items-center justify-center gap-1 rounded-md border px-1.5 sm:h-8 sm:px-2 ${
                  active
                    ? 'border-primary bg-primary text-primary-foreground shadow-[0_5px_15px_rgba(128,35,65,0.18)]'
                    : 'border-border/70 bg-card/80 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground'
                }`}
              >
                <Icon className="h-2.5 w-2.5" />
                <span className="text-[10px] font-bold sm:text-[11px]">{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

