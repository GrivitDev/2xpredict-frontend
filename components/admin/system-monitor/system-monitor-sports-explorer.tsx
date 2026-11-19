'use client';

import { useMemo, useState } from 'react';
import { FaArrowsRotate, FaDatabase } from 'react-icons/fa6';
import { useSportsMonitor } from '@/hooks/use-sports';
import type { SportsOperationalMonitor } from '@/types/sports-v2';

type SectionKey =
  | 'summary'
  | 'provider'
  | 'worker'
  | 'queue'
  | 'collection'
  | 'bootstrap'
  | 'fixtures'
  | 'timeline'
  | 'oddsSnapshots'
  | 'derivedData'
  | 'sourceOutbox'
  | 'downstream'
  | 'alerts';

const sections: { id: SectionKey; label: string }[] = [
  { id: 'summary', label: 'Summary' },
  { id: 'provider', label: 'Provider' },
  { id: 'worker', label: 'Worker' },
  { id: 'queue', label: 'Queue' },
  { id: 'collection', label: 'Collection' },
  { id: 'bootstrap', label: 'Bootstrap' },
  { id: 'fixtures', label: 'Fixtures' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'oddsSnapshots', label: 'Odds snapshots' },
  { id: 'derivedData', label: 'Derived data' },
  { id: 'sourceOutbox', label: 'Source outbox' },
  { id: 'downstream', label: 'Downstream' },
  { id: 'alerts', label: 'Alerts' },
];

export default function SystemMonitorSportsExplorer() {
  const [section, setSection] = useState<SectionKey>('queue');
  const monitor = useSportsMonitor();
  const data = monitor.data;
  const value = useMemo(() => {
    if (!data) return undefined;
    if (section === 'summary') return data.summary;
    return data[section as Exclude<SectionKey, 'summary'>];
  }, [data, section]);

  return (
    <section className="overflow-hidden rounded-lg border border-border/80 bg-card">
      <header className="flex min-h-9 items-center justify-between gap-2 border-b border-border/70 px-2 py-1.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <FaDatabase className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="min-w-0">
            <h2 className="text-xs font-semibold">Sports monitor data explorer</h2>
            <p className="truncate text-[9px] text-muted-foreground">GET /admin/sports/monitor</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void monitor.refetch()}
          disabled={monitor.isFetching}
          className="inline-flex h-7 shrink-0 items-center gap-1 rounded border border-border px-2 text-[10px] font-medium hover:bg-muted disabled:opacity-50"
        >
          <FaArrowsRotate className={`h-3 w-3 ${monitor.isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      <div className="flex gap-1 overflow-x-auto border-b border-border/60 p-2">
        {sections.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSection(item.id)}
            aria-pressed={section === item.id}
            className={`h-6 shrink-0 rounded border px-2 text-[10px] font-medium ${section === item.id ? 'border-primary/20 bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:bg-muted'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {monitor.isLoading ? (
        <p className="px-3 py-8 text-center text-[11px] text-muted-foreground">Loading Sports monitor…</p>
      ) : monitor.isError ? (
        <div className="px-3 py-8 text-center text-[11px] text-rose-600">
          <p>Sports monitor could not be loaded.</p>
          <button type="button" onClick={() => void monitor.refetch()} className="mt-2 rounded border border-border px-2 py-1 font-medium">Retry</button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 px-2 py-1.5 text-[10px] text-muted-foreground">
            <span>{sections.find((item) => item.id === section)?.label}</span>
            <span>Generated {data?.generatedAt ? new Date(data.generatedAt).toLocaleString('en-GB') : '—'}</span>
          </div>
          <pre className="max-h-[68vh] overflow-auto whitespace-pre-wrap break-words p-3 text-[10px] leading-relaxed text-foreground">{JSON.stringify(value ?? {}, null, 2)}</pre>
        </>
      )}
    </section>
  );
}
