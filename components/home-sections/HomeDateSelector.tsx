'use client';

import { FaCalendarDays } from 'react-icons/fa6';

type HomeDateSelectorProps = {
  dates: string[];
  selected: string;
  today: string;
  onSelect: (date: string) => void;
  getLabel: (date: string, today: string) => string;
  showCalendarIcon?: boolean;
  className?: string;
};

export default function HomeDateSelector({
  dates,
  selected,
  today,
  onSelect,
  getLabel,
  showCalendarIcon = false,
  className = '',
}: HomeDateSelectorProps) {
  return (
    <div className={`mx-auto w-full min-w-0 ${className}`}>
      <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain scrollbar-none">
        <div
          className="mx-auto flex w-max min-w-full items-center justify-center gap-1 px-0.5 pb-1"
          role="group"
          aria-label="Select date"
        >
          {showCalendarIcon ? (
            <FaCalendarDays className="shrink-0 text-[11px] text-primary" aria-hidden="true" />
          ) : null}

          {dates.map((date) => (
            <button
              key={date}
              type="button"
              onClick={() => onSelect(date)}
              aria-pressed={selected === date}
              className={`shrink-0 whitespace-nowrap rounded-full border px-2 py-1 text-[9px] font-semibold capitalize leading-none transition-colors ${
                selected === date
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/10'
                  : 'border-border/70 bg-card text-muted-foreground hover:border-primary/30 hover:bg-muted hover:text-foreground'
              }`}
            >
              {getLabel(date, today)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
