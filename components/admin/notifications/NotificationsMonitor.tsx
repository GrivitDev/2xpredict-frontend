'use client';

import { FaArrowsRotate, FaBell, FaEnvelope, FaBook } from 'react-icons/fa6';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotificationsMonitorQuery } from '@/hooks/use-notifications';
import type { NotificationMonitorResponse } from '@/types/notifications';

type MonitorSection = 'inApp' | 'email' | 'providerWebhooks';

const sections: Array<{
  key: MonitorSection;
  title: string;
  description: string;
  icon: typeof FaBell;
}> = [
  { key: 'inApp', title: 'In-app delivery', description: 'Notification event processing and delivery queue.', icon: FaBell },
  { key: 'email', title: 'Email delivery', description: 'Queued email delivery and provider processing.', icon: FaEnvelope },
  { key: 'providerWebhooks', title: 'Provider webhooks', description: 'Incoming email-provider webhook processing.', icon: FaBook },
];

function displayValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return '—';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return '[unavailable]';
  }
}

function MonitorCard({
  title,
  description,
  icon: Icon,
  values,
}: {
  title: string;
  description: string;
  icon: typeof FaBell;
  values: Record<string, unknown>;
}) {
  const metrics = Object.entries(values);
  return (
    <Card className="border-border/70">
      <CardHeader className="border-b border-border/60 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm"><Icon className="text-primary" /> {title}</CardTitle>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="pt-3">
        {metrics.length ? (
          <dl className="grid gap-2 sm:grid-cols-2">
            {metrics.map(([key, value]) => (
              <div key={key} className="min-w-0 rounded-lg bg-muted/45 px-3 py-2">
                <dt className="truncate text-[10px] font-semibold text-muted-foreground">{key.replace(/([A-Z])/g, ' $1').replace(/[._-]/g, ' ')}</dt>
                <dd className="mt-1 break-words text-xs font-bold text-foreground">{displayValue(value)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-xs text-muted-foreground">No metrics were returned.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function NotificationsMonitor() {
  const monitor = useNotificationsMonitorQuery();
  const data = monitor.data as NotificationMonitorResponse | undefined;

  return (
    <section className="mx-auto w-full max-w-[1600px] space-y-4 p-2 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Communications</p>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">Notifications Monitor</h1>
          <p className="mt-1 text-xs text-muted-foreground">Queue and provider health. Message bodies and recipient addresses are not exposed by this endpoint.</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => void monitor.refetch()} disabled={monitor.isFetching}>
          <FaArrowsRotate className={`mr-2 h-3 w-3 ${monitor.isFetching ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {monitor.isPending ? (
        <div className="grid gap-3 lg:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="h-44 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : monitor.isError ? (
        <Card className="border-destructive/30">
          <CardContent className="p-5">
            <p className="text-sm font-semibold">Notification monitor could not be loaded.</p>
            <p className="mt-1 text-xs text-muted-foreground">Verify administrator access and the backend notification monitor endpoint.</p>
            <Button size="sm" variant="outline" className="mt-3" onClick={() => void monitor.refetch()}>Retry</Button>
          </CardContent>
        </Card>
      ) : data ? (
        <>
          <div className="grid gap-3 lg:grid-cols-3">
            {sections.map((section) => (
              <MonitorCard
                key={section.key}
                title={section.title}
                description={section.description}
                icon={section.icon}
                values={data[section.key] ?? {}}
              />
            ))}
          </div>
          <p className="text-right text-[10px] text-muted-foreground">
            Last checked: {new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(data.checkedAt))}
          </p>
        </>
      ) : null}
    </section>
  );
}
