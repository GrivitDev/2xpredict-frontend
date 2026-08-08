'use client';

import {
  useEffect,
  useState,
} from 'react';

import Image from 'next/image';

import toast from 'react-hot-toast';

import {
  AlertCircle,
  CalendarDays,
  CirclePlus,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Trophy,
  WandSparkles,
} from 'lucide-react';

import {
  createPrediction,
} from '@/services/prediction.service';

import {
  getFixtures,
  getLeagues,
  type League,
  type Match,
} from '@/services/sports.service';

import PredictionModal from '@/components/admin/predictions/prediction-modal';
import ManualPredictionForm from '@/components/admin/predictions/manual-prediction-form';

function formatFixtureDate(date: string) {
  const fixtureDate = new Date(date);

  return {
    date: fixtureDate.toLocaleDateString('en-NG', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),

    time: fixtureDate.toLocaleTimeString('en-NG', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
  };
}

export default function CreatePredictionPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  const [selectedLeague, setSelectedLeague] = useState('');
  const [selectedMatch, setSelectedMatch] =
    useState<Match | null>(null);

  const [loadingLeagues, setLoadingLeagues] =
    useState(false);

  const [loadingMatches, setLoadingMatches] =
    useState(false);

  const [showModal, setShowModal] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState('');

  const currentLeague = leagues.find(
    (league) => league.code === selectedLeague,
  );

  useEffect(() => {
    const loadLeagues = async () => {
      try {
        setLoadingLeagues(true);
        setError('');

        const data = await getLeagues();

        setLeagues(data || []);
      } catch (err) {
        console.error(err);

        setError(
          'Unable to load leagues. Please try again.',
        );
      } finally {
        setLoadingLeagues(false);
      }
    };

    loadLeagues();
  }, []);

  const handleLeagueChange = async (
    leagueCode: string,
  ) => {
    setSelectedLeague(leagueCode);
    setMatches([]);
    setError('');

    if (!leagueCode) {
      return;
    }

    try {
      setLoadingMatches(true);

      const data = await getFixtures(leagueCode);

      setMatches(data || []);
    } catch (err) {
      console.error(err);

      setError(
        'Unable to load fixtures for this league.',
      );
    } finally {
      setLoadingMatches(false);
    }
  };

  const openModal = (match: Match) => {
    setSelectedMatch(match);
    setShowModal(true);
  };

  const handleManualMatch = (match: Match) => {
    setSelectedMatch(match);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedMatch(null);
    setShowModal(false);
  };

  const handleSubmit = async (payload: any) => {
    if (!selectedMatch) {
      return;
    }

    /*
      API fixtures include `league`.
      Manual fixtures only include `leagueCode`,
      so this fallback prevents a runtime error.
    */
    const matchLeague = selectedMatch.league || {
      code:
        selectedMatch.leagueCode ||
        currentLeague?.code ||
        'MANUAL',

      name:
        currentLeague?.name ||
        selectedMatch.leagueCode ||
        'Manual Fixture',

      country:
        currentLeague?.country ||
        'Manual',

      emblem: currentLeague?.emblem,
    };

    try {
      setSubmitting(true);

      await createPrediction({
        matchId: selectedMatch.id,

        leagueCode:
          selectedMatch.leagueCode ||
          matchLeague.code,

        league: {
          code: matchLeague.code,
          name: matchLeague.name,
          country: matchLeague.country,
          emblem: matchLeague.emblem,
        },

        homeTeam: selectedMatch.homeTeam,
        awayTeam: selectedMatch.awayTeam,

        homeTeamBadge:
          selectedMatch.homeTeamBadge,

        awayTeamBadge:
          selectedMatch.awayTeamBadge,

        confidence: Number(payload.confidence),

        probabilities: payload.probabilities,

        markets: payload.markets,

        accessType: payload.accessType,

        price: Number(payload.price || 0),

        matchDate: selectedMatch.date,
      });

      toast.success(
        'Prediction created successfully.',
      );

      closeModal();
    } catch (err: any) {
      console.error(err?.response?.data || err);

      toast.error(
        err?.response?.data?.message ||
          'Failed to create prediction.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="
        mx-auto
        w-full
        max-w-7xl
        min-w-0
        space-y-8
        pb-8
        animate-in
        fade-in
        slide-in-from-bottom-4
        duration-500
      "
    >
      {/* Page Hero */}

      <section
        className="
          overflow-hidden
          rounded-3xl
          border
          border-border
          bg-gradient-to-br
          from-primary/[0.11]
          via-card
          to-card
          p-5
          shadow-sm
          sm:p-7
        "
      >
        <div
          className="
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div className="flex items-start gap-4">
            <div
              className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-primary/15
                text-primary
                shadow-sm
              "
            >
              <WandSparkles className="h-7 w-7" />
            </div>

            <div>
              <span
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-primary
                "
              >
                <Sparkles className="h-3.5 w-3.5" />
                Prediction Studio
              </span>

              <h1
                className="
                  mt-2
                  text-2xl
                  font-black
                  tracking-tight
                  sm:text-3xl
                "
              >
                Create Prediction
              </h1>

              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-6
                  text-muted-foreground
                  sm:text-base
                "
              >
                Build expert football predictions from live
                fixtures, or create a manual fixture when it
                is not available through the football API.
              </p>
            </div>
          </div>

          <div
            className="
              grid
              grid-cols-2
              gap-3
              sm:w-fit
            "
          >
            <Metric
              label="Available Leagues"
              value={
                loadingLeagues
                  ? '...'
                  : String(leagues.length)
              }
            />

            <Metric
              label="Loaded Fixtures"
              value={
                selectedLeague
                  ? String(matches.length)
                  : '—'
              }
            />
          </div>
        </div>
      </section>

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

      {/* API Fixtures */}

      <section
        className="
          rounded-3xl
          border
          border-border
          bg-card
          p-4
          shadow-sm
          sm:p-6
        "
      >
        <SectionHeader
          icon={<Trophy className="h-5 w-5" />}
          title="Create from API Fixture"
          description="Select a competition and choose one of its upcoming fixtures."
          badge="Football API"
        />

        <div className="mt-6">
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
              Select League
            </span>

            <div className="relative mt-2">
              <select
                value={selectedLeague}
                disabled={loadingLeagues}
                onChange={(event) =>
                  handleLeagueChange(event.target.value)
                }
                className="
                  h-12
                  w-full
                  appearance-none
                  rounded-xl
                  border
                  border-input
                  bg-background
                  px-4
                  pr-12
                  text-sm
                  font-medium
                  outline-none
                  transition
                  focus-visible:ring-2
                  focus-visible:ring-primary/30
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                <option value="">
                  {loadingLeagues
                    ? 'Loading leagues...'
                    : 'Choose a league'}
                </option>

                {leagues.map((league) => (
                  <option
                    key={league.code}
                    value={league.code}
                  >
                    {league.name} ({league.country})
                  </option>
                ))}
              </select>

              {loadingLeagues ? (
                <LoaderCircle
                  className="
                    pointer-events-none
                    absolute
                    right-4
                    top-1/2
                    h-5
                    w-5
                    -translate-y-1/2
                    animate-spin
                    text-primary
                  "
                />
              ) : (
                <Trophy
                  className="
                    pointer-events-none
                    absolute
                    right-4
                    top-1/2
                    h-5
                    w-5
                    -translate-y-1/2
                    text-muted-foreground
                  "
                />
              )}
            </div>
          </label>
        </div>

        {currentLeague && (
          <div
            className="
              mt-5
              flex
              flex-col
              gap-4
              rounded-2xl
              border
              border-primary/15
              bg-primary/[0.06]
              p-4
              sm:flex-row
              sm:items-center
            "
          >
            <div
              className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-2xl
                border
                border-border
                bg-background
                shadow-sm
              "
            >
              {currentLeague.emblem ? (
                <Image
                  src={currentLeague.emblem}
                  alt={currentLeague.name}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              ) : (
                <Trophy className="h-6 w-6 text-primary" />
              )}
            </div>

            <div>
              <p className="font-bold">
                {currentLeague.name}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {currentLeague.country}
              </p>
            </div>

            <span
              className="
                ml-auto
                w-fit
                rounded-full
                bg-background
                px-3
                py-1.5
                text-xs
                font-semibold
                text-muted-foreground
              "
            >
              {matches.length} fixture
              {matches.length === 1 ? '' : 's'}
            </span>
          </div>
        )}

        <div className="mt-6">
          {loadingMatches && (
            <LoadingFixtures />
          )}

          {!loadingMatches &&
            selectedLeague &&
            matches.length === 0 && (
              <div
                className="
                  rounded-2xl
                  border
                  border-dashed
                  border-border
                  bg-muted/20
                  p-10
                  text-center
                "
              >
                <CalendarDays className="mx-auto h-7 w-7 text-muted-foreground" />

                <p className="mt-3 font-semibold">
                  No upcoming fixtures found
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Try another league or create the fixture
                  manually.
                </p>
              </div>
            )}

          {!loadingMatches &&
            matches.length > 0 && (
              <div className="grid gap-4">
                {matches.map((match) => (
                  <FixtureCard
                    key={match.id}
                    match={match}
                    onCreate={() => openModal(match)}
                  />
                ))}
              </div>
            )}

          {!selectedLeague &&
            !loadingLeagues && (
              <div
                className="
                  rounded-2xl
                  border
                  border-dashed
                  border-border
                  bg-muted/20
                  p-10
                  text-center
                "
              >
                <Trophy className="mx-auto h-7 w-7 text-muted-foreground" />

                <p className="mt-3 font-semibold">
                  Choose a league to begin
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Upcoming fixtures will appear here.
                </p>
              </div>
            )}
        </div>
      </section>

      {/* Manual Fixture */}

      <section className="space-y-4">
        <div className="flex items-start gap-3 px-1">
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
            <CirclePlus className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-bold">
              Manual Fixture Alternative
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Use this when a fixture is unavailable through
              the football API.
            </p>
          </div>
        </div>

        <ManualPredictionForm
          onCreateMatch={handleManualMatch}
        />
      </section>

      {showModal &&
        selectedMatch && (
          <PredictionModal
            match={selectedMatch}
            onClose={closeModal}
            onSubmit={handleSubmit}
            loading={submitting}
          />
        )}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge: string;
}) {
  return (
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
      <div className="flex items-start gap-3">
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-primary/10
            text-primary
          "
        >
          {icon}
        </div>

        <div>
          <h2 className="text-lg font-bold">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <span
        className="
          w-fit
          rounded-full
          bg-muted
          px-3
          py-1.5
          text-xs
          font-semibold
          text-muted-foreground
        "
      >
        {badge}
      </span>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-border
        bg-background/70
        px-4
        py-3
        backdrop-blur
      "
    >
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-lg font-black text-primary">
        {value}
      </p>
    </div>
  );
}

function LoadingFixtures() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="
            h-32
            animate-pulse
            rounded-2xl
            border
            border-border
            bg-muted/30
          "
        />
      ))}
    </div>
  );
}

function FixtureCard({
  match,
  onCreate,
}: {
  match: Match;
  onCreate: () => void;
}) {
  const formattedDate = formatFixtureDate(match.date);

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-2xl
        border
        border-border
        bg-background
        transition
        hover:border-primary/25
        hover:shadow-md
      "
    >
      <div
        className="
          flex
          flex-col
          gap-5
          p-4
          sm:p-5
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        <div className="min-w-0 flex-1">
          <div
            className="
              grid
              grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]
              items-center
              gap-3
              sm:gap-5
            "
          >
            <Team
              name={match.homeTeam}
              badge={match.homeTeamBadge}
              align="right"
            />

            <span
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-border
                bg-muted/40
                text-xs
                font-black
                text-muted-foreground
              "
            >
              VS
            </span>

            <Team
              name={match.awayTeam}
              badge={match.awayTeamBadge}
              align="left"
            />
          </div>

          <div
            className="
              mt-5
              flex
              flex-wrap
              items-center
              gap-x-4
              gap-y-2
              border-t
              border-border
              pt-4
              text-xs
              text-muted-foreground
            "
          >
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />

              {formattedDate.date}
            </span>

            <span>{formattedDate.time}</span>

            <span
              className="
                rounded-full
                bg-muted
                px-2.5
                py-1
                font-semibold
                uppercase
                tracking-wide
              "
            >
              {match.status}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="
            inline-flex
            h-11
            shrink-0
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
          <WandSparkles className="h-4 w-4" />
          Create Prediction
        </button>
      </div>
    </article>
  );
}

function Team({
  name,
  badge,
  align,
}: {
  name: string;
  badge?: string;
  align: 'left' | 'right';
}) {
  const isRight = align === 'right';

  return (
    <div
      className={`
        flex
        min-w-0
        items-center
        gap-2
        ${isRight ? 'justify-end text-right' : 'text-left'}
      `}
    >
      {isRight && (
        <span className="truncate text-sm font-bold sm:text-base">
          {name}
        </span>
      )}

      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          border
          border-border
          bg-card
        "
      >
        {badge ? (
          <Image
            src={badge}
            alt={name}
            width={28}
            height={28}
            className="object-contain"
          />
        ) : (
          <ShieldCheck className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      {!isRight && (
        <span className="truncate text-sm font-bold sm:text-base">
          {name}
        </span>
      )}
    </div>
  );
}