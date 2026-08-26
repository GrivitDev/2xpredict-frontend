'use client';

export type ReferralFilter =
  | 'all'
  | 'registered'
  | 'regular'
  | 'vip'
  | 'prediction'
  | 'reward';

interface ReferralFiltersProps {
  activeFilter: ReferralFilter;
  onChange: (filter: ReferralFilter) => void;
}

const FILTERS: readonly {
  label: string;
  value: ReferralFilter;
}[] = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'Registered',
    value: 'registered',
  },
  {
    label: 'Regular',
    value: 'regular',
  },
  {
    label: 'VIP',
    value: 'vip',
  },
  {
    label: 'Prediction',
    value: 'prediction',
  },
  {
    label: 'Reward',
    value: 'reward',
  },
];

export default function ReferralFilters({
  activeFilter,
  onChange,
}: ReferralFiltersProps) {
  return (
    <div
      role="group"
      aria-label="Referral filters"
      className="
        flex
        w-full
        items-center
        gap-1
        overflow-x-auto
        rounded-lg
        border
        border-border/60
        bg-muted/40
        p-1
        scrollbar-none
      "
    >
      {FILTERS.map(({ label, value }) => {
        const active = activeFilter === value;

        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(value)}
            className={`
              shrink-0
              rounded-md
              px-3
              py-1.5
              text-xs
              font-medium
              tracking-tight
              transition-colors
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
              focus-visible:ring-offset-1
              ${
                active
                  ? 'bg-background text-foreground shadow-sm ring-1 ring-border/70'
                  : 'text-muted-foreground hover:bg-background/70 hover:text-foreground'
              }
            `}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}