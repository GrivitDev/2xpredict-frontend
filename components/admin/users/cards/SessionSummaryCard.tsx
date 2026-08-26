'use client';

import {
  Activity,
  Clock,
  ShieldCheck,
  Users,
} from 'lucide-react';

type Props = {
  summary: {
    totalSessions: number;
    activeSessions: number;
    lastLogin: string | null;
    latestSessions: unknown[];
    currentSession: unknown | null;
  };
};

export default function SessionSummaryCard({
  summary,
}: Props) {
  const lastLogin = summary.lastLogin
    ? new Date(summary.lastLogin).toLocaleString()
    : 'Never';

  return (
    <section
      aria-labelledby="session-summary-title"
      className="
        overflow-hidden
        rounded-lg
        border
        border-border/60
        bg-card
      "
    >
      {/* Header */}

      <header
        className="
          flex
          items-center
          gap-2.5
          border-b
          border-border/60
          px-4
          py-3
        "
      >
        <div
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-md
            bg-blue-500/10
            text-blue-600
            dark:text-blue-400
          "
        >
          <Activity
            aria-hidden="true"
            className="h-4 w-4"
          />
        </div>

        <div>
          <h2
            id="session-summary-title"
            className="
              text-sm
              font-semibold
              tracking-tight
            "
          >
            Sessions
          </h2>

          <p className="text-[10px] text-muted-foreground">
            Login activity & security
          </p>
        </div>
      </header>

      <div className="p-3">
        {/* Session stats */}

        <div
          className="
            grid
            grid-cols-2
            gap-px
            overflow-hidden
            rounded-md
            border
            border-border/50
            bg-border/50
          "
        >
          <Stat
            icon={
              <Users
                aria-hidden="true"
                className="h-3.5 w-3.5"
              />
            }
            label="Total"
            value={summary.totalSessions}
          />

          <Stat
            icon={
              <ShieldCheck
                aria-hidden="true"
                className="h-3.5 w-3.5"
              />
            }
            label="Active"
            value={summary.activeSessions}
          />
        </div>

        {/* Last login */}

        <div
          className="
            mt-2
            rounded-md
            border
            border-border/50
            bg-background/40
            px-3
            py-2.5
          "
        >
          <div
            className="
              flex
              items-center
              gap-1.5
              text-[10px]
              text-muted-foreground
            "
          >
            <Clock
              aria-hidden="true"
              className="h-3.5 w-3.5"
            />

            Last Login
          </div>

          <p className="mt-0.5 text-xs font-semibold">
            {lastLogin}
          </p>
        </div>

        {/* Security status */}

        <div
          role="status"
          className="
            mt-2
            flex
            items-center
            gap-1.5
            rounded-md
            bg-blue-500/10
            px-2.5
            py-2
            text-[10px]
            font-medium
            text-blue-600
            dark:text-blue-400
          "
        >
          <ShieldCheck
            aria-hidden="true"
            className="h-3.5 w-3.5"
          />

          Account activity monitored
        </div>
      </div>
    </section>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-card px-3 py-2.5">
      <div
        className="
          flex
          items-center
          gap-1.5
          text-[10px]
          text-muted-foreground
        "
      >
        {icon}

        <span>{label}</span>
      </div>

      <p className="mt-0.5 text-sm font-bold">
        {value}
      </p>
    </div>
  );
}