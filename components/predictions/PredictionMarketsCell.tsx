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


// ============================================================
// TYPES
// ============================================================

interface Props {
  prediction: any;

  onSubscriptionRequired?: () => void;
}

interface BackendMarket {
  market?: string;
  selection?: string;

  [key: string]: any;
}


// ============================================================
// COMPONENT
// ============================================================

export default function PredictionMarketsCell({
  prediction,
  onSubscriptionRequired,
}: Props) {

  const [
    expanded,
    setExpanded,
  ] = useState(false);


  // ==========================================================
  // ACCESS
  // ==========================================================

  const access =
    prediction?.access ?? {};


  const userPlan =
    normalizePlan(
      access.plan ??
      prediction?.userPlan ??
      'free',
    );


  const predictionPlan =
    normalizePlan(
      prediction?.accessType ??
      'free',
    );


  const canView =
    access.allowed === true;


  const released =
    access.released === true;


  const releaseAt =
    access.releaseAt ??
    null;


  const accessState =
    access.state ??
    '';


  const accessMessage =
    access.message ??
    null;


  // ==========================================================
  // MARKETS
  // ==========================================================
  //
  // IMPORTANT:
  //
  // We DO NOT decide which markets a user gets here.
  //
  // The backend already controls the markets returned to
  // the frontend.
  //
  // Therefore:
  //
  // Free    -> normally receives no markets
  // Regular -> backend decides which markets are returned
  // VIP     -> backend decides / returns all accessible markets
  //
  // The frontend simply renders what it receives.
  //
  // ==========================================================

  const markets: BackendMarket[] =
    Array.isArray(
      prediction?.markets,
    )
      ? prediction.markets
      : [];


  // ==========================================================
  // PREDICTION-LEVEL ACCESS LOCK
  // ==========================================================
  //
  // This is different from the Regular market limitation.
  //
  // If the entire prediction is locked, show the normal
  // subscription/access message.
  //
  // ==========================================================

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
        onClick={
          onSubscriptionRequired
        }
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

        <div
          className="
            flex
            items-center
            gap-2
          "
        >

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


          <div
            className="
              min-w-0
            "
          >

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
            {formatReleaseDate(
              releaseAt,
            )}
          </p>

        )}

      </button>
    );
  }


  // ==========================================================
  // FREE USER
  // ==========================================================
  //
  // Free users do not get markets.
  //
  // This remains explicit on the frontend even if the backend
  // normally returns an empty markets array for them.
  //
  // ==========================================================

  if (userPlan === 'free') {

    return (
      <button
        type="button"
        onClick={
          onSubscriptionRequired
        }
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

        <div
          className="
            flex
            items-center
            gap-2
          "
        >

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


          <div
            className="
              min-w-0
            "
          >

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


  // ==========================================================
  // NO MARKETS
  // ==========================================================
  //
  // This can happen for example when the backend has no
  // markets configured for the prediction.
  //
  // ==========================================================

  if (markets.length === 0) {

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


  // ==========================================================
  // VIP
  // ==========================================================
  //
  // VIP gets whatever markets the backend returns.
  //
  // We only control presentation here.
  //
  // If there are more than 3, VIP can expand them.
  //
  // ==========================================================

  const isVip =
    userPlan === 'vip';


  const canExpand =
    isVip &&
    markets.length > 3;


  const visibleMarkets =
    canExpand && expanded
      ? markets
      : markets.slice(
          0,
          3,
        );


  // ==========================================================
  // REGULAR
  // ==========================================================
  //
  // IMPORTANT:
  //
  // We DO NOT:
  //
  // - slice to 3
  // - choose the first 3
  // - inspect market types
  // - determine which markets are allowed
  //
  // The backend has already selected the markets.
  //
  // Therefore we simply render the entire markets array
  // returned by the backend.
  //
  // The Regular user still gets the VIP upgrade message
  // underneath.
  //
  // ==========================================================

  const isRegular =
    userPlan === 'regular';


  const marketsToRender =
    isRegular
      ? markets
      : visibleMarkets;


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className="
        space-y-2
      "
    >

      {/* ====================================================
          MARKETS
      ==================================================== */}

      <div
        className="
          space-y-1.5
        "
      >

        {marketsToRender.map(
          (
            market,
            index,
          ) => {

            const display =
              resolveMarketDisplay(
                market,
              );


            return (
              <div
                key={
                  getMarketKey(
                    market,
                    index,
                  )
                }
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
                  {display}
                </span>

              </div>
            );
          },
        )}

      </div>


      {/* ====================================================
          REGULAR → VIP
      ==================================================== */}
      {isRegular && (

        <button
          type="button"
          onClick={
            onSubscriptionRequired
          }
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


      {/* ====================================================
          VIP EXPAND / COLLAPSE
      ==================================================== */}

      {canExpand && (

        <button
          type="button"
          onClick={() =>
            setExpanded(
              current =>
                !current,
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
              <ChevronUp
                size={13}
              />

              Show Less
            </>
          ) : (
            <>
              <ChevronDown
                size={13}
              />

              +
              {markets.length - 3}
              {' '}
              More
            </>
          )}

        </button>

      )}

    </div>
  );
}


// ============================================================
// MARKET DISPLAY RESOLVER
// ============================================================

function resolveMarketDisplay(
  market:
    | BackendMarket
    | string,
): string {

  // ==========================================================
  // STRING
  // ==========================================================

  if (
    typeof market ===
    'string'
  ) {

    return resolveStringMarket(
      market,
    );
  }


  // ==========================================================
  // VALUES
  // ==========================================================

  const marketValue =
    String(
      market.market ??
      '',
    ).trim();


  const selectionValue =
    String(
      market.selection ??
      '',
    ).trim();


  if (
    !marketValue &&
    !selectionValue
  ) {

    return 'Unknown market';
  }


  // ==========================================================
  // MARKET CONFIG
  // ==========================================================

  const marketConfig =
    findMarketConfig(
      marketValue,
    );


  // ==========================================================
  // UNKNOWN MARKET
  // ==========================================================

  if (!marketConfig) {

    if (
      marketValue &&
      selectionValue
    ) {

      return formatFallbackMarket(
        marketValue,
        selectionValue,
      );
    }


    return (
      selectionValue ||
      marketValue ||
      'Unknown market'
    );
  }


  const marketLabel =
    marketConfig.label;


  // ==========================================================
  // DYNAMIC PLAYER MARKETS
  // ==========================================================

  if (
    isDynamicPlayerMarket(
      String(
        marketConfig.value,
      ),
    )
  ) {

    if (selectionValue) {

      return `${marketLabel}: ${selectionValue}`;
    }

    return marketLabel;
  }


  // ==========================================================
  // NORMAL SELECTION
  // ==========================================================

  const selectionConfig =
    findSelectionConfig(
      marketConfig.selections,
      selectionValue,
    );


  if (selectionConfig) {

    return `${marketLabel}: ${selectionConfig.label}`;
  }


  // ==========================================================
  // UNKNOWN SELECTION
  // ==========================================================

  if (selectionValue) {

    return `${marketLabel}: ${selectionValue}`;
  }


  // ==========================================================
  // MARKET ONLY
  // ==========================================================

  return marketLabel;
}


// ============================================================
// STRING MARKET RESOLVER
// ============================================================

function resolveStringMarket(
  value: string,
): string {

  const normalized =
    normalizeIdentifier(
      value,
    );


  // ==========================================================
  // DIRECT MARKET
  // ==========================================================

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


  // ==========================================================
  // DIRECT SELECTION
  // ==========================================================

  for (
    const marketOption
    of PredictionMarketOptions
  ) {

    const selection =
      marketOption.selections.find(
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


  // ==========================================================
  // FALLBACK
  // ==========================================================

  return value;
}


// ============================================================
// FIND MARKET CONFIG
// ============================================================

function findMarketConfig(
  value: string,
) {

  const normalized =
    normalizeIdentifier(
      value,
    );


  if (!normalized) {

    return undefined;
  }


  return PredictionMarketOptions.find(
    item => {

      const enumValue =
        normalizeIdentifier(
          String(item.value),
        );


      const enumLabel =
        normalizeIdentifier(
          item.label,
        );


      return (
        enumValue ===
          normalized ||

        enumLabel ===
          normalized
      );
    },
  );
}


// ============================================================
// FIND SELECTION CONFIG
// ============================================================

function findSelectionConfig(
  selections: {
    label: string;
    value: string;
  }[],
  value: string,
) {

  const normalized =
    normalizeIdentifier(
      value,
    );


  if (!normalized) {

    return undefined;
  }


  return selections.find(
    selection => {

      const enumValue =
        normalizeIdentifier(
          selection.value,
        );


      const enumLabel =
        normalizeIdentifier(
          selection.label,
        );


      return (
        enumValue ===
          normalized ||

        enumLabel ===
          normalized
      );
    },
  );
}


// ============================================================
// NORMALIZE IDENTIFIER
// ============================================================

function normalizeIdentifier(
  value: string,
): string {

  return String(
    value ?? '',
  )
    .trim()
    .toUpperCase()
    .replace(
      /[\s\-\/+]+/g,
      '_',
    )
    .replace(
      /[^A-Z0-9_]/g,
      '',
    );
}


// ============================================================
// DYNAMIC PLAYER MARKET
// ============================================================

function isDynamicPlayerMarket(
  marketValue: string,
): boolean {

  const normalized =
    normalizeIdentifier(
      marketValue,
    );


  return (
    normalized ===
      'ANYTIME_GOALSCORER' ||

    normalized ===
      'FIRST_GOALSCORER' ||

    normalized ===
      'PLAYER_SHOTS' ||

    normalized ===
      'PLAYER_SHOTS_ON_TARGET' ||

    normalized ===
      'PLAYER_ASSISTS'
  );
}


// ============================================================
// FALLBACK FORMAT
// ============================================================

function formatFallbackMarket(
  market: string,
  selection: string,
): string {

  const marketLabel =
    formatIdentifier(
      market,
    );


  const selectionLabel =
    formatIdentifier(
      selection,
    );


  return `${marketLabel}: ${selectionLabel}`;
}


// ============================================================
// FORMAT UNKNOWN IDENTIFIER
// ============================================================

function formatIdentifier(
  value: string,
): string {

  return String(
    value ?? '',
  )
    .replace(
      /[_\-]+/g,
      ' ',
    )
    .replace(
      /\s+/g,
      ' ',
    )
    .trim()
    .replace(
      /\b\w/g,
      character =>
        character.toUpperCase(),
    );
}


// ============================================================
// MARKET KEY
// ============================================================

function getMarketKey(
  market:
    | BackendMarket
    | string,
  index: number,
): string {

  if (
    typeof market ===
    'string'
  ) {

    return `${market}-${index}`;
  }


  return [
    market.market ?? '',
    market.selection ?? '',
    index,
  ].join('-');
}


// ============================================================
// PLAN NORMALIZER
// ============================================================

function normalizePlan(
  value: any,
): 'free' | 'regular' | 'vip' {

  const normalized =
    String(
      value ?? 'free',
    )
      .trim()
      .toLowerCase();


  if (
    normalized ===
    'vip'
  ) {

    return 'vip';
  }


  if (
    normalized ===
    'regular'
  ) {

    return 'regular';
  }


  return 'free';
}


// ============================================================
// MARKET LOCK INFO
// ============================================================

function getMarketLockInfo({
  userPlan,
  predictionPlan,
  released,
  releaseAt,
  accessState,
  accessMessage,
}: {
  userPlan:
    | 'free'
    | 'regular'
    | 'vip';

  predictionPlan:
    | 'free'
    | 'regular'
    | 'vip';

  released: boolean;

  releaseAt:
    | number
    | null;

  accessState: string;

  accessMessage?:
    | string
    | null;
}) {

  // ==========================================================
  // LOGIN
  // ==========================================================

  if (
    accessState ===
    'login_required'
  ) {

    return {
      title:
        'Login required',

      description:
        'Login to view these markets.',

      icon: (
        <Lock size={11} />
      ),

      showReleaseDate:
        false,
    };
  }


  // ==========================================================
  // UPGRADE REQUIRED
  // ==========================================================

  if (
    accessState ===
    'upgrade_required'
  ) {

    if (
      predictionPlan ===
      'vip'
    ) {

      return {
        title:
          'VIP Required',

        description:
          'Upgrade to VIP to access these markets.',

        icon: (
          <Crown size={11} />
        ),

        showReleaseDate:
          false,
      };
    }


    if (
      predictionPlan ===
      'regular'
    ) {

      return {
        title:
          'Regular Required',

        description:
          'Upgrade to Regular or VIP to access these markets.',

        icon: (
          <Lock size={11} />
        ),

        showReleaseDate:
          !released,
      };
    }
  }


  // ==========================================================
  // RELEASE WINDOW
  // ==========================================================

  if (
    accessState ===
      'locked' &&
    !released
  ) {

    // --------------------------------------------------------
    // REGULAR USER
    // --------------------------------------------------------

    if (
      userPlan ===
        'regular' &&
      predictionPlan ===
        'regular'
    ) {

      return {
        title:
          'Not Released to Regular',

        description:
          'Upgrade to VIP to see these markets earlier.',

        icon: (
          <Crown size={11} />
        ),

        showReleaseDate:
          true,
      };
    }


    // --------------------------------------------------------
    // VIP
    // --------------------------------------------------------

    if (
      userPlan ===
      'vip'
    ) {

      return {
        title:
          'Not Released Yet',

        description:
          accessMessage ??
          'These markets will be available closer to kickoff.',

        icon: (
          <Clock3 size={11} />
        ),

        showReleaseDate:
          Boolean(
            releaseAt,
          ),
      };
    }


    // --------------------------------------------------------
    // FREE
    // --------------------------------------------------------

    if (
      userPlan ===
        'free' &&
      predictionPlan ===
        'free'
    ) {

      return {
        title:
          'Not Released Yet',

        description:
          accessMessage ??
          'These markets will be available closer to kickoff.',

        icon: (
          <Clock3 size={11} />
        ),

        showReleaseDate:
          Boolean(
            releaseAt,
          ),
      };
    }


    // --------------------------------------------------------
    // GENERIC
    // --------------------------------------------------------

    return {
      title:
        'Not Released Yet',

      description:
        accessMessage ??
        'These markets will be available closer to kickoff.',

      icon: (
        <Clock3 size={11} />
      ),

      showReleaseDate:
        Boolean(
          releaseAt,
        ),
    };
  }


  // ==========================================================
  // FALLBACK
  // ==========================================================

  return {
    title:
      predictionPlan ===
      'vip'
        ? 'VIP Required'
        : 'Markets Locked',

    description:
      accessMessage ??
      'Upgrade your subscription to access these markets.',

    icon:
      predictionPlan ===
      'vip'
        ? (
          <Crown size={11} />
        )
        : (
          <Lock size={11} />
        ),

    showReleaseDate:
      false,
  };
}


// ============================================================
// RELEASE DATE
// ============================================================

function formatReleaseDate(
  timestamp: number,
): string {

  const date =
    new Date(
      timestamp,
    );


  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {

    return 'later';
  }


  return date.toLocaleString(
    'en-GB',
    {
      day:
        '2-digit',

      month:
        'short',

      hour:
        '2-digit',

      minute:
        '2-digit',

      hour12:
        false,
    },
  );
}