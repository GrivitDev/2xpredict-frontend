'use client';

import {
  Search,
  SlidersHorizontal,
  Trophy,
  CircleDot,
  Crown,
} from 'lucide-react';

import {
  Input,
} from '@/components/ui/input';

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
      <div
        className="
          mb-4
          flex
          items-start
          gap-3
        "
      >
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

        <div>
          <h2 className="font-bold">
            Filter Predictions
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
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
            className="
              pointer-events-none
              absolute
              left-3.5
              top-1/2
              h-4
              w-4
              -translate-y-1/2
              text-muted-foreground
            "
          />

          <Input
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
              text-sm
              shadow-none
              focus-visible:ring-primary/30
            "
          />
        </div>

        <Select
          value={status}
          onValueChange={setStatus}
        >
          <SelectTrigger
            className="
              h-11
              rounded-xl
              border-input
              bg-background
              text-sm
              shadow-none
              focus:ring-primary/30
            "
          >
            <div className="flex min-w-0 items-center gap-2">
              <CircleDot className="h-4 w-4 shrink-0 text-primary" />

              <SelectValue placeholder="Status" />
            </div>
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All Status
            </SelectItem>

            <SelectItem value="Upcoming">
              Upcoming
            </SelectItem>

            <SelectItem value="In Play">
              In Play
            </SelectItem>

            <SelectItem value="Needs Settlement">
              Needs Settlement
            </SelectItem>

            <SelectItem value="Settled">
              Settled
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={access}
          onValueChange={setAccess}
        >
          <SelectTrigger
            className="
              h-11
              rounded-xl
              border-input
              bg-background
              text-sm
              shadow-none
              focus:ring-primary/30
            "
          >
            <div className="flex min-w-0 items-center gap-2">
              <Crown className="h-4 w-4 shrink-0 text-primary" />

              <SelectValue placeholder="Access" />
            </div>
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All Access
            </SelectItem>

            <SelectItem value="free">
              Free
            </SelectItem>

            <SelectItem value="regular">
              Regular
            </SelectItem>

            <SelectItem value="vip">
              VIP
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={league}
          onValueChange={setLeague}
        >
          <SelectTrigger
            className="
              h-11
              rounded-xl
              border-input
              bg-background
              text-sm
              shadow-none
              focus:ring-primary/30
            "
          >
            <div className="flex min-w-0 items-center gap-2">
              <Trophy className="h-4 w-4 shrink-0 text-primary" />

              <SelectValue placeholder="League" />
            </div>
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All Leagues
            </SelectItem>

            {leagues.map((item) => (
              <SelectItem
                key={item.code}
                value={item.code}
              >
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}