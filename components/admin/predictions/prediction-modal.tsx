'use client';

import {
  useState,
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

  if (highest === draw) {
    return 'DRAW';
  }

  if (highest === home) {
    return 'HOME';
  }

  return 'AWAY';
};

const getMarketConfig = (market: string) => {
  return PredictionMarketOptions.find(
    (item) => item.value === market,
  );
};

const dynamicPlayerMarkets: string[] = [
  PredictionMarkets.ANYTIME_GOALSCORER,
  PredictionMarkets.FIRST_GOALSCORER,
  PredictionMarkets.PLAYER_SHOTS,
  PredictionMarkets.PLAYER_SHOTS_ON_TARGET,
  PredictionMarkets.PLAYER_ASSISTS,
];

const isDynamicPlayerMarket = (market: string) => {
  return dynamicPlayerMarkets.includes(market);
};

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
        description:
          'Enter probability values to generate a prediction.',
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
    setMarkets((currentMarkets) => [
      ...currentMarkets,
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
    setMarkets((currentMarkets) =>
      currentMarkets.map((market, marketIndex) =>
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
    setMarkets((currentMarkets) =>
      currentMarkets.filter(
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
        market.market &&
        !market.selection,
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
        aria-label="Create prediction"
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
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-primary/10
                    text-primary
                  "
                >
                  <Target className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-base font-bold sm:text-lg">
                    Create Prediction
                  </h2>

                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Configure markets, probabilities, access, and price.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              aria-label="Close prediction modal"
              className="
                inline-flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-border
                text-muted-foreground
                transition
                hover:bg-muted
                hover:text-foreground
                disabled:opacity-50
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

            {/* Match hero */}

            <section
              className="
                overflow-hidden
                rounded-3xl
                border
                border-border
                bg-gradient-to-br
                from-primary/[0.10]
                via-background
                to-background
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-border/70
                  px-4
                  py-3
                  sm:px-6
                "
              >
                <span
                  className="
                    inline-flex
                    items-center
                    gap-2
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-primary
                  "
                >
                  <Trophy className="h-4 w-4" />
                  Match Prediction
                </span>

                <span
                  className="
                    rounded-full
                    bg-muted
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    text-muted-foreground
                  "
                >
                  Draft
                </span>
              </div>

              <div className="p-5 sm:p-7">
                <div
                  className="
                    grid
                    grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]
                    items-center
                    gap-3
                    sm:gap-6
                  "
                >
                  <TeamDisplay
                    name={match.homeTeam}
                    badge={match.homeTeamBadge}
                    label="Home"
                    align="right"
                  />

                  <span
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
                    "
                  >
                    VS
                  </span>

                  <TeamDisplay
                    name={match.awayTeam}
                    badge={match.awayTeamBadge}
                    label="Away"
                    align="left"
                  />
                </div>

                <div
                  className="
                    mx-auto
                    mt-7
                    max-w-2xl
                    rounded-2xl
                    border
                    border-primary/20
                    bg-primary/[0.06]
                    p-4
                  "
                >
                  <div className="flex items-center gap-2 text-primary">
                    <Target className="h-4 w-4" />

                    <span
                      className="
                        text-xs
                        font-bold
                        uppercase
                        tracking-[0.16em]
                      "
                    >
                      Auto prediction
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
                        <h3 className="truncate font-bold">
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

                        <span
                          className={`
                            text-sm
                            font-bold
                            ${
                              total === 100
                                ? 'text-primary'
                                : 'text-muted-foreground'
                            }
                          `}
                        >
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
                <SectionCard
                  title="Probability Engine"
                  description="Set the expected outcome probabilities. Their total must equal 100%."
                  icon={<BarChart3 className="h-5 w-5" />}
                >
                  <div
                    className={`
                      mb-4
                      flex
                      items-center
                      justify-between
                      rounded-2xl
                      border
                      p-4
                      ${
                        total === 100
                          ? 'border-emerald-500/20 bg-emerald-500/5'
                          : 'border-destructive/20 bg-destructive/5'
                      }
                    `}
                  >
                    <div>
                      <p className="font-semibold">
                        Probability Total
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {total === 100
                          ? 'Ready to create this prediction.'
                          : 'Adjust the values until the total is 100%.'}
                      </p>
                    </div>

                    <span
                      className={`
                        text-2xl
                        font-black
                        ${
                          total === 100
                            ? 'text-emerald-600'
                            : 'text-destructive'
                        }
                      `}
                    >
                      {total}%
                    </span>
                  </div>

                  <div className="grid gap-3">
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

                <SectionCard
                  title="Markets"
                  description="Add the betting markets included in this prediction."
                  icon={<Target className="h-5 w-5" />}
                  action={
                    <button
                      type="button"
                      onClick={addMarket}
                      className="
                        inline-flex
                        h-9
                        items-center
                        gap-2
                        rounded-xl
                        bg-primary/10
                        px-3
                        text-xs
                        font-semibold
                        text-primary
                        transition
                        hover:bg-primary/15
                      "
                    >
                      <Plus className="h-4 w-4" />
                      Add Market
                    </button>
                  }
                >
                  {markets.length === 0 ? (
                    <div
                      className="
                        rounded-2xl
                        border
                        border-dashed
                        border-border
                        bg-muted/20
                        p-7
                        text-center
                      "
                    >
                      <Target className="mx-auto h-6 w-6 text-muted-foreground" />

                      <p className="mt-3 text-sm font-semibold">
                        No markets added yet
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Add a market to build this prediction.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {markets.map((market, index) => {
                        const marketConfig = getMarketConfig(
                          market.market,
                        );

                        const isPlayerMarket =
                          isDynamicPlayerMarket(
                            market.market,
                          );

                        return (
                          <div
                            key={index}
                            className="
                              rounded-2xl
                              border
                              border-border
                              bg-muted/20
                              p-4
                            "
                          >
                            <div className="mb-4 flex items-center justify-between gap-3">
                              <span
                                className="
                                  flex
                                  h-7
                                  w-7
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-full
                                  bg-primary/10
                                  text-xs
                                  font-bold
                                  text-primary
                                "
                              >
                                {index + 1}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  removeMarket(index)
                                }
                                className="
                                  inline-flex
                                  items-center
                                  gap-2
                                  text-xs
                                  font-semibold
                                  text-destructive
                                  transition
                                  hover:underline
                                "
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Remove
                              </button>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
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
                                  Market
                                </span>

                                <select
                                  value={market.market}
                                  onChange={(event) =>
                                    updateMarket(index, {
                                      market:
                                        event.target.value,
                                      selection: '',
                                      playerName: '',
                                      customValue: '',
                                    })
                                  }
                                  className="
                                    mt-2
                                    h-11
                                    w-full
                                    rounded-xl
                                    border
                                    border-input
                                    bg-background
                                    px-3
                                    text-sm
                                    outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-primary/30
                                  "
                                >
                                  <option value="">
                                    Select market
                                  </option>

                                  {PredictionMarketOptions.map(
                                    (item) => (
                                      <option
                                        key={item.value}
                                        value={item.value}
                                      >
                                        {item.label}
                                      </option>
                                    ),
                                  )}
                                </select>
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
                                  Selection
                                </span>

                                <select
                                  value={market.selection}
                                  disabled={!market.market}
                                  onChange={(event) =>
                                    updateMarket(index, {
                                      selection:
                                        event.target.value,
                                    })
                                  }
                                  className="
                                    mt-2
                                    h-11
                                    w-full
                                    rounded-xl
                                    border
                                    border-input
                                    bg-background
                                    px-3
                                    text-sm
                                    outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-primary/30
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                  "
                                >
                                  <option value="">
                                    Select prediction
                                  </option>

                                  {marketConfig?.selections.map(
                                    (option) => (
                                      <option
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </option>
                                    ),
                                  )}
                                </select>
                              </label>
                            </div>

                            {isPlayerMarket && (
                              <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
                                    Player Name
                                  </span>

                                  <input
                                    type="text"
                                    placeholder="e.g. Erling Haaland"
                                    value={
                                      market.playerName || ''
                                    }
                                    onChange={(event) =>
                                      updateMarket(index, {
                                        playerName:
                                          event.target.value,
                                      })
                                    }
                                    className="
                                      mt-2
                                      h-11
                                      w-full
                                      rounded-xl
                                      border
                                      border-input
                                      bg-background
                                      px-3
                                      text-sm
                                      outline-none
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
                                    Override Text
                                  </span>

                                  <input
                                    type="text"
                                    placeholder="Optional"
                                    value={
                                      market.customValue || ''
                                    }
                                    onChange={(event) =>
                                      updateMarket(index, {
                                        customValue:
                                          event.target.value,
                                      })
                                    }
                                    className="
                                      mt-2
                                      h-11
                                      w-full
                                      rounded-xl
                                      border
                                      border-input
                                      bg-background
                                      px-3
                                      text-sm
                                      outline-none
                                      placeholder:text-muted-foreground
                                      focus-visible:ring-2
                                      focus-visible:ring-primary/30
                                    "
                                  />
                                </label>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </SectionCard>
              </div>

              <div className="space-y-6">
                <SectionCard
                  title="Access & Pricing"
                  description="Control who can access this prediction."
                  icon={<Crown className="h-5 w-5" />}
                >
                  <div className="grid gap-3">
                    {(
                      [
                        {
                          value: 'free',
                          label: 'Free',
                          description:
                            'Available to every user.',
                        },
                        {
                          value: 'regular',
                          label: 'Regular',
                          description:
                            'Available to Regular members.',
                        },
                        {
                          value: 'vip',
                          label: 'VIP',
                          description:
                            'Exclusive VIP access.',
                        },
                      ] as const
                    ).map((option) => (
                      <label
                        key={option.value}
                        className={`
                          flex
                          cursor-pointer
                          items-center
                          gap-3
                          rounded-2xl
                          border
                          p-4
                          transition
                          ${
                            accessType === option.value
                              ? 'border-primary/30 bg-primary/[0.06]'
                              : 'border-border bg-muted/20 hover:bg-muted/40'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="accessType"
                          value={option.value}
                          checked={
                            accessType === option.value
                          }
                          onChange={() =>
                            handleAccessChange(option.value)
                          }
                          className="accent-primary"
                        />

                        <div>
                          <p className="font-semibold">
                            {option.label}
                          </p>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <label className="mt-5 block">
                    <span
                      className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wider
                        text-muted-foreground
                      "
                    >
                      Individual Price
                    </span>

                    <div className="relative mt-2">
                      <span
                        className="
                          pointer-events-none
                          absolute
                          left-4
                          top-1/2
                          -translate-y-1/2
                          text-sm
                          font-semibold
                          text-muted-foreground
                        "
                      >
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
                          h-12
                          w-full
                          rounded-xl
                          border
                          border-input
                          bg-background
                          pl-8
                          pr-4
                          text-sm
                          font-semibold
                          outline-none
                          focus-visible:ring-2
                          focus-visible:ring-primary/30
                          disabled:cursor-not-allowed
                          disabled:bg-muted/50
                          disabled:text-muted-foreground
                        "
                      />
                    </div>
                  </label>
                </SectionCard>

                <SectionCard
                  title="Prediction Summary"
                  description="This is what will be saved with the fixture."
                  icon={<CheckCircle2 className="h-5 w-5" />}
                >
                  <div className="space-y-3">
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
              The prediction can only be created when probabilities total 100%.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:flex">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-border
                  px-5
                  text-sm
                  font-semibold
                  transition
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
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                {loading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
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
      className={`
        flex
        min-w-0
        items-center
        gap-3
        ${isRight ? 'justify-end text-right' : 'text-left'}
      `}
    >
      {isRight && (
        <div className="min-w-0">
          <p className="truncate text-sm font-bold sm:text-base">
            {name}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {label}
          </p>
        </div>
      )}

      <div
        className="
          flex
          h-12
          w-12
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
        {badge ? (
          <Image
            src={badge}
            alt={name}
            width={32}
            height={32}
            className="object-contain"
          />
        ) : (
          <ShieldCheck className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      {!isRight && (
        <div className="min-w-0">
          <p className="truncate text-sm font-bold sm:text-base">
            {name}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {label}
          </p>
        </div>
      )}
    </div>
  );
}

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
    <label
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
      <span className="min-w-0 truncate text-sm font-semibold">
        {label}
      </span>

      <div className="relative w-24 shrink-0">
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
            font-bold
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
  );
}

function SectionCard({
  title,
  description,
  icon,
  action,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
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
      <div className="flex items-start justify-between gap-4">
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
            <h3 className="font-bold">
              {title}
            </h3>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        {action}
      </div>

      <div className="mt-5">
        {children}
      </div>
    </section>
  );
}

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
      className={`
        flex
        items-center
        justify-between
        gap-4
        rounded-xl
        border
        px-4
        py-3
        ${
          highlighted
            ? 'border-primary/20 bg-primary/[0.06]'
            : 'border-border bg-muted/20'
        }
      `}
    >
      <span className="text-sm text-muted-foreground">
        {label}
      </span>

      <span
        className={`
          max-w-[60%]
          truncate
          text-right
          text-sm
          font-semibold
          ${
            highlighted
              ? 'text-primary'
              : 'text-foreground'
          }
          ${capitalize ? 'capitalize' : ''}
        `}
      >
        {value}
      </span>
    </div>
  );
}