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
        px-4
        py-8
        sm:px-6
        sm:py-12
        lg:px-8
      "
    >
      {/* Hero */}

      <div
        className="
          mx-auto
          max-w-3xl
          text-center
        "
      >
        <div
          className="
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-primary/20
            bg-primary/10
            px-4
            py-2
            text-xs
            font-semibold
            text-primary
          "
        >
          <ShieldAlert
            className="size-4"
            aria-hidden="true"
          />

          Community Guidelines
        </div>

        <h2
          className="
            mt-6
            text-3xl
            font-bold
            tracking-tight
            text-foreground
            sm:text-4xl
          "
        >
          Respect the game.
          <span
            className="
              mt-2
              block
              text-primary
            "
          >
            Respect one another.
          </span>
        </h2>

        <p
          className="
            mx-auto
            mt-5
            max-w-2xl
            text-sm
            leading-7
            text-muted-foreground
            sm:text-base
          "
        >
          The PredictPro community is built for passionate football fans.
          Keep conversations friendly, insightful, and enjoyable for everyone.
        </p>
      </div>

      {/* Cards */}

      <div
        className="
          mx-auto
          mt-10
          grid
          max-w-6xl
          gap-6
          lg:grid-cols-2
        "
      >
        {/* Allowed */}

        <section
          className="
            rounded-3xl
            border
            border-border
            bg-card
            p-6
            shadow-sm
            transition-all
            duration-300
            hover:shadow-lg
          "
        >
          <div
            className="
              mb-6
              flex
              items-center
              gap-4
            "
          >
            <div
              className="
                flex
                size-12
                items-center
                justify-center
                rounded-2xl
                bg-green-500/10
                text-green-600
                dark:text-green-400
              "
            >
              <CheckCircle2 className="size-6" />
            </div>

            <div>
              <h3
                className="
                  text-lg
                  font-semibold
                "
              >
                What you can share
              </h3>

              <p
                className="
                  text-sm
                  text-muted-foreground
                "
              >
                Positive football conversations
              </p>
            </div>
          </div>

          <div
            className="
              space-y-4
            "
          >
            {allowedRules.map((rule) => {
              const Icon = rule.icon;

              return (
                <div
                  key={rule.title}
                  className="
                    flex
                    gap-4
                    rounded-2xl
                    border
                    border-border
                    bg-muted/30
                    p-4
                    transition-all
                    duration-300
                    hover:border-primary/30
                    hover:bg-primary/5
                  "
                >
                  <div
                    className="
                      flex
                      size-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-primary/10
                    "
                  >
                    <Icon
                      className="
                        size-5
                        text-primary
                      "
                    />
                  </div>

                  <div>
                    <h4
                      className="
                        text-sm
                        font-semibold
                        text-foreground
                      "
                    >
                      {rule.title}
                    </h4>

                    <p
                      className="
                        mt-1
                        text-sm
                        leading-6
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

        {/* Blocked */}

        <section
          className="
            rounded-3xl
            border
            border-border
            bg-card
            p-6
            shadow-sm
            transition-all
            duration-300
            hover:shadow-lg
          "
        >
          <div
            className="
              mb-6
              flex
              items-center
              gap-4
            "
          >
            <div
              className="
                flex
                size-12
                items-center
                justify-center
                rounded-2xl
                bg-destructive/10
                text-destructive
              "
            >
              <XCircle className="size-6" />
            </div>

            <div>
              <h3
                className="
                  text-lg
                  font-semibold
                "
              >
                What we don't allow
              </h3>

              <p
                className="
                  text-sm
                  text-muted-foreground
                "
              >
                Help keep the community safe
              </p>
            </div>
          </div>

          <div
            className="
              space-y-4
            "
          >
            {blockedRules.map((rule) => (
              <div
                key={rule.title}
                className="
                  rounded-2xl
                  border
                  border-border
                  bg-muted/30
                  p-4
                  transition-all
                  duration-300
                  hover:border-destructive/30
                  hover:bg-destructive/5
                "
              >
                <h4
                  className="
                    text-sm
                    font-semibold
                    text-foreground
                  "
                >
                  {rule.title}
                </h4>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
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

      {/* Footer */}

      <div
        className="
          mx-auto
          mt-10
          max-w-3xl
          rounded-2xl
          border
          border-primary/20
          bg-primary/5
          p-5
          text-center
        "
      >
        <p
          className="
            text-sm
            leading-6
            text-muted-foreground
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