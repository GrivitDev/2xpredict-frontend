'use client';

import {
  useState,
  type FormEvent,
} from 'react';

import {
  AlertCircle,
  CalendarDays,
  Plus,
  ShieldCheck,
  Trophy,
} from 'lucide-react';

import {
  LEAGUE_CATALOG,
} from '@/constants/leagues';

interface ManualPredictionFormProps {
  onCreateMatch: (match: any) => void;
}

export default function ManualPredictionForm({
  onCreateMatch,
}: ManualPredictionFormProps) {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [leagueCode, setLeagueCode] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [error, setError] = useState('');

  const handleCreate = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError('');

    if (
      !homeTeam.trim() ||
      !awayTeam.trim() ||
      !leagueCode ||
      !matchDate
    ) {
      setError('Complete all fixture fields before continuing.');
      return;
    }

    onCreateMatch({
      id: `manual-${Date.now()}`,
      leagueCode: leagueCode.toUpperCase(),
      homeTeam: homeTeam.trim(),
      awayTeam: awayTeam.trim(),
      date: matchDate,
      status: 'SCHEDULED',
    });

    setHomeTeam('');
    setAwayTeam('');
    setLeagueCode('');
    setMatchDate('');
  };

  return (
    <form
      onSubmit={handleCreate}
      className="
        overflow-hidden
        rounded-2xl
        border
        border-border/70
        bg-card
        shadow-sm
      "
    >
      {/* Header */}
      <div
        className="
          flex
          items-center
          justify-between
          gap-4
          border-b
          border-border/60
          px-4
          py-3
          sm:px-5
        "
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="
              flex
              size-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-primary/10
              text-primary
            "
          >
            <Trophy className="size-4" />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold">
              Manual Prediction
            </h2>

            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              Add a fixture unavailable through the football API.
            </p>
          </div>
        </div>

        <span
          className="
            hidden
            shrink-0
            items-center
            gap-1.5
            rounded-full
            bg-primary/10
            px-2.5
            py-1
            text-[10px]
            font-semibold
            text-primary
            sm:inline-flex
          "
        >
          <ShieldCheck className="size-3" />
          Admin
        </span>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        {/* Error */}
        {error && (
          <div
            role="alert"
            className="
              flex
              items-center
              gap-2
              rounded-lg
              border
              border-destructive/20
              bg-destructive/5
              px-3
              py-2.5
              text-xs
              text-destructive
            "
          >
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Fields */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Home Team"
            value={homeTeam}
            placeholder="e.g. Arsenal"
            onChange={setHomeTeam}
          />

          <Field
            label="Away Team"
            value={awayTeam}
            placeholder="e.g. Chelsea"
            onChange={setAwayTeam}
          />

          <div className="space-y-1.5">
            <label
              htmlFor="league"
              className="text-xs font-medium text-muted-foreground"
            >
              League
            </label>

            <select
              id="league"
              value={leagueCode}
              onChange={(event) =>
                setLeagueCode(event.target.value)
              }
              className="
                h-10
                w-full
                rounded-lg
                border
                border-input
                bg-background
                px-3
                text-sm
                outline-none
                transition
                focus:ring-2
                focus:ring-primary/20
              "
            >
              <option value="">
                Select a league
              </option>

              {LEAGUE_CATALOG.map((league) => (
                <option
                  key={league.code}
                  value={league.code}
                >
                  {league.name} — {league.country}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="match-date"
              className="
                flex
                items-center
                gap-1.5
                text-xs
                font-medium
                text-muted-foreground
              "
            >
              <CalendarDays className="size-3.5" />
              Kick-off
            </label>

            <input
              id="match-date"
              type="datetime-local"
              value={matchDate}
              onChange={(event) =>
                setMatchDate(event.target.value)
              }
              className="
                h-10
                w-full
                rounded-lg
                border
                border-input
                bg-background
                px-3
                text-sm
                outline-none
                transition
                focus:ring-2
                focus:ring-primary/20
              "
            />
          </div>
        </div>

        {/* Preview */}
        <div
          className="
            rounded-xl
            border
            border-border/70
            bg-muted/20
            px-3
            py-3
          "
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Preview
            </span>

            <span className="text-[10px] font-medium text-primary">
              {leagueCode
                ? leagueCode.toUpperCase()
                : 'League pending'}
            </span>
          </div>

          <div
            className="
              grid
              grid-cols-[1fr_auto_1fr]
              items-center
              gap-2
            "
          >
            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-semibold">
                {homeTeam.trim() || 'Home Team'}
              </p>

              <p className="text-[10px] text-muted-foreground">
                Home
              </p>
            </div>

            <span
              className="
                flex
                size-8
                items-center
                justify-center
                rounded-full
                border
                border-primary/20
                bg-background
                text-[10px]
                font-bold
                text-primary
              "
            >
              VS
            </span>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {awayTeam.trim() || 'Away Team'}
              </p>

              <p className="text-[10px] text-muted-foreground">
                Away
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="
          flex
          flex-col-reverse
          gap-2
          border-t
          border-border/60
          bg-muted/10
          px-4
          py-3
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:px-5
        "
      >
        <p className="text-[11px] text-muted-foreground">
          Creates a scheduled fixture.
        </p>

        <button
          type="submit"
          className="
            inline-flex
            h-9
            items-center
            justify-center
            gap-1.5
            rounded-lg
            bg-primary
            px-4
            text-xs
            font-semibold
            text-primary-foreground
            shadow-sm
            transition
            hover:opacity-90
            active:scale-[0.98]
          "
        >
          <Plus className="size-3.5" />
          Create Prediction
        </button>
      </div>
    </form>
  );
}

interface FieldProps {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

function Field({
  label,
  value,
  placeholder,
  onChange,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="
          h-10
          w-full
          rounded-lg
          border
          border-input
          bg-background
          px-3
          text-sm
          font-medium
          outline-none
          transition
          placeholder:text-muted-foreground
          focus:ring-2
          focus:ring-primary/20
        "
      />
    </div>
  );
}