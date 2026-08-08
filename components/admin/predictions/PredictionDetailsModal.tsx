'use client';

import Image from 'next/image';

import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Save,
  ShieldCheck,
  Target,
  Trash2,
  Trophy,
  X,
} from 'lucide-react';

import {
  getLeagueName,
} from '@/constants/leagues';

type Props = {
  prediction: any;
  onClose: () => void;

  settlementResult: string;
  setSettlementResult: (value: any) => void;

  probabilityTotal: number;

  updateProbability: (
    field: 'home' | 'draw' | 'away',
    value: number,
  ) => void;

  updateMarketSelection: (
    index: number,
    value: string,
  ) => void;

  saveEdit: () => void;
  deleteItem: () => void;
};

const getSettlementStatus = (prediction: any) => {
  const now = new Date();
  const matchTime = new Date(prediction.matchDate);

  const settlementTime = new Date(
    matchTime.getTime() + 2 * 60 * 60 * 1000,
  );

  if (prediction.settled) {
    return {
      type: 'settled',
      label: 'Settled',
      icon: <CheckCircle2 className="h-4 w-4" />,
      classes: 'bg-emerald-500/10 text-emerald-600',
    };
  }

  if (now >= settlementTime) {
    return {
      type: 'pending',
      label: 'Awaiting Settlement',
      icon: <AlertTriangle className="h-4 w-4" />,
      classes: 'bg-amber-500/10 text-amber-600',
    };
  }

  return {
    type: 'upcoming',
    label: 'Scheduled',
    icon: <Clock3 className="h-4 w-4" />,
    classes: 'bg-muted text-muted-foreground',
  };
};

export default function PredictionDetailsModal({
  prediction,
  onClose,
  settlementResult,
  setSettlementResult,
  probabilityTotal,
  updateProbability,
  updateMarketSelection,
  saveEdit,
  deleteItem,
}: Props) {
  if (!prediction) {
    return null;
  }

  const settlementStatus = getSettlementStatus(prediction);

  const leagueName =
    prediction.league?.name ??
    getLeagueName(prediction.leagueCode);

  const matchDate = new Date(prediction.matchDate);

  const confidence = Math.max(
    0,
    Math.min(100, Number(prediction.confidence) || 0),
  );

  const predictionHero = (() => {
    switch (prediction.prediction) {
      case 'HOME':
        return {
          badge: prediction.homeTeamBadge,
          title: `${prediction.homeTeam} To Win`,
          description: 'Home victory predicted',
        };

      case 'AWAY':
        return {
          badge: prediction.awayTeamBadge,
          title: `${prediction.awayTeam} To Win`,
          description: 'Away victory predicted',
        };

      case 'DRAW':
        return {
          badge: undefined,
          title: 'Draw',
          description: 'Draw predicted',
        };

      default:
        return {
          badge: undefined,
          title: prediction.prediction || 'No prediction',
          description: 'Prediction selected',
        };
    }
  })();

  const canSave =
    Boolean(settlementResult) ||
    probabilityTotal === 100;

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-end
        justify-center
        bg-slate-950/70
        p-0
        backdrop-blur-md
        sm:items-center
        sm:p-4
      "
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Prediction details"
        className="
          flex
          h-[100dvh]
          w-full
          max-w-6xl
          flex-col
          overflow-hidden
          border
          border-border
          bg-background
          shadow-2xl
          sm:h-auto
          sm:max-h-[92vh]
          sm:rounded-3xl
        "
      >
        <header
          className="
            shrink-0
            border-b
            border-border
            bg-background/95
            px-4
            py-3
            backdrop-blur-xl
            sm:px-6
          "
        >
          <div className="flex items-center justify-between gap-3">
            <div
              className={`
                inline-flex
                items-center
                gap-2
                rounded-full
                px-3
                py-1.5
                text-xs
                font-semibold
                ${settlementStatus.classes}
              `}
            >
              {settlementStatus.icon}
              {settlementStatus.label}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close prediction details"
              className="
                inline-flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-border
                text-muted-foreground
                transition
                hover:bg-muted
                hover:text-foreground
              "
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main
          className="
            min-h-0
            flex-1
            overflow-x-hidden
            overflow-y-auto
            scrollbar-hide
          "
        >
          <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
            <section
              className="
                overflow-hidden
                rounded-3xl
                border
                border-border
                bg-gradient-to-br
                from-primary/[0.08]
                via-background
                to-background
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-3
                  border-b
                  border-border/70
                  px-5
                  py-4
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  sm:px-6
                "
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="
                      flex
                      h-11
                      w-11
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
                    {prediction.league?.emblem ? (
                      <Image
                        src={prediction.league.emblem}
                        alt={leagueName}
                        width={28}
                        height={28}
                        className="object-contain"
                      />
                    ) : (
                      <Trophy className="h-5 w-5 text-primary" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p
                      className="
                        truncate
                        text-xs
                        font-semibold
                        uppercase
                        tracking-[0.16em]
                        text-primary
                      "
                    >
                      {leagueName}
                    </p>

                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      Match command centre
                    </p>
                  </div>
                </div>

                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    text-sm
                    text-muted-foreground
                  "
                >
                  <CalendarDays className="h-4 w-4 text-primary" />

                  {matchDate.toLocaleDateString('en-NG', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}

                  <span className="text-border">•</span>

                  {matchDate.toLocaleTimeString('en-NG', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </div>
              </div>

              <div className="p-5 sm:p-8">
                <div
                  className="
                    grid
                    grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]
                    items-center
                    gap-3
                    sm:gap-6
                  "
                >
                  <div
                    className="
                      flex
                      min-w-0
                      flex-col
                      items-center
                      text-center
                    "
                  >
                    <div
                      className="
                        flex
                        h-16
                        w-16
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-border
                        bg-background
                        shadow-sm
                        sm:h-20
                        sm:w-20
                      "
                    >
                      {prediction.homeTeamBadge ? (
                        <Image
                          src={prediction.homeTeamBadge}
                          alt={prediction.homeTeam}
                          width={56}
                          height={56}
                          className="h-12 w-12 object-contain sm:h-14 sm:w-14"
                        />
                      ) : (
                        <ShieldCheck className="h-7 w-7 text-muted-foreground" />
                      )}
                    </div>

                    <h2
                      className="
                        mt-3
                        line-clamp-2
                        text-sm
                        font-bold
                        sm:text-lg
                      "
                    >
                      {prediction.homeTeam}
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Home
                    </p>
                  </div>

                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-primary/30
                      bg-primary/10
                      text-xs
                      font-black
                      tracking-wider
                      text-primary
                      shadow-sm
                      sm:h-14
                      sm:w-14
                    "
                  >
                    VS
                  </div>

                  <div
                    className="
                      flex
                      min-w-0
                      flex-col
                      items-center
                      text-center
                    "
                  >
                    <div
                      className="
                        flex
                        h-16
                        w-16
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-border
                        bg-background
                        shadow-sm
                        sm:h-20
                        sm:w-20
                      "
                    >
                      {prediction.awayTeamBadge ? (
                        <Image
                          src={prediction.awayTeamBadge}
                          alt={prediction.awayTeam}
                          width={56}
                          height={56}
                          className="h-12 w-12 object-contain sm:h-14 sm:w-14"
                        />
                      ) : (
                        <ShieldCheck className="h-7 w-7 text-muted-foreground" />
                      )}
                    </div>

                    <h2
                      className="
                        mt-3
                        line-clamp-2
                        text-sm
                        font-bold
                        sm:text-lg
                      "
                    >
                      {prediction.awayTeam}
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Away
                    </p>
                  </div>
                </div>

                <div
                  className="
                    mx-auto
                    mt-7
                    max-w-2xl
                    rounded-2xl
                    border
                    border-primary/20
                    bg-primary/[0.07]
                    p-4
                    sm:p-5
                  "
                >
                  <div className="flex items-center gap-2 text-primary">
                    <Target className="h-4 w-4" />

                    <span
                      className="
                        text-xs
                        font-bold
                        uppercase
                        tracking-[0.18em]
                      "
                    >
                      Prediction verdict
                    </span>
                  </div>

                  <div
                    className="
                      mt-4
                      flex
                      flex-col
                      gap-4
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                    "
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="
                          flex
                          h-12
                          w-12
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-background
                          shadow-sm
                        "
                      >
                        {predictionHero.badge ? (
                          <Image
                            src={predictionHero.badge}
                            alt={predictionHero.title}
                            width={34}
                            height={34}
                            className="object-contain"
                          />
                        ) : (
                          <Target className="h-5 w-5 text-primary" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-base font-bold sm:text-lg">
                          {predictionHero.title}
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {predictionHero.description}
                        </p>
                      </div>
                    </div>

                    <div className="min-w-[150px]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Confidence
                        </span>

                        <span className="text-sm font-bold text-primary">
                          {confidence}%
                        </span>
                      </div>

                      <div
                        className="
                          mt-2
                          h-2
                          overflow-hidden
                          rounded-full
                          bg-primary/15
                        "
                      >
                        <div
                          className="
                            h-full
                            rounded-full
                            bg-gradient-to-r
                            from-primary
                            to-cyan-400
                            transition-all
                          "
                          style={{
                            width: `${confidence}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6">
                <Section
                  title="Match Overview"
                  description="Core fixture and prediction information."
                  icon={<Trophy className="h-5 w-5" />}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Info
                      label="Match ID"
                      value={prediction.matchId}
                    />

                    <Info
                      label="League"
                      value={leagueName}
                    />

                    <Info
                      label="Prediction"
                      value={predictionHero.title}
                      highlight
                    />

                    <Info
                      label="Access"
                      value={
                        <span className="capitalize">
                          {prediction.accessType || 'Free'}
                        </span>
                      }
                    />

                    <Info
                      label="Price"
                      value={`₦${Number(
                        prediction.price || 0,
                      ).toLocaleString()}`}
                    />

                    <Info
                      label="Match status"
                      value={prediction.status || 'Upcoming'}
                    />
                  </div>
                </Section>

                <Section
                  title="Markets"
                  description={`${
                    prediction.markets?.length || 0
                  } market selection${
                    prediction.markets?.length === 1 ? '' : 's'
                  } available.`}
                  icon={<Target className="h-5 w-5" />}
                >
                  {prediction.markets?.length ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {prediction.markets.map(
                        (
                          market: any,
                          index: number,
                        ) => (
                          <div
                            key={index}
                            className="
                              rounded-2xl
                              border
                              border-border
                              bg-muted/30
                              p-4
                            "
                          >
                            <p
                              className="
                                text-xs
                                font-semibold
                                uppercase
                                tracking-wider
                                text-muted-foreground
                              "
                            >
                              {market.market}
                            </p>

                            <input
                              value={market.selection}
                              onChange={(event) =>
                                updateMarketSelection(
                                  index,
                                  event.target.value,
                                )
                              }
                              aria-label={`${market.market} selection`}
                              className="
                                mt-3
                                h-11
                                w-full
                                rounded-xl
                                border
                                border-input
                                bg-background
                                px-3
                                text-sm
                                font-medium
                                outline-none
                                transition
                                focus-visible:ring-2
                                focus-visible:ring-primary/30
                              "
                            />
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <EmptyState message="No markets have been added to this prediction." />
                  )}
                </Section>

                <Section
                  title="System Information"
                  description="Administrative record details."
                  icon={<ShieldCheck className="h-5 w-5" />}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Info
                      label="Created"
                      value={new Date(
                        prediction.createdAt,
                      ).toLocaleString()}
                    />

                    <Info
                      label="Last updated"
                      value={new Date(
                        prediction.updatedAt,
                      ).toLocaleString()}
                    />

                    <Info
                      label="Settled"
                      value={prediction.settled ? 'Yes' : 'No'}
                    />

                    <Info
                      label="Settled at"
                      value={
                        prediction.settledAt
                          ? new Date(
                              prediction.settledAt,
                            ).toLocaleString()
                          : 'Not settled'
                      }
                    />
                  </div>
                </Section>
              </div>

              <div className="space-y-6">
                <Section
                  title="Probability Controls"
                  description="Total probability must equal 100%."
                  icon={<Target className="h-5 w-5" />}
                >
                  <div
                    className={`
                      flex
                      items-center
                      justify-between
                      rounded-2xl
                      border
                      p-4
                      ${
                        probabilityTotal === 100
                          ? 'border-emerald-500/20 bg-emerald-500/5'
                          : 'border-destructive/20 bg-destructive/5'
                      }
                    `}
                  >
                    <div>
                      <p className="font-semibold">
                        Probability total
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Keep the three outcomes balanced.
                      </p>
                    </div>

                    <span
                      className={`
                        text-2xl
                        font-black
                        ${
                          probabilityTotal === 100
                            ? 'text-emerald-600'
                            : 'text-destructive'
                        }
                      `}
                    >
                      {probabilityTotal}%
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {(
                      [
                        {
                          field: 'home',
                          label: `${prediction.homeTeam} Win`,
                        },
                        {
                          field: 'draw',
                          label: 'Draw',
                        },
                        {
                          field: 'away',
                          label: `${prediction.awayTeam} Win`,
                        },
                      ] as const
                    ).map((item) => (
                      <label
                        key={item.field}
                        className="
                          flex
                          items-center
                          justify-between
                          gap-4
                          rounded-2xl
                          border
                          border-border
                          bg-muted/20
                          p-3
                        "
                      >
                        <span className="min-w-0 truncate text-sm font-medium">
                          {item.label}
                        </span>

                        <div className="relative w-24 shrink-0">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={
                              prediction.probabilities?.[
                                item.field
                              ] ?? 0
                            }
                            onChange={(event) =>
                              updateProbability(
                                item.field,
                                Number(event.target.value),
                              )
                            }
                            aria-label={`${item.label} probability`}
                            className="
                              h-10
                              w-full
                              rounded-xl
                              border
                              border-input
                              bg-background
                              px-3
                              pr-7
                              text-right
                              text-sm
                              font-semibold
                              outline-none
                              focus-visible:ring-2
                              focus-visible:ring-primary/30
                            "
                          />

                          <span
                            className="
                              pointer-events-none
                              absolute
                              right-3
                              top-1/2
                              -translate-y-1/2
                              text-xs
                              text-muted-foreground
                            "
                          >
                            %
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </Section>

                <Section
                  title="Settlement"
                  description="Confirm the final match result when available."
                  icon={<CheckCircle2 className="h-5 w-5" />}
                >
                  {settlementStatus.type === 'pending' && (
                    <div
                      className="
                        mb-4
                        flex
                        gap-3
                        rounded-2xl
                        border
                        border-amber-500/30
                        bg-amber-500/10
                        p-4
                        text-sm
                        text-amber-700
                      "
                    >
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

                      <p>
                        This fixture is ready for settlement. Select
                        the final result below.
                      </p>
                    </div>
                  )}

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
                      Final result
                    </span>

                    <select
                      value={settlementResult}
                      onChange={(event) =>
                        setSettlementResult(
                          event.target.value,
                        )
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
                        focus-visible:ring-2
                        focus-visible:ring-primary/30
                      "
                    >
                      <option value="">
                        Choose settlement result
                      </option>

                      <option value="HOME">
                        {prediction.homeTeam} won
                      </option>

                      <option value="DRAW">
                        Draw
                      </option>

                      <option value="AWAY">
                        {prediction.awayTeam} won
                      </option>

                      <option value="VOID">
                        Void fixture
                      </option>
                    </select>
                  </label>
                </Section>
              </div>
            </div>
          </div>
        </main>

        <footer
          className="
            shrink-0
            border-t
            border-border
            bg-background/95
            px-4
            py-3
            backdrop-blur-xl
            sm:px-6
            sm:py-4
          "
        >
          <div
            className="
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <p className="text-xs text-muted-foreground">
              Changes are saved directly to this prediction.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:flex">
              <button
                type="button"
                onClick={deleteItem}
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-destructive/30
                  px-4
                  text-sm
                  font-semibold
                  text-destructive
                  transition
                  hover:bg-destructive
                  hover:text-white
                "
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>

              <button
                type="button"
                onClick={saveEdit}
                disabled={!canSave}
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
                  disabled:pointer-events-none
                  disabled:opacity-40
                "
              >
                <Save className="h-4 w-4" />

                {settlementResult
                  ? 'Settle Prediction'
                  : 'Save Changes'}
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className="
        rounded-3xl
        border
        border-border
        bg-card/60
        p-4
        shadow-sm
        sm:p-5
      "
    >
      <div className="flex items-start gap-3">
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
          {icon}
        </div>

        <div>
          <h3 className="text-base font-bold">
            {title}
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-5">
        {children}
      </div>
    </section>
  );
}

function Info({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`
        min-w-0
        rounded-2xl
        border
        p-4
        ${
          highlight
            ? 'border-primary/20 bg-primary/[0.06]'
            : 'border-border bg-muted/20'
        }
      `}
    >
      <p
        className="
          text-xs
          font-semibold
          uppercase
          tracking-wider
          text-muted-foreground
        "
      >
        {label}
      </p>

      <div
        className={`
          mt-2
          truncate
          text-sm
          font-semibold
          ${
            highlight
              ? 'text-primary'
              : 'text-foreground'
          }
        `}
      >
        {value ?? '-'}
      </div>
    </div>
  );
}

function EmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-dashed
        border-border
        bg-muted/20
        p-6
        text-center
        text-sm
        text-muted-foreground
      "
    >
      {message}
    </div>
  );
}