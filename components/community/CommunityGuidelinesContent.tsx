'use client';

import {
  CheckCircle2,
  MessageCircle,
  ShieldAlert,
  Target,
  Trophy,
  Users,
  XCircle,
} from 'lucide-react';

const allowedRules = [
  {
    icon: MessageCircle,
    title: 'Match Discussions',
    description:
      'Share thoughts about upcoming matches, fixtures, tournaments, and football events.',
  },
  {
    icon: Target,
    title: 'Prediction Opinions',
    description:
      'Explain your predictions, strategies, and football insights respectfully.',
  },
  {
    icon: Trophy,
    title: 'Team Analysis',
    description:
      'Discuss tactics, player performances, transfers, and club form.',
  },
  {
    icon: Users,
    title: 'Football Experiences',
    description:
      'Share stories, memorable moments, and experiences with fellow supporters.',
  },
];

const blockedRules = [
  {
    title: 'Insults & Harassment',
    description:
      'Respect every member. Personal attacks and abusive language are not allowed.',
  },
  {
    title: 'Hate Speech',
    description:
      'Discrimination, racism, or hateful content will be removed immediately.',
  },
  {
    title: 'Spam & Self Promotion',
    description:
      'Avoid repetitive posts, unrelated advertising, or excessive promotion.',
  },
  {
    title: 'Betting Scams',
    description:
      'Never share fake betting tips, fraudulent offers, or misleading promotions.',
  },
];

export default function CommunityGuidelinesContent() {
  return (
    <section
      className="
        px-3
        py-5
        sm:px-4
        sm:py-7
        lg:px-6
      "
    >
      {/* HERO */}

      <div
        className="
          mx-auto
          max-w-2xl
          text-center
        "
      >
        <div
          className="
            inline-flex
            items-center
            gap-1.5
            rounded-full
            border
            border-primary/20
            bg-primary/10
            px-2.5
            py-1
            text-[11px]
            font-semibold
            text-primary
          "
        >
          <ShieldAlert
            className="size-3.5"
            aria-hidden="true"
          />

          Community Guidelines
        </div>

        <h2
          className="
            mt-3
            text-2xl
            font-bold
            leading-tight
            tracking-tight
            text-foreground
            sm:text-3xl
          "
        >
          Respect the game.
          <span className="ml-1 text-primary sm:ml-2">
            Respect one another.
          </span>
        </h2>

        <p
          className="
            mx-auto
            mt-2.5
            max-w-xl
            text-xs
            leading-5
            text-muted-foreground
            sm:text-sm
          "
        >
          The 2xpredict community is built for passionate football fans.
          Keep conversations friendly, insightful, and enjoyable for everyone.
        </p>
      </div>

      {/* CARDS */}

      <div
        className="
          mx-auto
          mt-5
          grid
          max-w-5xl
          gap-3
          lg:grid-cols-2
        "
      >
        {/* ALLOWED */}

        <section
          className="
            rounded-xl
            border
            border-border
            bg-card
            p-3
            shadow-sm
            sm:p-4
          "
        >
          <div
            className="
              mb-3
              flex
              items-center
              gap-2.5
            "
          >
            <div
              className="
                flex
                size-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-green-500/10
                text-green-600
                dark:text-green-400
              "
            >
              <CheckCircle2 className="size-4" />
            </div>

            <div className="min-w-0">
              <h3
                className="
                  text-sm
                  font-semibold
                  leading-tight
                  text-foreground
                "
              >
                What you can share
              </h3>

              <p
                className="
                  mt-0.5
                  text-[11px]
                  leading-tight
                  text-muted-foreground
                "
              >
                Positive football conversations
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            {allowedRules.map((rule) => {
              const Icon = rule.icon;

              return (
                <div
                  key={rule.title}
                  className="
                    flex
                    gap-2.5
                    rounded-lg
                    border
                    border-border/70
                    bg-muted/20
                    p-2.5
                    transition-colors
                    hover:border-primary/20
                    hover:bg-primary/5
                  "
                >
                  <div
                    className="
                      flex
                      size-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-md
                      bg-primary/10
                    "
                  >
                    <Icon
                      className="
                        size-3.5
                        text-primary
                      "
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0">
                    <h4
                      className="
                        text-xs
                        font-semibold
                        leading-tight
                        text-foreground
                      "
                    >
                      {rule.title}
                    </h4>

                    <p
                      className="
                        mt-1
                        text-[11px]
                        leading-[1.35rem]
                        text-muted-foreground
                      "
                    >
                      {rule.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* BLOCKED */}

        <section
          className="
            rounded-xl
            border
            border-border
            bg-card
            p-3
            shadow-sm
            sm:p-4
          "
        >
          <div
            className="
              mb-3
              flex
              items-center
              gap-2.5
            "
          >
            <div
              className="
                flex
                size-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-destructive/10
                text-destructive
              "
            >
              <XCircle className="size-4" />
            </div>

            <div className="min-w-0">
              <h3
                className="
                  text-sm
                  font-semibold
                  leading-tight
                  text-foreground
                "
              >
                What we don't allow
              </h3>

              <p
                className="
                  mt-0.5
                  text-[11px]
                  leading-tight
                  text-muted-foreground
                "
              >
                Help keep the community safe
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            {blockedRules.map((rule) => (
              <div
                key={rule.title}
                className="
                  rounded-lg
                  border
                  border-border/70
                  bg-muted/20
                  p-2.5
                  transition-colors
                  hover:border-destructive/20
                  hover:bg-destructive/5
                "
              >
                <h4
                  className="
                    text-xs
                    font-semibold
                    leading-tight
                    text-foreground
                  "
                >
                  {rule.title}
                </h4>

                <p
                  className="
                    mt-1
                    text-[11px]
                    leading-[1.35rem]
                    text-muted-foreground
                  "
                >
                  {rule.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* FOOTER */}

      <div
        className="
          mx-auto
          mt-4
          max-w-2xl
          rounded-lg
          border
          border-primary/20
          bg-primary/5
          px-3
          py-2.5
          text-center
        "
      >
        <p
          className="
            text-[11px]
            leading-5
            text-muted-foreground
            sm:text-xs
          "
        >
          By participating in the community, you agree to follow these
          guidelines. Posts or comments that violate them may be removed,
          and repeated violations can result in account restrictions.
        </p>
      </div>
    </section>
  );
}