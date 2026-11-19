'use client';

import {
  FaChartLine as Activity,
  FaBoxesStacked as Boxes,
  FaDatabase as Database,
  FaLayerGroup as FileStack,
  FaHardDrive as HardDrive,
  FaArrowsRotate as RefreshCw,
} from 'react-icons/fa6';

import { useMemo, useState } from 'react';

import { useSystemMonitorStorage, useSystemMonitorStorageHistory } from '@/hooks/use-monitoring';


// ============================================================
// HELPERS
// ============================================================

const formatBytes = (
  bytes: number,
  decimals = 2,
): string => {
  if (
    !Number.isFinite(bytes) ||
    bytes < 0
  ) {
    return '—';
  }

  if (bytes === 0) {
    return '0 B';
  }

  const units = [
    'B',
    'KB',
    'MB',
    'GB',
    'TB',
  ];

  const unitIndex = Math.min(
    Math.floor(
      Math.log(bytes) /
        Math.log(1024),
    ),
    units.length - 1,
  );

  const value =
    bytes /
    Math.pow(
      1024,
      unitIndex,
    );

  return `${value.toFixed(
    unitIndex === 0
      ? 0
      : decimals,
  )} ${units[unitIndex]}`;
};


const formatNumber = (
  value: number,
): string => {
  return new Intl.NumberFormat(
    'en-US',
  ).format(value);
};


const formatDateTime = (
  value?: string,
): string => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '—';
  }

  return date.toLocaleString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    },
  );
};


// ============================================================
// COMPONENT
// ============================================================

export default function SystemMonitorStorage() {
  const storageQuery = useSystemMonitorStorage();
  const [historyLimit, setHistoryLimit] = useState('25');
  const historyQuery = useSystemMonitorStorageHistory({ limit: Number(historyLimit) || 25 });

  const storage =
    storageQuery.data;

  const collections = useMemo(
    () =>
      [...(
        storage?.collections ?? []
      )].sort(
        (
          a,
          b,
        ) =>
          b.totalSizeBytes -
          a.totalSizeBytes,
      ),
    [storage?.collections],
  );

  const totals =
    storage?.totals;


  return (
    <div className="space-y-2">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div>
          <h2 className="text-xs font-bold text-foreground">
            Database Storage
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          {storage?.persistedAt && (
            <span className="text-[10px] text-muted-foreground">
              Snapshot {formatDateTime(
                storage.persistedAt,
              )}
            </span>
          )}

          <RefreshCw
            className={`h-4 w-4 text-muted-foreground ${
              storageQuery.isFetching
                ? 'animate-spin'
                : ''
            }`}
          />
        </div>
      </div>


      {/* ======================================================
          DATABASE SUMMARY
      ====================================================== */}

      <div className="grid grid-cols-2 gap-1.5 md:grid-cols-3 xl:grid-cols-6">
        <StorageMetric
          label="Total Storage"
          value={
            formatBytes(
              totals?.totalSizeBytes ?? 0,
            )
          }
          icon={Database}
          emphasis
        />

        <StorageMetric
          label="Data Size"
          value={
            formatBytes(
              totals?.dataSizeBytes ?? 0,
            )
          }
          icon={FileStack}
        />

        <StorageMetric
          label="Storage Allocated"
          value={
            formatBytes(
              totals?.storageSizeBytes ?? 0,
            )
          }
          icon={HardDrive}
        />

        <StorageMetric
          label="Indexes"
          value={
            formatBytes(
              totals?.indexSizeBytes ?? 0,
            )
          }
          icon={Activity}
        />

        <StorageMetric
          label="Documents"
          value={formatNumber(
            totals?.documents ?? 0,
          )}
          icon={Boxes}
        />

        <StorageMetric
          label="Collections"
          value={formatNumber(
            totals?.collections ?? 0,
          )}
          icon={Database}
        />
      </div>


      {/* ======================================================
          COLLECTIONS
      ====================================================== */}

      <section className="overflow-hidden rounded-md border border-border bg-card/60">
        <div className="border-b border-border px-2 py-1.5">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div>
              <h3 className="text-xs font-semibold text-foreground">
                Collections
              </h3>

              <p className="text-[10px] text-muted-foreground">
                Sorted by total footprint, including indexes.
              </p>
            </div>

            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
              {collections.length} COLLECTIONS
            </span>
          </div>
        </div>

        <div className="grid gap-1.5 p-1.5 md:grid-cols-2 xl:grid-cols-3">
          {collections.map(
            collection => (
              <CollectionCard
                key={collection.name}
                collection={collection}
              />
            ),
          )}

          {collections.length === 0 && (
            <div className="col-span-full rounded-md border border-dashed border-border p-2 text-center text-[11px] text-muted-foreground">
              No MongoDB collection statistics are available.
            </div>
          )}
        </div>
      </section>


      <section className="overflow-hidden rounded-md border border-border bg-card/60">
        <header className="flex flex-wrap items-center justify-between gap-1.5 border-b border-border px-2 py-1.5">
          <h3 className="text-xs font-semibold text-foreground">Storage history</h3>
          <div className="flex items-center gap-1.5">
            <select aria-label="Storage history rows" value={historyLimit} onChange={(event) => setHistoryLimit(event.target.value)} className="h-6 rounded border border-border bg-background px-1.5 text-[10px]">
              {[10, 25, 50, 100, 200].map((limit) => <option key={limit} value={limit}>{limit} rows</option>)}
            </select>
            <button type="button" onClick={() => void historyQuery.refetch()} disabled={historyQuery.isFetching} className="h-6 rounded border border-border px-2 text-[10px] hover:bg-muted disabled:opacity-50">{historyQuery.isFetching ? 'Loading…' : 'Refresh'}</button>
          </div>
        </header>
        {historyQuery.isError ? <p role="alert" className="px-2 py-2 text-[10px] text-rose-600">Storage history unavailable.</p> : <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-[10px]">
            <thead className="bg-muted/80 text-muted-foreground"><tr>{['Captured', 'Database', 'Collections', 'Documents', 'Data', 'Storage', 'Indexes', 'Total'].map((heading) => <th key={heading} className="whitespace-nowrap px-2 py-1.5 font-semibold">{heading}</th>)}</tr></thead>
            <tbody>{(historyQuery.data ?? []).map((item, index) => <tr key={`${item.capturedAt}-${index}`} className="border-t border-border/60 hover:bg-muted/20">
              <td className="whitespace-nowrap px-2 py-1.5">{formatDateTime(item.capturedAt)}</td><td className="px-2 py-1.5">{item.databaseName}</td><td className="px-2 py-1.5 tabular-nums">{formatNumber(item.totals.collections)}</td><td className="px-2 py-1.5 tabular-nums">{formatNumber(item.totals.documents)}</td><td className="px-2 py-1.5 tabular-nums">{formatBytes(item.totals.dataSizeBytes)}</td><td className="px-2 py-1.5 tabular-nums">{formatBytes(item.totals.storageSizeBytes)}</td><td className="px-2 py-1.5 tabular-nums">{formatBytes(item.totals.indexSizeBytes)}</td><td className="px-2 py-1.5 font-semibold tabular-nums">{formatBytes(item.totals.totalSizeBytes)}</td>
            </tr>)}
            {!historyQuery.data?.length ? <tr><td colSpan={8} className="px-2 py-3 text-center text-[10px] text-muted-foreground">{historyQuery.isLoading ? 'Loading…' : 'No storage history recorded.'}</td></tr> : null}</tbody>
          </table>
        </div>}
      </section>

      {/* ======================================================
          DATABASE INFO
      ====================================================== */}

      {storage && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border bg-background/30 px-2 py-1.5 text-[9px] text-muted-foreground">
          <span>
            Database:{' '}
            <span className="font-semibold text-foreground">
              {storage.databaseName}
            </span>
          </span>

          <span>
            Captured:{' '}
            <span className="font-semibold text-foreground">
              {formatDateTime(
                storage.capturedAt,
              )}
            </span>
          </span>

          <span>
            Total footprint:{' '}
            <span className="font-semibold text-foreground">
              {formatBytes(
                totals?.totalSizeBytes ?? 0,
              )}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}


// ============================================================
// STORAGE METRIC
// ============================================================

function StorageMetric({
  label,
  value,
  icon: Icon,
  emphasis = false,
}: {
  label: string;
  value: string;
  icon: typeof Database;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`rounded-md border border-border bg-card/60 px-2 py-1.5 ${
        emphasis
          ? 'ring-1 ring-primary/10'
          : ''
      }`}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />

        <span className="text-[9px]">
          {label}
        </span>
      </div>

      <p
        className={`mt-1 ${
          emphasis
            ? 'text-xs'
            : 'text-xs'
        } font-bold text-foreground`}
      >
        {value}
      </p>
    </div>
  );
}


// ============================================================
// COLLECTION CARD
// ============================================================

function CollectionCard({
  collection,
}: {
  collection: {
    name: string;
    documents: number;
    dataSizeBytes: number;
    storageSizeBytes: number;
    averageDocumentSizeBytes: number;
    indexes: number;
    totalIndexSizeBytes: number;
    totalSizeBytes: number;
  };
}) {
  return (
    <article className="rounded-md border border-border bg-background/30 p-2">
      {/* HEADER */}

      <div className="flex items-start justify-between gap-1.5">
        <div className="min-w-0">
          <h4
            className="truncate text-[11px] font-bold text-foreground"
            title={collection.name}
          >
            {collection.name}
          </h4>

          <p className="mt-0.5 text-[9px] text-muted-foreground">
            {formatNumber(
              collection.documents,
            )}{' '}
            documents
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
          {formatBytes(
            collection.totalSizeBytes,
          )}
        </span>
      </div>


      {/* DETAILS */}

      <div className="mt-1 grid grid-cols-2 gap-1.5">
        <CollectionStat
          label="Storage"
          value={formatBytes(
            collection.storageSizeBytes,
          )}
        />

        <CollectionStat
          label="Data"
          value={formatBytes(
            collection.dataSizeBytes,
          )}
        />

        <CollectionStat
          label="Avg Document"
          value={formatBytes(
            collection.averageDocumentSizeBytes,
          )}
        />

        <CollectionStat
          label="Indexes"
          value={formatNumber(
            collection.indexes,
          )}
        />

        <CollectionStat
          label="Index Size"
          value={formatBytes(
            collection.totalIndexSizeBytes,
          )}
        />

        <CollectionStat
          label="Total"
          value={formatBytes(
            collection.totalSizeBytes,
          )}
        />
      </div>
    </article>
  );
}


// ============================================================
// COLLECTION STAT
// ============================================================

function CollectionStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/30 px-1.5 py-1.5">
      <p className="text-[8px] text-muted-foreground">
        {label}
      </p>

      <p className="mt-0.5 truncate text-[10px] font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}
