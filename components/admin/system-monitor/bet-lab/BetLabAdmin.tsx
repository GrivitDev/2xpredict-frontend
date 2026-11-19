"use client";

import { Fragment, useMemo, useState } from "react";
import {
  useGetMonitorQuery,
  useGetRecentEventsQuery,
} from "@/hooks/use-bet-lab-admin";
import { asRecord, formatDate, firstValue, rowsFrom, text } from "@/lib/api-shapes";
import { FaArrowsRotate } from "react-icons/fa6";

type Row = Record<string, unknown>;

function record(value: unknown): Row {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Row)
    : {};
}

function list(value: unknown): Row[] {
  if (!Array.isArray(value)) return [];
  return value.map(record);
}

function numberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

function numberText(value: unknown): string {
  const number = numberValue(value);
  return number === null ? "—" : number.toLocaleString();
}

function points(value: unknown): string {
  const number = numberValue(value);
  return number === null
    ? "—"
    : `${number.toLocaleString(undefined, { maximumFractionDigits: 2 })} pts`;
}

function percent(value: unknown): string {
  const number = numberValue(value);
  return number === null ? "—" : `${number.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;
}

function label(value: unknown, fallback = "—"): string {
  return text(value, fallback).replaceAll("_", " ");
}

function toneForStatus(value: unknown): string {
  const status = String(value ?? "").toUpperCase();
  if (["OK", "INFO", "WON", "COMPLETED", "SUCCESS"].includes(status)) {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }
  if (["DEGRADED", "WARN", "WARNING", "PENDING", "OPEN", "PENDING_SETTLEMENT"].includes(status)) {
    return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }
  if (["ERROR", "FAILED", "LOST", "CANCELLED", "REJECTED"].includes(status)) {
    return "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300";
  }
  return "border-border bg-muted/50 text-muted-foreground";
}

function StatusBadge({ value }: { value: unknown }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${toneForStatus(value)}`}>
      {label(value, "Unknown")}
    </span>
  );
}

function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`min-w-0 overflow-hidden rounded-lg border border-border/80 bg-card ${className}`}>
      <div className="flex items-center justify-between gap-2 border-b border-border/80 bg-muted/20 px-2 py-2">
        <div className="min-w-0">
          <h2 className="text-xs font-semibold tracking-tight leading-4">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-2">{children}</div>
    </section>
  );
}

function Metric({
  title,
  value,
  status,
}: {
  title: string;
  value: string;
  status?: unknown;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border/80 bg-card px-2 py-2 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-medium text-muted-foreground">{title}</p>
        {status !== undefined ? <StatusBadge value={status} /> : null}
      </div>
      <p className="mt-1 truncate text-lg font-semibold tracking-tight tabular-nums">{value}</p>
    </div>
  );
}

function DistributionTable({
  rows,
  nameKeys,
  countKeys,
  amountKeys,
  emptyMessage,
}: {
  rows: Row[];
  nameKeys: string[];
  countKeys?: string[];
  amountKeys?: string[];
  emptyMessage: string;
}) {
  if (!rows.length) {
    return <p className="py-2 text-center text-xs text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[360px] text-left text-xs">
        <thead className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
          <tr>
            <th className="pb-1 pr-2 font-medium">Category</th>
            {countKeys ? <th className="pb-1 px-2 text-right font-medium">Count</th> : null}
            {amountKeys ? <th className="pb-1 pl-2 text-right font-medium">Points</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${label(firstValue(row, nameKeys), "row")}-${index}`} className="border-t border-border/70 transition-colors hover:bg-muted/20">
              <td className="max-w-[220px] truncate py-2 pr-3 font-medium">{label(firstValue(row, nameKeys))}</td>
              {countKeys ? <td className="px-3 py-2 text-right tabular-nums">{numberText(firstValue(row, countKeys))}</td> : null}
              {amountKeys ? <td className="py-1 pl-2 text-right tabular-nums">{numberText(firstValue(row, amountKeys))}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BetLabAdmin() {
  const [tab, setTab] = useState<"overview" | "tickets" | "ledger-markets" | "sports" | "events" | "catalog">("overview");
  const [eventsLimit, setEventsLimit] = useState<25 | 50 | 100 | 200>(50);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const monitor = useGetMonitorQuery<unknown>({ refetchInterval: 30_000 });
  const events = useGetRecentEventsQuery<unknown>(
    { query: { limit: eventsLimit } },
    { enabled: tab === 'events', refetchInterval: 30_000 },
  );

  const data = asRecord(monitor.data);
  const health = record(data.health);
  const usersAndWallets = record(data.usersAndWallets);
  const balances = record(usersAndWallets.balanceByCreditSource);
  const tickets = record(data.tickets);
  const ledger = record(data.ledger);
  const catalog = record(data.marketCatalog);
  const coverage = record(data.sportsDataCoverage);

  const statusRows = list(tickets.statuses);
  const ledgerRows = list(ledger.transactionTypes);
  const planRows = list(usersAndWallets.bySubscriptionAllowancePlan);
  const marketRows = list(tickets.topMarketFamilies);
  const eventRows = useMemo(
    () => rowsFrom(events.data, ["items", "events", "results", "data"]),
    [events.data],
  );

  const isDegraded = String(health.status ?? "").toUpperCase() === "DEGRADED";
  const generatedAt = data.generatedAt;

  const refresh = () => {
    void monitor.refetch();
    void events.refetch();
  };

  return (
    <main className="mx-auto max-w-[1500px] space-y-2 px-1 py-1 sm:px-1.5">
      <header className="flex flex-col gap-2 border-b border-border/80 pb-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-serif text-xl font-semibold tracking-tight text-foreground sm:text-xl">Bet Lab Monitor</h1>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/80 bg-card px-2 py-1 shadow-sm sm:justify-end">
        <span className="mr-auto flex items-center gap-2 text-xs text-muted-foreground">
          <span className={`h-1 w-1 rounded-full ${isDegraded ? "bg-amber-500" : health.status ? "bg-emerald-500" : "bg-muted-foreground"}`} />
          {label(health.status, monitor.isLoading ? "Loading" : "Unknown")}
          <span>·</span>
          <span>{generatedAt ? formatDate(generatedAt) : "—"}</span>
        </span>
        <button
          type="button"
          onClick={refresh}
          disabled={monitor.isFetching || events.isFetching}
          aria-label="Refresh Bet Lab monitor"
          title="Refresh"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FaArrowsRotate className={`h-3 w-3 ${monitor.isFetching || events.isFetching ? "animate-spin" : ""}`} />
        </button>
        </div>
      </header>
      <nav aria-label="Bet Lab sections" className="flex gap-0.5 overflow-x-auto border-b border-border/70 py-1">
        {([
          ["overview", "Overview"],
          ["tickets", "Tickets"],
          ["ledger-markets", "Ledger & Markets"],
          ["sports", "Sports data"],
          ["events", "Events"],
          ["catalog", "Market catalog"],
        ] as const).map(([id, labelText]) => (
          <button key={id} type="button" onClick={() => setTab(id)} aria-pressed={tab === id}
            className={`h-7 shrink-0 rounded-md px-2 text-[11px] font-medium ${tab === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            {labelText}
          </button>
        ))}
      </nav>


      {monitor.isError ? (
        <div role="alert" className="rounded-md border border-rose-500/30 bg-rose-500/5 px-2 py-1.5 text-xs text-rose-700 dark:text-rose-300">
          Unable to load Bet Lab monitor data. Refresh to try again.
        </div>
      ) : null}

      {tab === "overview" ? (
        <div className="overflow-x-auto"><div className="grid min-w-[640px] grid-cols-4 gap-2">
          <Metric title="Registered wallets" value={numberText(usersAndWallets.wallets)} />
          <Metric title="Stored tickets" value={numberText(tickets.currentlyStoredTicketDocuments)} />
          <Metric title="Lifetime tickets placed" value={numberText(tickets.lifetimeTicketsPlaced)} />
          <Metric title="Wallet balance checks" value={numberText(health.walletBalanceInconsistencies)} status={numberValue(health.walletBalanceInconsistencies) === 0 ? "OK" : "DEGRADED"} />
        </div></div>
      ) : null}

{tab === 'overview' && (
      <div className="grid gap-2 xl:grid-cols-[1.2fr_1fr]">
        <Panel title="Virtual points overview">
          <div className="grid grid-cols-4 gap-2">
            {[
              ["Total available", balances.totalAvailablePoints],
              ["Welcome points", balances.welcomePointsRemaining],
              ["Monthly points", balances.monthlyPointsRemaining],
              ["Winnings points", balances.winningsPointsRemaining],
              ["Bonus points", balances.bonusPointsRemaining],
            ].map(([name, value]) => (
              <div key={String(name)} className="min-w-0 rounded-lg border border-border/60 bg-muted/30 px-2 py-1.5">
                <p className="truncate text-xs text-muted-foreground">{String(name)}</p>
                <p className="mt-1 truncate text-xs font-semibold tabular-nums">{numberText(value)}</p>
                <p className="text-[10px] text-muted-foreground">pts</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/80 pt-4">
            <div>
              <p className="truncate text-xs text-muted-foreground">Total staked</p>
              <p className="mt-0.5 truncate text-xs font-semibold">{points(tickets.totalStakedPoints)}</p>
            </div>
            <div>
              <p className="truncate text-xs text-muted-foreground">Total returned</p>
              <p className="mt-0.5 truncate text-xs font-semibold">{points(tickets.totalReturnedPoints)}</p>
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">Net virtual P/L</p>
              <p className={`mt-0.5 truncate text-xs font-semibold ${numberValue(tickets.netVirtualProfitLoss) !== null && numberValue(tickets.netVirtualProfitLoss)! < 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"}`}>
                {points(tickets.netVirtualProfitLoss)}
              </p>
            </div>
          </div>
        </Panel>

        <Panel title="Operational health">
          <div className="grid grid-cols-3 gap-2">
            {[
              ["System errors", health.systemErrorsLast24Hours],
              ["Rejected placements", health.ticketPlacementsRejectedLast24Hours],
              ["Balance issues", health.walletBalanceInconsistencies],
            ].map(([name, value]) => (
              <div key={String(name)} className="min-w-0 rounded-lg border border-border/60 bg-muted/30 px-2 py-1.5">
                <p className="truncate text-xs text-muted-foreground">{String(name)}</p>
                <p className={`mt-0.5 text-xs font-semibold tabular-nums ${numberValue(value) !== null && numberValue(value)! > 0 ? "text-amber-600 dark:text-amber-400" : ""}`}>
                  {numberText(value)}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>


)}
{tab === 'tickets' && (
      <div className="grid gap-2 xl:grid-cols-2">
        <Panel title="Ticket status breakdown">
          <DistributionTable
            rows={statusRows}
            nameKeys={["_id", "status", "name"]}
            countKeys={["count", "ticketCount", "total"]}
            amountKeys={["stakePoints", "stake", "totalStake"]}
            emptyMessage={monitor.isLoading ? "Loading ticket statuses…" : "No ticket status data returned."}
          />
        </Panel>
        <Panel title="Wallets by subscription plan">
          {planRows.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-xs">
                <thead className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  <tr>
                    <th className="pb-1 pr-2 font-medium">Plan</th>
                    <th className="px-2 pb-1 text-right font-medium">Wallets</th>
                    <th className="px-2 pb-1 text-right font-medium">Balance</th>
                    <th className="pb-1 pl-2 text-right font-medium">Monthly left</th>
                  </tr>
                </thead>
                <tbody>
                  {planRows.map((row, index) => (
                    <tr key={`${label(firstValue(row, ["_id", "plan", "name"]))}-${index}`} className="border-t border-border/70 transition-colors hover:bg-muted/20">
                      <td className="py-1 pr-2 font-medium">{label(firstValue(row, ["_id", "plan", "name"]))}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{numberText(firstValue(row, ["walletCount", "count"]))}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{numberText(firstValue(row, ["activeBalance", "balance"]))}</td>
                      <td className="py-1 pl-2 text-right tabular-nums">{numberText(firstValue(row, ["monthlyCreditsRemaining", "monthlyBalance"]))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="py-2 text-center text-xs text-muted-foreground">{monitor.isLoading ? "Loading plan distribution…" : "No plan distribution data returned."}</p>}
        </Panel>
      </div>


)}
{tab === 'ledger-markets' && (
      <div className="grid gap-2 xl:grid-cols-2">
        <Panel title="Ledger activity">
          <DistributionTable
            rows={ledgerRows}
            nameKeys={["_id", "transactionType", "type", "name"]}
            countKeys={["count", "entries"]}
            amountKeys={["totalDelta", "delta", "amount"]}
            emptyMessage={monitor.isLoading ? "Loading ledger activity…" : "No ledger activity data returned."}
          />
        </Panel>
        <Panel title="Most-used markets">
          <DistributionTable
            rows={marketRows}
            nameKeys={["_id", "marketCode", "code", "name"]}
            countKeys={["selectionCount", "count"]}
            amountKeys={["ticketStakeExposurePoints", "stakePoints", "exposure"]}
            emptyMessage={monitor.isLoading ? "Loading market usage…" : "No market usage data returned."}
          />
        </Panel>
      </div>


)}
{tab === 'sports' && (
      <Panel title="Sports data readiness">
        <div className="grid grid-cols-3 gap-2">
          {[
            ["Eligible upcoming fixtures", coverage.eligibleUpcomingFixturesNext14Days],
            ["Fixtures with summary", coverage.fixturesWithSummary],
            ["Fixtures with provider odds", coverage.fixturesWithProviderOdds],
          ].map(([name, value]) => {
            const count = numberValue(value);
            const total = numberValue(coverage.eligibleUpcomingFixturesNext14Days);
            const ratio = count !== null && total !== null && total > 0 ? Math.min(100, Math.max(0, (count / total) * 100)) : null;
            return (
              <div key={String(name)} className="rounded-lg border border-border/80 px-2 py-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs leading-4 text-muted-foreground">{String(name)}</p>
                  <span className="text-xs font-semibold tabular-nums">{numberText(value)}</span>
                </div>
                {ratio !== null ? (
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${ratio}%` }} />
                  </div>
                ) : null}
                {ratio !== null ? <p className="mt-0.5 text-[10px] text-muted-foreground">{percent(ratio)} of eligible fixtures</p> : null}
              </div>
            );
          })}
        </div>
      </Panel>


)}
{tab === 'events' && (
      <Panel
        title="Recent events"
        action={<div className="flex items-center gap-2">
          <select aria-label="Event row limit" value={eventsLimit} onChange={(event) => setEventsLimit(Number(event.target.value) as 25 | 50 | 100 | 200)} className="h-7 rounded-md border border-border bg-background px-1.5 text-[11px] outline-none focus:ring-1 focus:ring-ring">
            {[25, 50, 100, 200].map((limit) => <option key={limit} value={limit}>{limit} rows</option>)}
          </select>
          <StatusBadge value={events.isError ? "ERROR" : events.isFetching ? "UPDATING" : "LIVE"} />
        </div>}
      >
        {events.isLoading ? (
          <p className="py-3 text-center text-xs text-muted-foreground">Loading Bet Lab events…</p>
        ) : events.isError ? (
          <div role="alert" className="py-2 text-center text-xs text-rose-600 dark:text-rose-400">
            Could not load recent events. Use Refresh to retry.
          </div>
        ) : eventRows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-muted/40 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <tr>
                  {["Time", "Category", "Action", "Level", "Message", "User / Fixture", ""].map((heading, columnIndex) => (
                    <th key={`${heading}-${columnIndex}`} className="px-3 py-2 font-medium">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {eventRows.map((event, index) => {
                  const eventId = text(firstValue(event, ["_id", "id"]), String(index));
                  const expanded = expandedEventId === eventId;
                  return <Fragment key={eventId}>
                  <tr className="border-t border-border/70 align-top hover:bg-muted/20">
                    <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{formatDate(firstValue(event, ["createdAt", "occurredAt", "timestamp"]))}</td>
                    <td className="whitespace-nowrap px-2 py-1">{label(event.category)}</td>
                    <td className="max-w-[190px] px-3 py-2 font-medium">{label(event.action, label(firstValue(event, ["type", "eventType"]), "Event"))}</td>
                    <td className="px-2 py-1"><StatusBadge value={event.level} /></td>
                    <td className="max-w-[320px] px-2 py-1">
                      <p className="line-clamp-2 leading-4">{text(firstValue(event, ["message", "details", "reason"]), "No message supplied")}</p>
                      {event.metadata && Object.keys(record(event.metadata)).length > 0 ? (
                        <details className="mt-1">
                          <summary className="cursor-pointer text-xs text-muted-foreground">Metadata</summary>
                          <pre className="mt-1 max-w-[300px] overflow-auto whitespace-pre-wrap break-words rounded bg-muted/50 p-1 text-[9px]">{JSON.stringify(event.metadata, null, 2)}</pre>
                        </details>
                      ) : null}
                    </td>
                    <td className="max-w-[160px] px-3 py-2 text-muted-foreground">
                      <span className="block truncate">{text(event.userId, "—")}</span>
                      <span className="block truncate">{text(event.eventId, "")}</span>
                    </td>
                    <td className="px-2 py-1 text-right">
                      <button type="button" onClick={() => setExpandedEventId(expanded ? null : eventId)} aria-expanded={expanded} className="rounded px-1.5 py-1 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground">{expanded ? "Hide" : "Details"}</button>
                    </td>
                  </tr>
                  {expanded ? <tr key={`${eventId}-details`} className="border-t border-border/50 bg-muted/20"><td colSpan={7} className="px-3 py-2"><pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words text-[10px] leading-4">{JSON.stringify(event, null, 2)}</pre></td></tr> : null}
                  </Fragment>;
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-3 text-center text-xs text-muted-foreground">No recent Bet Lab events have been recorded.</p>
        )}
      </Panel>


)}
{tab === 'catalog' && (
      <Panel title="Market catalog">
        {list(catalog.markets).length ? (
          <div className="space-y-2">
            {Array.from(
              { length: Math.ceil(list(catalog.markets).length / (list(catalog.markets).length <= 5 ? 5 : 4)) },
              (_, rowIndex) => {
              const columns = list(catalog.markets).length <= 5 ? 5 : 4;
              const rowMarkets = list(catalog.markets).slice(rowIndex * columns, rowIndex * columns + columns);
              return (
                <div key={rowIndex} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${rowMarkets.length}, minmax(0, 1fr))` }}>
                  {rowMarkets.map((market, index) => (
                    <div key={`${label(market.code, "market")}-${rowIndex * 4 + index}`} className="min-w-0 rounded-lg border border-border/80 bg-background px-2 py-2 transition-colors hover:bg-muted/20">
                      <div className="flex min-w-0 items-start justify-between gap-1">
                        <p className="min-w-0 truncate text-xs font-semibold">{text(market.fullName, label(market.code, "Market"))}</p>
                        <StatusBadge value={market.selectionMode} />
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{label(market.code)} · {label(market.category)} · {label(market.period)}</p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-3 text-center text-xs text-muted-foreground">{monitor.isLoading ? "Loading market catalog…" : "No catalog rows returned."}</p>
        )}
      </Panel>


)}
    </main>
  );
}
