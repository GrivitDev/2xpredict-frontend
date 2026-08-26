import {
  BadgeCheck,
  Crown,
  Mail,
  Phone,
  Sparkles,
  UserRound,
} from 'lucide-react';


// ============================================================
// IDENTITY CARD
// ============================================================

export function IdentityCard({
  name,
  username,
  email,
  phoneNumber,
  plan,
}: {
  name?: string | null;
  username?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  plan?: string | null;
}) {
  const currentPlan = plan?.toLowerCase() || 'free';

  const membership =
    currentPlan === 'vip'
      ? {
          label: 'VIP',
          icon: Crown,
          iconClass: 'text-amber-500',
          badgeClass:
            'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400',
          avatarClass:
            'border-amber-500/25 bg-amber-500/10',
        }
      : currentPlan === 'regular'
        ? {
            label: 'Regular',
            icon: BadgeCheck,
            iconClass: 'text-primary',
            badgeClass:
              'border-primary/25 bg-primary/10 text-primary',
            avatarClass:
              'border-primary/25 bg-primary/10',
          }
        : {
            label: 'Free',
            icon: Sparkles,
            iconClass: 'text-muted-foreground',
            badgeClass:
              'border-border bg-muted/40 text-muted-foreground',
            avatarClass:
              'border-border/70 bg-muted/30',
          };

  const MembershipIcon = membership.icon;

  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-border/60
        bg-card
        shadow-sm
      "
    >
      {/* Profile */}

      <div
        className="
          flex
          items-center
          gap-3
          px-4
          py-3.5
        "
      >
        {/* Avatar */}

        <div
          className={`
            relative
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            ${membership.avatarClass}
          `}
        >
          <UserRound
            className="
              h-5
              w-5
              text-muted-foreground
            "
          />

          <div
            className={`
              absolute
              -right-1.5
              -top-1.5
              flex
              h-5
              w-5
              items-center
              justify-center
              rounded-full
              border
              bg-card
              shadow-sm
              ${membership.badgeClass}
            `}
          >
            <MembershipIcon
              className={`
                h-3
                w-3
                ${membership.iconClass}
              `}
            />
          </div>
        </div>

        {/* Identity */}

        <div className="min-w-0 flex-1">
          <div
            className="
              flex
              min-w-0
              items-center
              gap-2
            "
          >
            <h3
              className="
                min-w-0
                truncate
                text-sm
                font-semibold
                leading-tight
                tracking-tight
              "
            >
              {name || 'User'}
            </h3>

            <span
              className={`
                shrink-0
                rounded-full
                border
                px-2
                py-0.5
                text-[10px]
                font-semibold
                uppercase
                tracking-wide
                ${membership.badgeClass}
              `}
            >
              {membership.label}
            </span>
          </div>

          <p
            className="
              mt-1
              truncate
              text-xs
              text-muted-foreground
            "
          >
            {username ? `@${username}` : 'No username'}
          </p>
        </div>
      </div>

      {/* Contact */}

      <div
        className="
          grid
          grid-cols-2
          border-t
          border-border/50
          bg-muted/[0.025]
        "
      >
        <ContactItem
          icon={<Mail className="h-3.5 w-3.5" />}
          label="Email"
          value={email || 'Not provided'}
        />

        <ContactItem
          icon={<Phone className="h-3.5 w-3.5" />}
          label="Phone"
          value={phoneNumber || 'Not provided'}
          bordered
        />
      </div>
    </div>
  );
}


// ============================================================
// CONTACT ITEM
// ============================================================

function ContactItem({
  icon,
  label,
  value,
  bordered = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={`
        flex
        min-w-0
        items-center
        gap-2.5
        px-4
        py-3
        ${bordered ? 'border-l border-border/50' : ''}
      `}
    >
      <div
        className="
          flex
          h-7
          w-7
          shrink-0
          items-center
          justify-center
          rounded-lg
          border
          border-primary/10
          bg-primary/10
          text-primary
        "
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="
            text-[10px]
            font-medium
            uppercase
            tracking-wider
            text-muted-foreground
          "
        >
          {label}
        </p>

        <p
          className="
            mt-0.5
            truncate
            text-xs
            font-medium
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}