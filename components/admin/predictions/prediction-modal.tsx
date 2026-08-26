'use client';

import {
  useState,
  type ReactNode,
} from 'react';

import Image from 'next/image';

import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Crown,
  LoaderCircle,
  Plus,
  ShieldCheck,
  Target,
  Trash2,
  Trophy,
  X,
} from 'lucide-react';

import {
  PredictionMarkets,
} from '@/lib/prediction-enums';

import {
  PredictionMarketOptions,
} from '@/lib/prediction-market-config';

interface MarketItem {
  market: string;
  selection: string;
  playerName?: string;
  line?: string;
  customValue?: string;
}

interface PredictionModalProps {
  match: any;
  onClose: () => void;
  onSubmit: (payload: any) => void;
  loading: boolean;
}

const calculateConfidence = (
  home: number,
  draw: number,
  away: number,
) => {
  const probabilities = [home, draw, away].sort(
    (first, second) => second - first,
  );

  const highest = probabilities[0];
  const second = probabilities[1];
  const gap = highest - second;

  return Math.min(
    95,
    Math.round(55 + gap + highest * 0.3),
  );
};

const getAutoPrediction = (
  home: number,
  draw: number,
  away: number,
) => {
  const highest = Math.max(home, draw, away);

  if (highest === draw) return 'DRAW';
  if (highest === home) return 'HOME';

  return 'AWAY';
};

const getMarketConfig = (market: string) =>
  PredictionMarketOptions.find(
    (item) => item.value === market,
  );

const dynamicPlayerMarkets: string[] = [
  PredictionMarkets.ANYTIME_GOALSCORER,
  PredictionMarkets.FIRST_GOALSCORER,
  PredictionMarkets.PLAYER_SHOTS,
  PredictionMarkets.PLAYER_SHOTS_ON_TARGET,
  PredictionMarkets.PLAYER_ASSISTS,
];

const isDynamicPlayerMarket = (market: string) =>
  dynamicPlayerMarkets.includes(market);

export default function PredictionModal({
  match,
  onClose,
  onSubmit,
  loading,
}: PredictionModalProps) {
  const [homeProb, setHomeProb] = useState('');
  const [drawProb, setDrawProb] = useState('');
  const [awayProb, setAwayProb] = useState('');

  const [markets, setMarkets] = useState<MarketItem[]>([]);

  const [accessType, setAccessType] = useState<
    'free' | 'regular' | 'vip'
  >('free');

  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  const home = Number(homeProb) || 0;
  const draw = Number(drawProb) || 0;
  const away = Number(awayProb) || 0;

  const total = home + draw + away;

  const confidence =
    total === 100
      ? calculateConfidence(home, draw, away)
      : 0;

  const autoPrediction =
    total > 0
      ? getAutoPrediction(home, draw, away)
      : null;

  const predictionHero = (() => {
    if (!autoPrediction) {
      return {
        badge: undefined,
        title: 'Waiting for probabilities',
        description: 'Enter probabilities to generate a prediction.',
      };
    }

    switch (autoPrediction) {
      case 'HOME':
        return {
          badge: match.homeTeamBadge,
          title: `${match.homeTeam} To Win`,
          description: 'Home victory predicted',
        };

      case 'AWAY':
        return {
          badge: match.awayTeamBadge,
          title: `${match.awayTeam} To Win`,
          description: 'Away victory predicted',
        };

      default:
        return {
          badge: undefined,
          title: 'Draw',
          description: 'Draw predicted',
        };
    }
  })();

  const addMarket = () => {
    setMarkets((current) => [
      ...current,
      {
        market: '',
        selection: '',
      },
    ]);
  };

  const updateMarket = (
    index: number,
    updates: Partial<MarketItem>,
  ) => {
    setMarkets((current) =>
      current.map((market, marketIndex) =>
        marketIndex === index
          ? {
              ...market,
              ...updates,
            }
          : market,
      ),
    );
  };

  const removeMarket = (index: number) => {
    setMarkets((current) =>
      current.filter(
        (_, marketIndex) => marketIndex !== index,
      ),
    );
  };

  const handleAccessChange = (
    value: 'free' | 'regular' | 'vip',
  ) => {
    setAccessType(value);

    if (value === 'free') {
      setPrice('0');
      return;
    }

    if (price === '0') {
      setPrice('');
    }
  };

  const handleSubmit = () => {
    setError('');

    if (total !== 100) {
      setError(
        'The home, draw, and away probabilities must equal exactly 100%.',
      );
      return;
    }

    const incompleteMarket = markets.some(
      (market) =>
        market.market && !market.selection,
    );

    if (incompleteMarket) {
      setError(
        'Please select a prediction for every market you add.',
      );
      return;
    }

    const numericPrice = Number(price);

    if (
      accessType !== 'free' &&
      (!price || numericPrice <= 0)
    ) {
      setError(
        'Enter a valid price for Regular or VIP predictions.',
      );
      return;
    }

    const cleanedMarkets = markets
      .filter((market) => market.market)
      .map((market) => {
        let finalSelection = market.selection;

        if (
          isDynamicPlayerMarket(market.market) &&
          market.playerName
        ) {
          const selectedOption = getMarketConfig(
            market.market,
          )?.selections.find(
            (item) => item.value === market.selection,
          );

          const selectionText =
            market.customValue ||
            selectedOption?.label ||
            '';

          finalSelection =
            `${market.playerName} ${selectionText}`.trim();
        }

        return {
          market: market.market,
          selection: finalSelection,
        };
      });

    onSubmit({
      prediction: autoPrediction,
      confidence,
      probabilities: {
        home,
        draw,
        away,
      },
      markets: cleanedMarkets,
      accessType,
      price:
        accessType === 'free'
          ? 0
          : numericPrice,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create prediction"
        className="
          flex
          h-[100dvh]
          w-full
          max-w-5xl
          flex-col
          overflow-hidden
          border
          border-border
          bg-background
          shadow-2xl
          sm:h-auto
          sm:max-h-[92vh]
          sm:rounded-2xl
        "
      >
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Target className="h-4.5 w-4.5" />
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-bold tracking-tight">
                Create Prediction
              </h2>

              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                Configure probabilities, markets, access and price.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close prediction modal"
            className="
              inline-flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              border
              border-border
              text-muted-foreground
              transition-colors
              hover:bg-muted
              hover:text-foreground
              disabled:opacity-50
            "
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Content */}
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl space-y-4 p-4 sm:p-5">
            {error && (
              <div
                role="alert"
                className="
                  flex
                  items-start
                  gap-2.5
                  rounded-xl
                  border
                  border-destructive/20
                  bg-destructive/5
                  px-3.5
                  py-3
                  text-xs
                  text-destructive
                "
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Match Hero */}
            <section className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-primary">
                  <Trophy className="h-3.5 w-3.5" />
                  Match Prediction
                </div>

                <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Draft
                </span>
              </div>

              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
                  <TeamDisplay
                    name={match.homeTeam}
                    badge={match.homeTeamBadge}
                    label="Home"
                    align="right"
                  />

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-[10px] font-black tracking-wider text-primary">
                    VS
                  </div>

                  <TeamDisplay
                    name={match.awayTeam}
                    badge={match.awayTeamBadge}
                    label="Away"
                    align="left"
                  />
                </div>

                <div className="mx-auto mt-4 max-w-2xl rounded-xl border border-border bg-muted/30 p-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                    <Target className="h-3.5 w-3.5" />
                    Auto Prediction
                  </div>

                  <div className="mt-2.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                        {predictionHero.badge ? (
                          <Image
                            src={predictionHero.badge}
                            alt={predictionHero.title}
                            width={28}
                            height={28}
                            className="object-contain"
                          />
                        ) : (
                          <Target className="h-4 w-4 text-primary" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold">
                          {predictionHero.title}
                        </h3>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {predictionHero.description}
                        </p>
                      </div>
                    </div>

                    <div className="w-full sm:w-40">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium text-muted-foreground">
                          Confidence
                        </span>

                        <span
                          className={`text-xs font-bold ${
                            total === 100
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {confidence}%
                        </span>
                      </div>

                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-[width]"
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

            {/* Main Grid */}
            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4">
                {/* Probability */}
                <SectionCard
                  title="Probability Engine"
                  description="Set outcome probabilities. Total must equal 100%."
                  icon={<BarChart3 className="h-4 w-4" />}
                >
                  <div
                    className={`mb-3 flex items-center justify-between rounded-xl border px-3 py-2.5 ${
                      total === 100
                        ? 'border-emerald-500/20 bg-emerald-500/5'
                        : 'border-destructive/15 bg-destructive/5'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold">
                        Probability Total
                      </p>

                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {total === 100
                          ? 'Ready to create prediction.'
                          : 'Adjust values to reach 100%.'}
                      </p>
                    </div>

                    <span
                      className={`ml-3 text-xl font-black ${
                        total === 100
                          ? 'text-emerald-600'
                          : 'text-destructive'
                      }`}
                    >
                      {total}%
                    </span>
                  </div>

                  <div className="space-y-2">
                    <ProbabilityInput
                      label={`${match.homeTeam} Win`}
                      value={homeProb}
                      onChange={setHomeProb}
                    />

                    <ProbabilityInput
                      label="Draw"
                      value={drawProb}
                      onChange={setDrawProb}
                    />

                    <ProbabilityInput
                      label={`${match.awayTeam} Win`}
                      value={awayProb}
                      onChange={setAwayProb}
                    />
                  </div>
                </SectionCard>

                {/* Markets */}
                <SectionCard
                  title="Markets"
                  description="Add the markets included in this prediction."
                  icon={<Target className="h-4 w-4" />}
                  action={
                    <button
                      type="button"
                      onClick={addMarket}
                      className="
                        inline-flex
                        h-8
                        items-center
                        gap-1.5
                        rounded-lg
                        bg-primary/10
                        px-2.5
                        text-[11px]
                        font-semibold
                        text-primary
                        transition-colors
                        hover:bg-primary/15
                      "
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add
                    </button>
                  }
                >
                  {markets.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center">
                      <Target className="mx-auto h-5 w-5 text-muted-foreground" />

                      <p className="mt-2 text-xs font-semibold">
                        No markets added
                      </p>

                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Add a market to build this prediction.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {markets.map((market, index) => {
                        const marketConfig =
                          getMarketConfig(market.market);

                        const isPlayerMarket =
                          isDynamicPlayerMarket(
                            market.market,
                          );

                        return (
                          <div
                            key={index}
                            className="rounded-xl border border-border bg-muted/20 p-3"
                          >
                            <div className="mb-2.5 flex items-center justify-between">
                              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                                {index + 1}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  removeMarket(index)
                                }
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-destructive hover:underline"
                              >
                                <Trash2 className="h-3 w-3" />
                                Remove
                              </button>
                            </div>

                            <div className="grid gap-2.5 sm:grid-cols-2">
                              <SelectField
                                label="Market"
                                value={market.market}
                                onChange={(value) =>
                                  updateMarket(index, {
                                    market: value,
                                    selection: '',
                                    playerName: '',
                                    customValue: '',
                                  })
                                }
                                options={PredictionMarketOptions}
                                placeholder="Select market"
                              />

                              <SelectField
                                label="Selection"
                                value={market.selection}
                                disabled={!market.market}
                                onChange={(value) =>
                                  updateMarket(index, {
                                    selection: value,
                                  })
                                }
                                options={
                                  marketConfig?.selections || []
                                }
                                placeholder="Select prediction"
                              />
                            </div>

                            {isPlayerMarket && (
                              <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
                                <TextField
                                  label="Player Name"
                                  placeholder="e.g. Erling Haaland"
                                  value={
                                    market.playerName || ''
                                  }
                                  onChange={(value) =>
                                    updateMarket(index, {
                                      playerName: value,
                                    })
                                  }
                                />

                                <TextField
                                  label="Override Text"
                                  placeholder="Optional"
                                  value={
                                    market.customValue || ''
                                  }
                                  onChange={(value) =>
                                    updateMarket(index, {
                                      customValue: value,
                                    })
                                  }
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </SectionCard>
              </div>

              <div className="space-y-4">
                {/* Access */}
                <SectionCard
                  title="Access & Pricing"
                  description="Control who can access this prediction."
                  icon={<Crown className="h-4 w-4" />}
                >
                  <div className="grid gap-2">
                    {(
                      [
                        {
                          value: 'free',
                          label: 'Free',
                          description: 'Available to every user.',
                        },
                        {
                          value: 'regular',
                          label: 'Regular',
                          description: 'Available to Regular members.',
                        },
                        {
                          value: 'vip',
                          label: 'VIP',
                          description: 'Exclusive VIP access.',
                        },
                      ] as const
                    ).map((option) => (
                      <label
                        key={option.value}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-colors ${
                          accessType === option.value
                            ? 'border-primary/25 bg-primary/5'
                            : 'border-border bg-muted/20 hover:bg-muted/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name="accessType"
                          value={option.value}
                          checked={
                            accessType === option.value
                          }
                          onChange={() =>
                            handleAccessChange(
                              option.value,
                            )
                          }
                          className="accent-primary"
                        />

                        <div className="min-w-0">
                          <p className="text-xs font-semibold">
                            {option.label}
                          </p>

                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <label className="mt-3 block">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Individual Price
                    </span>

                    <div className="relative mt-1.5">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                        ₦
                      </span>

                      <input
                        type="number"
                        min="0"
                        disabled={accessType === 'free'}
                        placeholder={
                          accessType === 'free'
                            ? 'Included with free access'
                            : 'Enter price'
                        }
                        value={
                          accessType === 'free'
                            ? '0'
                            : price
                        }
                        onChange={(event) =>
                          setPrice(event.target.value)
                        }
                        className="
                          h-10
                          w-full
                          rounded-lg
                          border
                          border-input
                          bg-background
                          pl-7
                          pr-3
                          text-xs
                          font-semibold
                          outline-none
                          focus-visible:ring-2
                          focus-visible:ring-primary/20
                          disabled:cursor-not-allowed
                          disabled:bg-muted/50
                          disabled:text-muted-foreground
                        "
                      />
                    </div>
                  </label>
                </SectionCard>

                {/* Summary */}
                <SectionCard
                  title="Prediction Summary"
                  description="Review what will be saved with the fixture."
                  icon={<CheckCircle2 className="h-4 w-4" />}
                >
                  <div className="space-y-1.5">
                    <SummaryRow
                      label="Prediction"
                      value={
                        autoPrediction
                          ? predictionHero.title
                          : 'Not ready'
                      }
                      highlighted
                    />

                    <SummaryRow
                      label="Confidence"
                      value={
                        total === 100
                          ? `${confidence}%`
                          : 'Waiting for 100% total'
                      }
                    />

                    <SummaryRow
                      label="Markets"
                      value={`${markets.length} added`}
                    />

                    <SummaryRow
                      label="Access"
                      value={accessType}
                      capitalize
                    />

                    <SummaryRow
                      label="Price"
                      value={
                        accessType === 'free'
                          ? 'Free'
                          : `₦${Number(
                              price || 0,
                            ).toLocaleString()}`
                      }
                    />
                  </div>
                </SectionCard>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="shrink-0 border-t border-border bg-background px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-muted-foreground">
              Probabilities must total exactly 100%.
            </p>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="
                  inline-flex
                  h-9
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-border
                  px-4
                  text-xs
                  font-semibold
                  transition-colors
                  hover:bg-muted
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || total !== 100}
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
                  transition-colors
                  hover:brightness-110
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                {loading ? (
                  <>
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    Create Prediction
                  </>
                )}
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Team                                                                      */
/* -------------------------------------------------------------------------- */

function TeamDisplay({
  name,
  badge,
  label,
  align,
}: {
  name: string;
  badge?: string;
  label: string;
  align: 'left' | 'right';
}) {
  const isRight = align === 'right';

  return (
    <div
      className={`flex min-w-0 items-center gap-2.5 ${
        isRight
          ? 'justify-end text-right'
          : 'text-left'
      }`}
    >
      {isRight && (
        <TeamText
          name={name}
          label={label}
        />
      )}

      <TeamBadge
        name={name}
        badge={badge}
      />

      {!isRight && (
        <TeamText
          name={name}
          label={label}
        />
      )}
    </div>
  );
}

function TeamText({
  name,
  label,
}: {
  name: string;
  label: string;
}) {
  return (
    <div className="min-w-0">
      <p className="truncate text-xs font-bold sm:text-sm">
        {name}
      </p>

      <p className="mt-0.5 text-[10px] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function TeamBadge({
  name,
  badge,
}: {
  name: string;
  badge?: string;
}) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background">
      {badge ? (
        <Image
          src={badge}
          alt={name}
          width={28}
          height={28}
          className="object-contain"
        />
      ) : (
        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Probability                                                               */
/* -------------------------------------------------------------------------- */

function ProbabilityInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2">
      <span className="min-w-0 truncate text-xs font-semibold">
        {label}
      </span>

      <div className="relative w-20 shrink-0">
        <input
          type="number"
          min="0"
          max="100"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder="0"
          className="
            h-9
            w-full
            rounded-lg
            border
            border-input
            bg-background
            px-2.5
            pr-6
            text-right
            text-xs
            font-bold
            outline-none
            focus-visible:ring-2
            focus-visible:ring-primary/20
          "
        />

        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
          %
        </span>
      </div>
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/* Select Field                                                              */
/* -------------------------------------------------------------------------- */

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
  }>;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>

      <select
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="
          mt-1.5
          h-9
          w-full
          rounded-lg
          border
          border-input
          bg-background
          px-2.5
          text-xs
          outline-none
          focus-visible:ring-2
          focus-visible:ring-primary/20
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/* Text Field                                                                */
/* -------------------------------------------------------------------------- */

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="
          mt-1.5
          h-9
          w-full
          rounded-lg
          border
          border-input
          bg-background
          px-2.5
          text-xs
          outline-none
          placeholder:text-muted-foreground
          focus-visible:ring-2
          focus-visible:ring-primary/20
        "
      />
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/* Section Card                                                              */
/* -------------------------------------------------------------------------- */

function SectionCard({
  title,
  description,
  icon,
  action,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-3.5 shadow-sm sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-bold tracking-tight">
              {title}
            </h3>

            <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        {action}
      </div>

      <div className="mt-3.5">
        {children}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                   */
/* -------------------------------------------------------------------------- */

function SummaryRow({
  label,
  value,
  highlighted = false,
  capitalize = false,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${
        highlighted
          ? 'border-primary/15 bg-primary/5'
          : 'border-border bg-muted/20'
      }`}
    >
      <span className="text-[11px] text-muted-foreground">
        {label}
      </span>

      <span
        className={`max-w-[65%] truncate text-right text-xs font-semibold ${
          highlighted
            ? 'text-primary'
            : 'text-foreground'
        } ${capitalize ? 'capitalize' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}