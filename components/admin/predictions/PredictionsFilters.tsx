'use client';

import {
  Search,
  SlidersHorizontal,
  Trophy,
  CircleDot,
  Crown,
} from 'lucide-react';

import { Input } from '@/components/ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  search: string;
  setSearch: (value: string) => void;

  status: string;
  setStatus: (value: string) => void;

  access: string;
  setAccess: (value: string) => void;

  league: string;
  setLeague: (value: string) => void;

  leagues: {
    code: string;
    name: string;
  }[];
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'Upcoming', label: 'Upcoming' },
  { value: 'In Play', label: 'In Play' },
  { value: 'Needs Settlement', label: 'Needs Settlement' },
  { value: 'Settled', label: 'Settled' },
];

const accessOptions = [
  { value: 'all', label: 'All Access' },
  { value: 'free', label: 'Free' },
  { value: 'regular', label: 'Regular' },
  { value: 'vip', label: 'VIP' },
];

export default function PredictionsFilters({
  search,
  setSearch,
  status,
  setStatus,
  access,
  setAccess,
  league,
  setLeague,
  leagues,
}: Props) {
  return (
    <section
      className="
        rounded-3xl
        border
        border-border
        bg-card
        p-4
        shadow-sm
        sm:p-5
      "
    >
      <div className="mb-4 flex items-start gap-3">
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-primary/10
            text-primary
          "
        >
          <SlidersHorizontal className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <h2 className="font-bold">
            Filter Predictions
          </h2>

          <p className="mt-1 text-s text-muted-foreground">
            Find fixtures by team, status, access level, or league.
          </p>
        </div>
      </div>

      <div
        className="
          grid
          gap-3
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <div className="relative">
          <Search
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              left-3.5
              top-1/2
              z-10
              h-4
              w-4
              -translate-y-1/2
              text-muted-foreground
            "
          />

          <Input
            type="search"
            placeholder="Search teams..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="
              h-11
              rounded-xl
              border-input
              bg-background
              pl-10
              text-s
              shadow-none
              focus-visible:ring-primary/30
            "
          />
        </div>

        <FilterSelect
          value={status}
          onChange={setStatus}
          placeholder="Status"
          icon={<CircleDot className="h-4 w-4 shrink-0 text-primary" />}
          options={statusOptions}
        />

        <FilterSelect
          value={access}
          onChange={setAccess}
          placeholder="Access"
          icon={<Crown className="h-4 w-4 shrink-0 text-primary" />}
          options={accessOptions}
        />

        <FilterSelect
          value={league}
          onChange={setLeague}
          placeholder="League"
          icon={<Trophy className="h-4 w-4 shrink-0 text-primary" />}
          options={[
            { value: 'all', label: 'All Leagues' },
            ...leagues.map((item) => ({
              value: item.code,
              label: item.name,
            })),
          ]}
        />
      </div>
    </section>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  icon,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <Select
      value={value}
      onValueChange={onChange}
    >
      <SelectTrigger
        className="
          h-11
          w-full
          rounded-xl
          border-input
          bg-background
          text-s
          shadow-none
          focus:ring-primary/30
        "
      >
        <div className="flex min-w-0 items-center gap-2">
          {icon}

          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>

      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}