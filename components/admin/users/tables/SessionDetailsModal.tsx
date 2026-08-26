'use client';

import {
  X,
  Monitor,
  Globe,
  MapPin,
  Clock,
  ShieldCheck,
  Activity,
  Radio,
} from 'lucide-react';

type Session = {
  isActive?: boolean;
  device?: string;
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
  lastActiveAt?: string;
  expiresAt?: string;
};

interface Props {
  session: Session;
  onClose: () => void;
}

export default function SessionDetailsModal({
  session,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-md sm:p-6">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border/60 bg-background/95 shadow-2xl backdrop-blur-xl">
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />

        <header className="flex items-center justify-between border-b border-border/60 px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
              <ShieldCheck className="h-[22px] w-[22px]" />
            </div>

            <div>
              <h2 className="text-base font-semibold">
                Session Intelligence
              </h2>

              <p className="text-xs text-muted-foreground">
                Security activity analysis
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close session details"
            className="rounded-xl border border-border/50 p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </header>

        <div className="space-y-5 overflow-y-auto p-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:p-7">
          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/50 p-4">
            <div className="flex items-center gap-3">
              <Radio className="h-[18px] w-[18px] text-emerald-500" />

              <div>
                <p className="text-s font-medium">
                  Session Status
                </p>

                <p className="text-xs text-muted-foreground">
                  Real-time monitoring
                </p>
              </div>
            </div>

            <StatusBadge active={Boolean(session.isActive)} />
          </div>

          <InfoSection
            title="Device Profile"
            icon={<Monitor className="h-4 w-4" />}
          >
            <Row
              label="Device"
              value={session.device}
            />

            <Row
              label="User Agent"
              value={session.userAgent}
            />
          </InfoSection>

          <InfoSection
            title="Network Intelligence"
            icon={<Globe className="h-4 w-4" />}
          >
            <Row
              label="IP Address"
              value={session.ipAddress}
            />

            <Row
              label="ISP"
              value={session.location?.isp}
            />

            <Row
              label="Organization"
              value={session.location?.organization}
            />
          </InfoSection>

          <InfoSection
            title="Geolocation"
            icon={<MapPin className="h-4 w-4" />}
          >
            <Row
              label="Country"
              value={session.location?.country}
            />

            <Row
              label="Country Code"
              value={session.location?.countryCode}
            />

            <Row
              label="Region"
              value={session.location?.region}
            />

            <Row
              label="City"
              value={session.location?.city}
            />

            <Row
              label="Timezone"
              value={session.location?.timezone}
            />

            <Row
              label="Coordinates"
              value={
                session.location
                  ? `${session.location.latitude ?? '-'}, ${session.location.longitude ?? '-'}`
                  : undefined
              }
            />
          </InfoSection>

          <InfoSection
            title="Timeline"
            icon={<Clock className="h-4 w-4" />}
          >
            <Row
              label="Created"
              value={formatDate(session.createdAt)}
            />

            <Row
              label="Last Active"
              value={formatDate(session.lastActiveAt)}
            />

            <Row
              label="Expires"
              value={formatDate(session.expiresAt)}
            />
          </InfoSection>

          <div className="flex items-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-xs text-blue-500">
            <Activity className="h-[15px] w-[15px] shrink-0" />

            Session data protected by security monitoring system.
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
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
        px-3
        py-1
        text-xs
        font-medium
        ${
          active
            ? 'bg-emerald-500/10 text-emerald-500'
            : 'bg-red-500/10 text-red-500'
        }
      `}
    >
      <span className="h-2 w-2 rounded-full bg-current" />

      {active ? 'Active' : 'Revoked'}
    </span>
  );
}

function InfoSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/40 p-4 shadow-sm backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-2 text-s font-semibold">
        <span className="text-blue-500">
          {icon}
        </span>

        {title}
      </div>

      <div className="space-y-3">
        {children}
      </div>
    </section>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="flex flex-col gap-1 text-s sm:flex-row sm:justify-between sm:gap-5">
      <span className="text-muted-foreground">
        {label}
      </span>

      <span className="break-all text-left font-medium sm:max-w-[65%] sm:text-right">
        {value || 'Unknown'}
      </span>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return 'Unknown';
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? 'Unknown'
    : date.toLocaleString();
}