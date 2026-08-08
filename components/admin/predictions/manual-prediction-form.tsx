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
      !leagueCode.trim() ||
      !matchDate
    ) {
      setError(
        'Please complete all fields before creating a prediction.',
      );

      return;
    }

    onCreateMatch({
      id: `manual-${Date.now()}`,
      leagueCode: leagueCode.trim().toUpperCase(),
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
        rounded-3xl
        border
        border-border
        bg-card
        shadow-sm
      "
    >
      <div
        className="
          border-b
          border-border
          bg-gradient-to-br
          from-primary/[0.10]
          via-card
          to-card
          p-5
          sm:p-6
        "
      >
        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-start
            sm:justify-between
          "
        >
          <div className="flex items-start gap-4">
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-primary/15
                text-primary
              "
            >
              <Trophy className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-lg font-bold sm:text-xl">
                Manual Prediction
              </h2>

              <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                Create a fixture manually when it is unavailable
                through the football API.
              </p>
            </div>
          </div>

          <span
            className="
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-full
              bg-primary/10
              px-3
              py-1.5
              text-xs
              font-semibold
              text-primary
            "
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin tool
          </span>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        {error && (
          <div
            role="alert"
            className="
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-destructive/25
              bg-destructive/10
              p-4
              text-sm
              text-destructive
            "
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <p>{error}</p>
          </div>
        )}

        <div>
          <div className="mb-3">
            <h3 className="font-semibold">
              Fixture Details
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Enter the teams, competition, and scheduled kick-off.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-muted-foreground
                "
              >
                Home Team
              </span>

              <input
                type="text"
                placeholder="e.g. Arsenal"
                value={homeTeam}
                onChange={(event) =>
                  setHomeTeam(event.target.value)
                }
                className="
                  mt-2
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-input
                  bg-background
                  px-4
                  text-sm
                  font-medium
                  outline-none
                  transition
                  placeholder:text-muted-foreground
                  focus-visible:ring-2
                  focus-visible:ring-primary/30
                "
              />
            </label>

            <label className="block">
              <span
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-muted-foreground
                "
              >
                Away Team
              </span>

              <input
                type="text"
                placeholder="e.g. Chelsea"
                value={awayTeam}
                onChange={(event) =>
                  setAwayTeam(event.target.value)
                }
                className="
                  mt-2
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-input
                  bg-background
                  px-4
                  text-sm
                  font-medium
                  outline-none
                  transition
                  placeholder:text-muted-foreground
                  focus-visible:ring-2
                  focus-visible:ring-primary/30
                "
              />
            </label>

            <label className="block">
              <span
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-muted-foreground
                "
              >
                League
              </span>

              <select
                value={leagueCode}
                onChange={(event) =>
                  setLeagueCode(event.target.value)
                }
                className="
                  mt-2
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-input
                  bg-background
                  px-4
                  text-sm
                  font-medium
                  outline-none
                  transition
                  focus-visible:ring-2
                  focus-visible:ring-primary/30
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
            </label>

            <label className="block">
              <span
                className="
                  flex
                  items-center
                  gap-2
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-muted-foreground
                "
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Kick-off Date & Time
              </span>

              <input
                type="datetime-local"
                value={matchDate}
                onChange={(event) =>
                  setMatchDate(event.target.value)
                }
                className="
                  mt-2
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-input
                  bg-background
                  px-4
                  text-sm
                  font-medium
                  outline-none
                  transition
                  focus-visible:ring-2
                  focus-visible:ring-primary/30
                "
              />
            </label>
          </div>
        </div>

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-primary/15
            bg-primary/[0.05]
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-primary/10
              px-4
              py-3
            "
          >
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.16em]
                text-primary
              "
            >
              Fixture Preview
            </p>

            <span className="text-xs text-muted-foreground">
              {leagueCode.trim()
                ? leagueCode.trim().toUpperCase()
                : 'League pending'}
            </span>
          </div>

          <div
            className="
              grid
              grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]
              items-center
              gap-3
              p-4
              sm:p-5
            "
          >
            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-bold sm:text-base">
                {homeTeam.trim() || 'Home Team'}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Home
              </p>
            </div>

            <span
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-primary/25
                bg-background
                text-xs
                font-black
                text-primary
              "
            >
              VS
            </span>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold sm:text-base">
                {awayTeam.trim() || 'Away Team'}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Away
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="
          flex
          flex-col
          gap-3
          border-t
          border-border
          bg-muted/20
          px-5
          py-4
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:px-6
        "
      >
        <p className="text-xs text-muted-foreground">
          The fixture will be created with a scheduled status.
        </p>

        <button
          type="submit"
          className="
            inline-flex
            h-11
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-primary
            px-5
            text-sm
            font-semibold
            text-primary-foreground
            shadow-sm
            transition
            hover:brightness-110
            active:scale-[0.98]
          "
        >
          <Plus className="h-4 w-4" />
          Create Manual Prediction
        </button>
      </div>
    </form>
  );
}