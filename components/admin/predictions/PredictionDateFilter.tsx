'use client';

import {
  CalendarDays,
} from 'lucide-react';

export type PredictionDateFilter =
  | 'all'
  | 'this-week'
  | 'next-week'
  | 'this-month'
  | 'custom';

interface Props {
  value: PredictionDateFilter;

  onChange: (
    value: PredictionDateFilter,
  ) => void;

  customFrom: string;

  customTo: string;

  onCustomFromChange: (
    value: string,
  ) => void;

  onCustomToChange: (
    value: string,
  ) => void;
}

const FILTER_OPTIONS: {
  value: PredictionDateFilter;
  label: string;
}[] = [
  {
    value: 'all',
    label: 'All',
  },
  {
    value: 'this-week',
    label: 'This Week',
  },
  {
    value: 'next-week',
    label: 'Next Week',
  },
  {
    value: 'this-month',
    label: 'This Month',
  },
  {
    value: 'custom',
    label: 'Custom',
  },
];

export default function PredictionDateFilter({
  value,
  onChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
}: Props) {
  return (
    <div className="rounded-2xl border border-border bg-muted/20 p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays className="h-4 w-4" />
          </div>

          <div>
            <p className="text-s font-semibold">
              Fixture Period
            </p>

            <p className="text-xs text-muted-foreground">
              Filter fixtures by date
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => {
            const active = value === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                aria-pressed={active}
                className={`
                  rounded-xl
                  border
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  transition
                  ${
                    active
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }
                `}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {value === 'custom' && (
        <div className="mt-3 grid gap-3 border-t border-border pt-3 sm:grid-cols-2">
          <DateInput
            label="From"
            value={customFrom}
            onChange={onCustomFromChange}
          />

          <DateInput
            label="To"
            value={customTo}
            onChange={onCustomToChange}
          />
        </div>
      )}
    </div>
  );
}

interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function DateInput({
  label,
  value,
  onChange,
}: DateInputProps) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-semibold text-muted-foreground">
        {label}
      </span>

      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="
          h-10
          w-full
          rounded-xl
          border
          border-border
          bg-background
          px-3
          text-s
          outline-none
          transition
          focus:border-primary
          focus:ring-2
          focus:ring-primary/10
        "
      />
    </label>
  );
}