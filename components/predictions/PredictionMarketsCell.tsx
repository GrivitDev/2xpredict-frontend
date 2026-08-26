'use client';

import {
  useState,
} from 'react';

import {
  ChevronDown,
  ChevronUp,
  Clock3,
  Crown,
  Lock,
} from 'lucide-react';

import {
  PredictionMarketOptions,
} from '@/lib/prediction-market-config';

interface Props {
  prediction: any;
  onSubscriptionRequired?: () => void;
}

interface BackendMarket {
  market?: string;
  selection?: string;
  [key: string]: any;
}

type Plan =
  | 'free'
  | 'regular'
  | 'vip';

type MarketLockInfo = {
  title: string;
  description: string;
  icon: React.ReactNode;
  showReleaseDate: boolean;
};

export default function PredictionMarketsCell({
  prediction,
  onSubscriptionRequired,
}: Props) {
  const [expanded, setExpanded] =
    useState(false);

  const access =
    prediction?.access ?? {};

  const userPlan = normalizePlan(
    access.plan ??
      prediction?.userPlan,
  );

  const predictionPlan =
    normalizePlan(
      prediction?.accessType,
    );

  const canView =
    access.allowed === true;

  const released =
    access.released === true;

  const releaseAt =
    access.releaseAt ?? null;

  const accessState =
    access.state ?? '';

  const accessMessage =
    access.message ?? null;

  const markets: BackendMarket[] =
    Array.isArray(prediction?.markets)
      ? prediction.markets
      : [];

  /* =========================================================
     PREDICTION ACCESS LOCK
  ========================================================= */

  if (!canView) {
    const lockInfo =
      getMarketLockInfo({
        userPlan,
        predictionPlan,
        released,
        releaseAt,
        accessState,
        accessMessage,
      });

    return (
      <button
        type="button"
        onClick={onSubscriptionRequired}
        className="
          group
          w-full
          rounded-xl
          border
          border-dashed
          border-primary/30
          bg-primary/5
          p-3
          text-left
          transition
          hover:border-primary/60
          hover:bg-primary/10
          focus:outline-none
          focus:ring-2
          focus:ring-primary/30
        "
      >
        <div className="flex items-center gap-2">
          <span
            className="
              flex
              h-6
              w-6
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-primary/10
              text-primary
            "
          >
            {lockInfo.icon}
          </span>

          <div className="min-w-0">
            <p
              className="
                truncate
                text-[10px]
                font-bold
                text-primary
              "
            >
              {lockInfo.title}
            </p>

            <p
              className="
                mt-0.5
                text-[9px]
                text-muted-foreground
              "
            >
              {lockInfo.description}
            </p>
          </div>
        </div>

        {releaseAt &&
          !released &&
          lockInfo.showReleaseDate && (
            <p
              className="
                mt-2
                border-t
                border-primary/10
                pt-1.5
                text-[8px]
                text-muted-foreground
              "
            >
              Available from{' '}
              {formatReleaseDate(releaseAt)}
            </p>
          )}
      </button>
    );
  }

  /* =========================================================
     FREE USER
  ========================================================= */

  if (userPlan === 'free') {
    return (
      <button
        type="button"
        onClick={onSubscriptionRequired}
        className="
          group
          w-full
          rounded-xl
          border
          border-dashed
          border-primary/30
          bg-primary/5
          p-3
          text-left
          transition
          hover:border-primary/60
          hover:bg-primary/10
          focus:outline-none
          focus:ring-2
          focus:ring-primary/30
        "
      >
        <div className="flex items-center gap-2">
          <span
            className="
              flex
              h-6
              w-6
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-primary/10
              text-primary
            "
          >
            <Lock size={11} />
          </span>

          <div className="min-w-0">
            <p
              className="
                truncate
                text-[10px]
                font-bold
                text-primary
              "
            >
              Markets Locked
            </p>

            <p
              className="
                mt-0.5
                text-[9px]
                text-muted-foreground
              "
            >
              Upgrade to Regular to view
              prediction markets.
            </p>
          </div>
        </div>
      </button>
    );
  }

  /* =========================================================
     NO MARKETS
  ========================================================= */

  if (!markets.length) {
    return (
      <div
        className="
          rounded-xl
          border
          border-dashed
          border-border
          p-3
          text-xs
          text-muted-foreground
        "
      >
        No markets available
      </div>
    );
  }

  /* =========================================================
     MARKET DISPLAY
  ========================================================= */

  const isVip =
    userPlan === 'vip';

  const isRegular =
    userPlan === 'regular';

  const canExpand =
    isVip && markets.length > 3;

  const marketsToRender =
    isRegular
      ? markets
      : canExpand && expanded
        ? markets
        : markets.slice(0, 3);

  return (
    <div className="space-y-2">
      <div className="space-y-1.5">
        {marketsToRender.map(
          (market, index) => (
            <div
              key={getMarketKey(
                market,
                index,
              )}
              className="
                flex
                min-w-0
                items-start
                gap-2
              "
            >
              <span
                className="
                  mt-1
                  h-1.5
                  w-1.5
                  shrink-0
                  rounded-full
                  bg-primary
                "
              />

              <span
                className="
                  min-w-0
                  text-[11px]
                  leading-tight
                "
              >
                {resolveMarketDisplay(
                  market,
                )}
              </span>
            </div>
          ),
        )}
      </div>

      {isRegular && (
        <button
          type="button"
          onClick={onSubscriptionRequired}
          className="
            inline-flex
            w-full
            items-center
            gap-1.5
            rounded-lg
            border
            border-primary/20
            bg-primary/5
            px-2
            py-1.5
            text-left
            transition
            hover:border-primary/40
            hover:bg-primary/10
            focus:outline-none
            focus:ring-2
            focus:ring-primary/30
          "
        >
          <Crown
            size={12}
            className="
              shrink-0
              text-primary
            "
          />

          <span
            className="
              min-w-0
              text-[9px]
              font-semibold
              leading-tight
              text-primary
            "
          >
            Upgrade to VIP to see all
            available markets
          </span>
        </button>
      )}

      {canExpand && (
        <button
          type="button"
          onClick={() =>
            setExpanded(
              current => !current,
            )
          }
          className="
            inline-flex
            items-center
            gap-1
            text-[10px]
            font-semibold
            text-primary
            hover:underline
          "
        >
          {expanded ? (
            <>
              <ChevronUp size={13} />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown size={13} />
              +{markets.length - 3} More
            </>
          )}
        </button>
      )}
    </div>
  );
}

/* =========================================================
   MARKET DISPLAY
========================================================= */

function resolveMarketDisplay(
  market:
    | BackendMarket
    | string,
): string {
  if (typeof market === 'string') {
    return resolveStringMarket(market);
  }

  const marketValue =
    String(market.market ?? '').trim();

  const selectionValue =
    String(
      market.selection ?? '',
    ).trim();

  if (!marketValue && !selectionValue) {
    return 'Unknown market';
  }

  const marketConfig =
    findMarketConfig(marketValue);

  if (!marketConfig) {
    return marketValue &&
      selectionValue
      ? formatFallbackMarket(
          marketValue,
          selectionValue,
        )
      : selectionValue ||
          marketValue ||
          'Unknown market';
  }

  const marketLabel =
    marketConfig.label;

  if (
    isDynamicPlayerMarket(
      String(marketConfig.value),
    )
  ) {
    return selectionValue
      ? `${marketLabel}: ${selectionValue}`
      : marketLabel;
  }

  const selectionConfig =
    findSelectionConfig(
      marketConfig.selections,
      selectionValue,
    );

  if (selectionConfig) {
    return `${marketLabel}: ${selectionConfig.label}`;
  }

  return selectionValue
    ? `${marketLabel}: ${selectionValue}`
    : marketLabel;
}

/* =========================================================
   STRING MARKET
========================================================= */

function resolveStringMarket(
  value: string,
): string {
  const normalized =
    normalizeIdentifier(value);

  const market =
    PredictionMarketOptions.find(
      item =>
        normalizeIdentifier(
          String(item.value),
        ) === normalized ||
        normalizeIdentifier(
          item.label,
        ) === normalized,
    );

  if (market) {
    return market.label;
  }

  for (
    const option of PredictionMarketOptions
  ) {
    const selection =
      option.selections.find(
        item =>
          normalizeIdentifier(
            item.value,
          ) === normalized ||
          normalizeIdentifier(
            item.label,
          ) === normalized,
      );

    if (selection) {
      return selection.label;
    }
  }

  return value;
}

/* =========================================================
   CONFIG LOOKUPS
========================================================= */

function findMarketConfig(
  value: string,
) {
  const normalized =
    normalizeIdentifier(value);

  if (!normalized) {
    return undefined;
  }

  return PredictionMarketOptions.find(
    item =>
      normalizeIdentifier(
        String(item.value),
      ) === normalized ||
      normalizeIdentifier(
        item.label,
      ) === normalized,
  );
}

function findSelectionConfig(
  selections: {
    label: string;
    value: string;
  }[],
  value: string,
) {
  const normalized =
    normalizeIdentifier(value);

  if (!normalized) {
    return undefined;
  }

  return selections.find(
    selection =>
      normalizeIdentifier(
        selection.value,
      ) === normalized ||
      normalizeIdentifier(
        selection.label,
      ) === normalized,
  );
}

/* =========================================================
   NORMALIZATION
========================================================= */

function normalizeIdentifier(
  value: string,
): string {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s\-\/+]+/g, '_')
    .replace(/[^A-Z0-9_]/g, '');
}

function formatIdentifier(
  value: string,
): string {
  return String(value ?? '')
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(
      /\b\w/g,
      char => char.toUpperCase(),
    );
}

/* =========================================================
   PLAYER MARKETS
========================================================= */

const DYNAMIC_PLAYER_MARKETS =
  new Set([
    'ANYTIME_GOALSCORER',
    'FIRST_GOALSCORER',
    'PLAYER_SHOTS',
    'PLAYER_SHOTS_ON_TARGET',
    'PLAYER_ASSISTS',
  ]);

function isDynamicPlayerMarket(
  value: string,
): boolean {
  return DYNAMIC_PLAYER_MARKETS.has(
    normalizeIdentifier(value),
  );
}

/* =========================================================
   FALLBACK
========================================================= */

function formatFallbackMarket(
  market: string,
  selection: string,
): string {
  return `${formatIdentifier(market)}: ${formatIdentifier(selection)}`;
}

/* =========================================================
   MARKET KEY
========================================================= */

function getMarketKey(
  market:
    | BackendMarket
    | string,
  index: number,
): string {
  if (typeof market === 'string') {
    return `${market}-${index}`;
  }

  return [
    market.market ?? '',
    market.selection ?? '',
    index,
  ].join('-');
}

/* =========================================================
   PLAN
========================================================= */

function normalizePlan(
  value: any,
): Plan {
  const normalized =
    String(value ?? 'free')
      .trim()
      .toLowerCase();

  if (normalized === 'vip') {
    return 'vip';
  }

  if (normalized === 'regular') {
    return 'regular';
  }

  return 'free';
}

/* =========================================================
   LOCK INFORMATION
========================================================= */

function getMarketLockInfo({
  userPlan,
  predictionPlan,
  released,
  releaseAt,
  accessState,
  accessMessage,
}: {
  userPlan: Plan;
  predictionPlan: Plan;
  released: boolean;
  releaseAt: number | null;
  accessState: string;
  accessMessage?: string | null;
}): MarketLockInfo {
  if (accessState === 'login_required') {
    return {
      title: 'Login required',
      description:
        'Login to view these markets.',
      icon: <Lock size={11} />,
      showReleaseDate: false,
    };
  }

  if (
    accessState ===
    'upgrade_required'
  ) {
    if (predictionPlan === 'vip') {
      return {
        title: 'VIP Required',
        description:
          'Upgrade to VIP to access these markets.',
        icon: <Crown size={11} />,
        showReleaseDate: false,
      };
    }

    if (predictionPlan === 'regular') {
      return {
        title: 'Regular Required',
        description:
          'Upgrade to Regular or VIP to access these markets.',
        icon: <Lock size={11} />,
        showReleaseDate: !released,
      };
    }
  }

  if (
    accessState === 'locked' &&
    !released
  ) {
    if (
      userPlan === 'regular' &&
      predictionPlan === 'regular'
    ) {
      return {
        title: 'Not Released to Regular',
        description:
          'Upgrade to VIP to see these markets earlier.',
        icon: <Crown size={11} />,
        showReleaseDate: true,
      };
    }

    if (
      userPlan === 'vip' ||
      (userPlan === 'free' &&
        predictionPlan === 'free')
    ) {
      return {
        title: 'Not Released Yet',
        description:
          accessMessage ??
          'These markets will be available closer to kickoff.',
        icon: <Clock3 size={11} />,
        showReleaseDate: Boolean(
          releaseAt,
        ),
      };
    }

    return {
      title: 'Not Released Yet',
      description:
        accessMessage ??
        'These markets will be available closer to kickoff.',
      icon: <Clock3 size={11} />,
      showReleaseDate: Boolean(
        releaseAt,
      ),
    };
  }

  const isVip =
    predictionPlan === 'vip';

  return {
    title: isVip
      ? 'VIP Required'
      : 'Markets Locked',
    description:
      accessMessage ??
      'Upgrade your subscription to access these markets.',
    icon: isVip
      ? <Crown size={11} />
      : <Lock size={11} />,
    showReleaseDate: false,
  };
}

/* =========================================================
   RELEASE DATE
========================================================= */

function formatReleaseDate(
  timestamp: number,
): string {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return 'later';
  }

  return date.toLocaleString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
  );
}