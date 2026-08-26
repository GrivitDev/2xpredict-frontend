'use client';

import { useState } from 'react';

import {
  Monitor,
  ShieldCheck,
  ShieldAlert,
  Clock,
} from 'lucide-react';

import SessionDetailsModal from './SessionDetailsModal';

type Session = {
  _id: string;
  device?: string;
  lastActiveAt?: string;
  isActive?: boolean;
  userAgent?: string;
  ipAddress?: string;
  location?: {
    isp?: string;
    organization?: string;
    country?: string;
    countryCode?: string;
    region?: string;
    city?: string;
    timezone?: string;
    latitude?: number;
    longitude?: number;
  };
  createdAt?: string;
  expiresAt?: string;
};

interface Props {
  sessions: Session[];
}

export default function SessionHistoryTable({
  sessions,
}: Props) {
  const [selectedSession, setSelectedSession] =
    useState<Session | null>(null);

  return (
    <>
      <section
        className="
          overflow-hidden
          rounded-3xl
          border
          border-border
          bg-card/60
          shadow-xl
          backdrop-blur-xl
        "
      >
        <header
          className="
            flex
            items-center
            gap-3
            border-b
            border-border
            px-5
            py-4
            sm:px-6
            sm:py-5
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-blue-500/10
              text-blue-500
            "
          >
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold">
              Login Sessions
            </h2>

            <p className="text-xs text-muted-foreground">
              Device activity and security history
            </p>
          </div>
        </header>

        {!sessions.length ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-s">
              <thead>
                <tr
                  className="
                    border-b
                    border-border
                    text-left
                    text-xs
                    uppercase
                    text-muted-foreground
                  "
                >
                  <th className="px-5 py-4 sm:px-6">
                    Device
                  </th>

                  <th className="px-4 py-4">
                    Last Active
                  </th>

                  <th className="px-4 py-4">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {sessions.map((session) => (
                  <SessionRow
                    key={session._id}
                    session={session}
                    onClick={() =>
                      setSelectedSession(session)
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedSession && (
        <SessionDetailsModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </>
  );
}

function SessionRow({
  session,
  onClick,
}: {
  session: Session;
  onClick: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      tabIndex={0}
      role="button"
      onKeyDown={(event) => {
        if (
          event.key === 'Enter' ||
          event.key === ' '
        ) {
          event.preventDefault();
          onClick();
        }
      }}
      className="
        cursor-pointer
        border-b
        border-border/50
        transition-colors
        last:border-0
        hover:bg-muted/40
        focus:bg-muted/40
        focus:outline-none
      "
    >
      <td className="px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-blue-500/10
              text-blue-500
            "
          >
            <Monitor className="h-4 w-4" />
          </div>

          <span className="font-medium">
            {session.device || 'Unknown Device'}
          </span>
        </div>
      </td>

      <td className="px-4 py-4">
        <div
          className="
            flex
            items-center
            gap-2
            whitespace-nowrap
            text-muted-foreground
          "
        >
          <Clock className="h-3.5 w-3.5" />

          {formatDate(session.lastActiveAt)}
        </div>
      </td>

      <td className="px-4 py-4">
        <SessionStatus
          active={Boolean(session.isActive)}
        />
      </td>
    </tr>
  );
}

function SessionStatus({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      className={`
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        px-3
        py-1
        text-xs
        ${
          active
            ? `
              border-green-500/20
              bg-green-500/10
              text-green-500
            `
            : `
              border-red-500/20
              bg-red-500/10
              text-red-500
            `
        }
      `}
    >
      <span
        className={`
          h-2
          w-2
          rounded-full
          ${active ? 'bg-green-500' : 'bg-red-500'}
        `}
      />

      {active ? 'Active' : 'Revoked'}
    </span>
  );
}

function EmptyState() {
  return (
    <div
      className="
        flex
        min-h-[220px]
        flex-col
        items-center
        justify-center
        gap-3
        p-6
        text-center
      "
    >
      <ShieldAlert className="h-[38px] w-[38px] text-muted-foreground" />

      <p className="font-medium">
        No sessions found
      </p>

      <p className="text-s text-muted-foreground">
        No login activity recorded.
      </p>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return 'Unknown';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return date.toLocaleString();
}