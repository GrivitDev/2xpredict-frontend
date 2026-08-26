'use client';

import {
  CalendarDays,
  Crown,
  ShoppingBag,
  Sparkles,
  UserPlus,
} from 'lucide-react';

import { useMyReferrals } from '@/hooks/use-referrals';


// ============================================================
// TYPES
// ============================================================

type ReferralUser = {
  username?: string | null;
  email?: string | null;
};

type Referral = {
  _id: string;
  createdAt: string;
  referredUserId?: ReferralUser | null;
  registered?: boolean;
  regularSubscription?: boolean;
  vipSubscription?: boolean;
  predictionPurchased?: boolean;
};


// ============================================================
// COMPONENT
// ============================================================

export function ReferralActivity() {
  const {
    data: referrals = [],
    isLoading,
    isError,
  } = useMyReferrals();

  if (isLoading) {
    return <ReferralState message="Loading..." />;
  }

  if (isError) {
    return (
      <ReferralState
        icon={UserPlus}
        title="Unable to load referrals"
        description="Please try again later."
      />
    );
  }

  if (!referrals.length) {
    return (
      <ReferralState
        icon={UserPlus}
        title="No Referrals Yet"
        description="Share your referral link to invite users."
      />
    );
  }

  return (
    <div className="overflow-hidden">
      <div
        className="
          flex
          items-center
          gap-1.5
          border-b
          border-border/40
          px-2.5
          py-2
        "
      >
        <div
          className="
            flex
            h-6
            w-6
            items-center
            justify-center
            rounded-md
            bg-primary/10
            text-primary
          "
        >
          <UserPlus className="h-3 w-3" />
        </div>

        <span className="text-xs font-semibold">
          Referral Network
        </span>
      </div>

      <div className="divide-y divide-border/30">
        {referrals.map((referral: Referral) => (
          <ReferralItem
            key={referral._id}
            referral={referral}
          />
        ))}
      </div>
    </div>
  );
}


// ============================================================
// REFERRAL ITEM
// ============================================================

function ReferralItem({
  referral,
}: {
  referral: Referral;
}) {
  const user = referral.referredUserId;

  const username =
    user?.username || 'Unknown User';

  const email =
    user?.email || 'No email';

  const initials =
    username
      .slice(0, 2)
      .toUpperCase();

  const joinedDate = formatDate(
    referral.createdAt,
  );

  return (
    <div
      className="
        px-2.5
        py-2
        transition-colors
        hover:bg-muted/10
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          gap-2
        "
      >
        <div
          className="
            flex
            min-w-0
            items-center
            gap-2
          "
        >
          <div
            className="
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-md
              bg-primary/10
              text-[10px]
              font-bold
              text-primary
            "
          >
            {initials}
          </div>

          <div className="min-w-0">
            <p
              className="
                truncate
                text-[11px]
                font-semibold
              "
            >
              {username}
            </p>

            <div
              className="
                mt-0.5
                flex
                min-w-0
                items-center
                gap-1
                text-[9px]
                text-muted-foreground
              "
            >
              <span className="truncate">
                {email}
              </span>

              <span className="shrink-0">
                ·
              </span>

              <CalendarDays
                className="
                  h-2.5
                  w-2.5
                  shrink-0
                "
              />

              <span className="shrink-0">
                {joinedDate}
              </span>
            </div>
          </div>
        </div>

        <ReferralStatuses referral={referral} />
      </div>
    </div>
  );
}


// ============================================================
// REFERRAL STATUSES
// ============================================================

function ReferralStatuses({
  referral,
}: {
  referral: Referral;
}) {
  const hasVip =
    Boolean(referral.vipSubscription);

  return (
    <div
      className="
        flex
        shrink-0
        items-center
        justify-end
        gap-1
      "
    >
      {referral.registered && (
        <Status label="Registered" />
      )}

      {referral.regularSubscription && (
        <Status label="Regular" />
      )}

      {hasVip && (
        <Status
          label="VIP"
          vip
          icon={Crown}
        />
      )}

      {referral.predictionPurchased && (
        <Status
          label="Purchased"
          icon={ShoppingBag}
        />
      )}

      {hasVip && (
        <Sparkles
          className="
            ml-0.5
            h-3
            w-3
            text-primary
          "
        />
      )}
    </div>
  );
}


// ============================================================
// STATUS
// ============================================================

function Status({
  label,
  vip = false,
  icon: Icon,
}: {
  label: string;
  vip?: boolean;
  icon?: typeof Crown;
}) {
  return (
    <span
      className={`
        inline-flex
        h-5
        items-center
        gap-0.5
        rounded-full
        px-1.5
        text-[8px]
        font-medium
        ${
          vip
            ? `
              bg-amber-500/10
              text-amber-600
              dark:text-amber-400
            `
            : `
              bg-muted/50
              text-muted-foreground
            `
        }
      `}
    >
      {Icon && (
        <Icon className="h-2.5 w-2.5" />
      )}

      {label}
    </span>
  );
}


// ============================================================
// STATE
// ============================================================

function ReferralState({
  icon: Icon = UserPlus,
  title,
  description,
  message,
}: {
  icon?: typeof UserPlus;
  title?: string;
  description?: string;
  message?: string;
}) {
  if (message) {
    return (
      <div
        className="
          flex
          min-h-16
          items-center
          justify-center
          border-y
          border-border/40
          text-[10px]
          text-muted-foreground
        "
      >
        {message}
      </div>
    );
  }

  return (
    <div
      className="
        flex
        min-h-20
        flex-col
        items-center
        justify-center
        border-y
        border-border/40
        px-3
        py-5
        text-center
      "
    >
      <Icon className="h-4 w-4 text-muted-foreground" />

      <p className="mt-1 text-xs font-semibold">
        {title}
      </p>

      <p
        className="
          mt-0.5
          text-[10px]
          text-muted-foreground
        "
      >
        {description}
      </p>
    </div>
  );
}


// ============================================================
// HELPERS
// ============================================================

function formatDate(
  date?: string,
) {
  if (!date) {
    return '—';
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '—';
  }

  return parsedDate.toLocaleDateString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
    },
  );
}