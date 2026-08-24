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

  const currentPlan =
    plan?.toLowerCase() || 'free';


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


  const MembershipIcon =
    membership.icon;


  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-border/60
        bg-card
        shadow-sm
      "
    >

      {/* ======================================================
          PREMIUM ACCENT
          ====================================================== */}

      <div
        className="
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-primary/70
          to-transparent
        "
      />


      {/* ======================================================
          PROFILE
          ====================================================== */}

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


          {/* Membership indicator */}

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

        <div
          className="
            min-w-0
            flex-1
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
            {username
              ? `@${username}`
              : 'No username'}
          </p>

        </div>

      </div>


      {/* ======================================================
          CONTACT INFORMATION
          ====================================================== */}

      <div
        className="
          grid
          grid-cols-2
          border-t
          border-border/50
          bg-muted/[0.025]
        "
      >

        {/* Email */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-2.5
            px-4
            py-3
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
              rounded-lg
              border
              border-primary/10
              bg-primary/10
              text-primary
            "
          >
            <Mail className="h-3.5 w-3.5" />
          </div>


          <div
            className="
              min-w-0
              flex-1
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
              Email
            </p>

            <p
              className="
                mt-0.5
                truncate
                text-xs
                font-medium
              "
            >
              {email || 'Not provided'}
            </p>

          </div>

        </div>


        {/* Phone */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-2.5
            border-l
            border-border/50
            px-4
            py-3
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
              rounded-lg
              border
              border-primary/10
              bg-primary/10
              text-primary
            "
          >
            <Phone className="h-3.5 w-3.5" />
          </div>


          <div
            className="
              min-w-0
              flex-1
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
              Phone
            </p>

            <p
              className="
                mt-0.5
                truncate
                text-xs
                font-medium
              "
            >
              {phoneNumber || 'Not provided'}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}