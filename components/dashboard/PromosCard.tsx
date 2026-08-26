import {
  Gift,
  Clock,
  Sparkles,
  Wallet,
  Crown,
} from 'lucide-react';

import type {
  PromoItem,
} from './dashboard.types';

import {
  daysLeft,
  fmtDate,
} from './dashboard.utils';


// ============================================================
// COMPONENT
// ============================================================

export function PromosCard({
  items = [],
}: {
  items?: PromoItem[];
}) {
  if (!items.length) {
    return (
      <div
        className="
          flex
          min-h-[96px]
          items-center
          justify-center
          rounded-2xl
          border
          border-dashed
          border-border/60
          bg-muted/20
          px-4
          py-5
          text-center
        "
      >
        <div className="space-y-1">
          <Gift
            className="
              mx-auto
              h-5
              w-5
              text-muted-foreground/60
            "
          />

          <p
            className="
              text-xs
              font-medium
              text-muted-foreground
            "
          >
            No active promos right now.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {items.slice(0, 3).map((item, index) => {
        const left = daysLeft(item.endDate);

        const isCash =
          item.rewardType === 'cash';

        const reward = isCash
          ? `₦${
              item.rewardAmount?.toLocaleString(
                'en-NG',
              ) || 0
            }`
          : item.rewardPlan || 'Subscription';

        return (
          <div
            key={
              item._id ||
              `${item.name}-${index}`
            }
            className="
              overflow-hidden
              rounded-2xl
              border
              border-border/60
              bg-card
              shadow-sm
            "
          >
            <div
              className="
                flex
                min-w-0
                items-start
                gap-3
                px-4
                py-3.5
              "
            >
              {/* Icon */}

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
                  border-primary/20
                  bg-primary/10
                  text-primary
                  shadow-sm
                "
              >
                <Gift className="h-5 w-5" />
              </div>

              {/* Content */}

              <div className="min-w-0 flex-1">
                <div
                  className="
                    flex
                    min-w-0
                    items-center
                    gap-1.5
                  "
                >
                  <p
                    className="
                      min-w-0
                      truncate
                      text-sm
                      font-semibold
                      tracking-tight
                    "
                  >
                    {item.name || 'Promotion'}
                  </p>

                  <Sparkles
                    className="
                      h-3.5
                      w-3.5
                      shrink-0
                      text-primary
                    "
                  />
                </div>

                <p
                  className="
                    mt-1
                    line-clamp-1
                    text-xs
                    leading-relaxed
                    text-muted-foreground
                  "
                >
                  {item.description ||
                    'Available promotion'}
                </p>

                <div
                  className="
                    mt-2.5
                    flex
                    flex-wrap
                    items-center
                    gap-2
                  "
                >
                  {/* Reward */}

                  <div
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-1.5
                      rounded-lg
                      border
                      border-primary/15
                      bg-primary/5
                      px-2
                      py-1
                    "
                  >
                    {isCash ? (
                      <Wallet
                        className="
                          h-3.5
                          w-3.5
                          shrink-0
                          text-emerald-500
                        "
                      />
                    ) : (
                      <Crown
                        className="
                          h-3.5
                          w-3.5
                          shrink-0
                          text-amber-500
                        "
                      />
                    )}

                    <span
                      className="
                        truncate
                        text-xs
                        font-semibold
                      "
                    >
                      {reward}
                    </span>
                  </div>

                  {/* Expiry */}

                  <div
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-1.5
                      text-xs
                      text-muted-foreground
                    "
                  >
                    <Clock
                      className="
                        h-3.5
                        w-3.5
                        shrink-0
                      "
                    />

                    <span className="truncate">
                      {left === null
                        ? fmtDate(item.endDate)
                        : `${left} day${
                            left === 1
                              ? ''
                              : 's'
                          } left`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop Reward */}

              <div
                className="
                  hidden
                  shrink-0
                  text-right
                  sm:block
                "
              >
                <p
                  className="
                    text-[10px]
                    font-medium
                    uppercase
                    tracking-wider
                    text-muted-foreground
                  "
                >
                  Reward
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    font-semibold
                    text-primary
                  "
                >
                  {reward}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}