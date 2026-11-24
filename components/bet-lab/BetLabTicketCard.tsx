'use client';

import { useMemo, useState } from 'react';
import { FaChevronDown, FaChevronUp, FaFutbol } from 'react-icons/fa6';
import { resolveLeagueDisplayName, resolveTeamDisplayName, type MatchPresentation } from '@/hooks/use-match-presentation';
import {
  asRecord,
  firstValue,
  formatDate,
  formatPoints,
  numeric,
  rowsFrom,
  text,
  type ApiRecord,
} from '@/lib/api-shapes';
import {
  fixtureTeamLogoSources,
  fixtureLeagueLogoSources,
  fixtureTeamName,
  logoUrlsOf,
  resolveStatus,
  statusLabel,
  ticketLegEventId,
  ticketLegFixtureDate,
  ticketStatusTone,
  timeLabel,
} from './bet-lab.utils';
import BetLabLogo from './BetLabLogo';

type Props = {
  ticket: ApiRecord;
  index: number;
  presentations: Map<string, MatchPresentation>;
  defaultExpanded?: boolean;
};

const SETTLEMENT_STATES = new Set([
  'WON', 'WIN', 'WINNER', 'LOST', 'LOSE', 'VOID', 'PUSH', 'CANCELLED',
  'SETTLED', 'PARTIALLY_WON', 'PARTIALLY_LOST', 'HALF_WON', 'HALF_LOST',
]);

function settlementStatus(leg: ApiRecord): string {
  const settlement = asRecord(firstValue(leg, ['settlement', 'result']));
  const value = firstValue(
    leg,
    ['settlementStatus', 'settlementResult', 'resultStatus', 'settlementOutcome', 'actualOutcome'],
    firstValue(settlement ?? {}, ['status', 'result', 'outcome']),
  );
  if (value !== undefined && value !== null && String(value).trim()) return text(value).toUpperCase();
  const genericStatus = text(leg.status, '').toUpperCase();
  if (SETTLEMENT_STATES.has(genericStatus)) return genericStatus;
  if (leg.isSettled === true || leg.settled === true) return 'SETTLED';
  return 'PENDING';
}

function predictionStatus(leg: ApiRecord): string {
  const explicit = firstValue(leg, [
    'predictionStatus', 'pickStatus', 'selectionStatus', 'predictionState',
  ]);
  if (explicit !== undefined && explicit !== null && String(explicit).trim()) {
    return text(explicit).toUpperCase();
  }

  const generic = text(leg.status, '').toUpperCase();
  if (generic && !SETTLEMENT_STATES.has(generic)) return generic;
  return 'ACTIVE';
}

function aggregateStatus(legs: ApiRecord[], resolver: (leg: ApiRecord) => string): string {
  const values = [...new Set(legs.map(resolver).filter(Boolean))];
  if (!values.length) return '—';
  return values.length === 1 ? values[0] : 'MIXED';
}

function groupTicketLegs(legs: ApiRecord[]): Array<{ key: string; eventId: string; legs: ApiRecord[] }> {
  const groups = new Map<string, { key: string; eventId: string; legs: ApiRecord[] }>();

  legs.forEach((leg, index) => {
    const eventId = ticketLegEventId(leg);
    const eventName = text(firstValue(leg, ['eventName', 'matchName', 'fixtureName'])).trim().toLowerCase();
    const key = eventId || eventName || `unmatched-${index}`;
    const current = groups.get(key);
    if (current) current.legs.push(leg);
    else groups.set(key, { key, eventId, legs: [leg] });
  });

  return [...groups.values()];
}

function statusTone(status: string): string {
  const key = status.toUpperCase();
  if (/LIVE|IN.?PLAY/.test(key)) return 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400';
  if (/FINISHED|COMPLETED|FULL.?TIME/.test(key)) return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
  if (/POSTPON|CANCEL|ABANDON/.test(key)) return 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400';
  return 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-400';
}

function leagueNameOf(leg: ApiRecord, fixture: ApiRecord, presentation?: MatchPresentation): string {
  const league = asRecord(firstValue(leg, ['league', 'competition']))
    ?? asRecord(firstValue(fixture, ['league', 'competition']))
    ?? {};
  return resolveLeagueDisplayName(
    presentation?.leagueName,
    firstValue(leg, ['leagueName', 'competitionName', 'leagueDisplayName']),
    firstValue(league, ['displayName', 'fullName', 'name', 'leagueName']),
    firstValue(fixture, ['leagueName', 'competitionName']),
  );
}

function MatchTicketCard({
  legs,
  presentations,
}: {
  legs: ApiRecord[];
  presentations: Map<string, MatchPresentation>;
}) {
  const firstLeg = legs[0] ?? {};
  const nestedFixture = asRecord(firstValue(firstLeg, ['fixture', 'event', 'match'])) ?? {};
  const fixture: ApiRecord = { ...nestedFixture, ...firstLeg };
  const eventId = ticketLegEventId(firstLeg);
  const presentation = eventId ? presentations.get(eventId) : undefined;

  const homeName = resolveTeamDisplayName(presentation?.homeTeamName, firstValue(firstLeg, ['homeTeamName', 'homeName']), fixtureTeamName(fixture, 'home'));
  const awayName = resolveTeamDisplayName(presentation?.awayTeamName, firstValue(firstLeg, ['awayTeamName', 'awayName']), fixtureTeamName(fixture, 'away'));

  const homeLogo = [
    ...fixtureTeamLogoSources(fixture, 'home', presentation),
    ...fixtureTeamLogoSources(nestedFixture, 'home', presentation),
    ...logoUrlsOf(firstValue(firstLeg, ['homeTeamLogo', 'homeLogo', 'homeTeamLogos', 'homeBadge'])),
  ];
  const awayLogo = [
    ...fixtureTeamLogoSources(fixture, 'away', presentation),
    ...fixtureTeamLogoSources(nestedFixture, 'away', presentation),
    ...logoUrlsOf(firstValue(firstLeg, ['awayTeamLogo', 'awayLogo', 'awayTeamLogos', 'awayBadge'])),
  ];

  const leagueName = leagueNameOf(firstLeg, fixture, presentation);
  const league = asRecord(firstValue(firstLeg, ['league', 'competition']))
    ?? asRecord(firstValue(fixture, ['league', 'competition']))
    ?? {};
  const leagueLogo = [
    ...fixtureLeagueLogoSources(fixture, presentation),
    ...fixtureLeagueLogoSources(nestedFixture, presentation),
    ...logoUrlsOf([
      firstValue(firstLeg, ['leagueLogo', 'competitionLogo', 'leagueBadge']),
      firstValue(league, ['logo', 'logos', 'leagueLogo', 'crest', 'emblem', 'badge']),
    ]),
  ];

  const matchStatus = resolveStatus(fixture, presentation);
  const live = matchStatus === 'LIVE' || matchStatus === 'IN_PLAY';
  const kickoff = ticketLegFixtureDate(firstLeg);
  const time = live && presentation?.displayClock
    ? presentation.displayClock
    : kickoff ? timeLabel(kickoff) : '—';
  const prediction = aggregateStatus(legs, predictionStatus);
  const settlement = aggregateStatus(legs, settlementStatus);
  const scoreAvailable = presentation?.homeScore !== null && presentation?.homeScore !== undefined
    && presentation?.awayScore !== null && presentation?.awayScore !== undefined;
  const homeScore = scoreAvailable ? presentation?.homeScore : firstValue(fixture, ['homeScore', 'homeTeamScore']);
  const awayScore = scoreAvailable ? presentation?.awayScore : firstValue(fixture, ['awayScore', 'awayTeamScore']);
  const score = homeScore !== undefined && homeScore !== null && awayScore !== undefined && awayScore !== null
    ? `${homeScore} : ${awayScore}`
    : 'VS';

  return (
    <article className="min-w-0 overflow-hidden rounded-md border border-border/65 bg-background/55">
      <header className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 border-b border-border/55 bg-muted/20 px-1.5 py-1">
        <BetLabLogo src={leagueLogo} name={leagueName} sizeClassName="h-3.5 w-3.5" shape="rounded" />
        <span className="max-w-[36%] truncate text-[8px] font-extrabold text-foreground/85" title={`${leagueName}${presentation?.leagueCountry ? ` · ${presentation.leagueCountry}` : ''}`}>{leagueName}{presentation?.leagueCountry ? <span className="ml-1 font-normal opacity-70">· {presentation.leagueCountry}</span> : null}</span>
        <span className={`rounded border px-1 py-0.5 text-[7px] font-extrabold uppercase ${statusTone(matchStatus)}`}>
          {statusLabel(matchStatus, presentation)}
        </span>
        <span className="text-[7px] font-bold tabular-nums text-muted-foreground">{time}</span>
        <span className="ml-auto inline-flex items-center gap-1 text-[7px] font-bold text-primary">
          PRED <span className="rounded bg-primary/10 px-1 py-0.5">{prediction.replace(/_/g, ' ')}</span>
        </span>
        <span className="inline-flex items-center gap-1 text-[7px] font-bold text-muted-foreground">
          SETTLE <span className={`rounded px-1 py-0.5 ${ticketStatusTone(settlement)}`}>{settlement.replace(/_/g, ' ')}</span>
        </span>
      </header>

      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 px-1.5 py-1">
        <div className="flex min-w-0 max-w-full items-center gap-1">
          <BetLabLogo src={homeLogo} name={homeName} sizeClassName="h-4 w-4" eager />
          <span className="max-w-[76px] truncate text-[8px] font-extrabold text-primary sm:max-w-[105px]" title={homeName}>{homeName}</span>
          <strong className="shrink-0 rounded bg-muted/70 px-1 py-0.5 text-[8px] font-black tabular-nums">{score}</strong>
          <span className="max-w-[76px] truncate text-[8px] font-extrabold text-sky-600 dark:text-sky-400 sm:max-w-[105px]" title={awayName}>{awayName}</span>
          <BetLabLogo src={awayLogo} name={awayName} sizeClassName="h-4 w-4" eager />
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          {legs.map((leg, index) => {
            const market = asRecord(firstValue(leg, ['market']));
            const selection = asRecord(firstValue(leg, ['selection', 'outcome']));
            const marketName = text(
              firstValue(leg, ['marketName', 'marketFullName', 'marketTitle']),
              text(firstValue(market ?? {}, ['fullName', 'name', 'code']), 'Market'),
            );
            const selectionName = text(
              firstValue(leg, ['selectionName', 'outcomeName', 'selectedOutcome', 'selectionLabel']),
              text(firstValue(selection ?? {}, ['fullName', 'name', 'code']), text(leg.selectionCode, 'Selection')),
            );
            const odds = numeric(firstValue(leg, ['decimalOdds', 'odds', 'price']), 0);
            const legSettlement = settlementStatus(leg);

            return (
              <div key={text(firstValue(leg, ['_id', 'id']), `${eventId || 'match'}-selection-${index}`)} className="inline-flex min-w-0 max-w-full items-center gap-1 rounded border border-border/55 bg-card/75 px-1 py-0.5">
                <span className="max-w-[72px] truncate text-[7px] font-semibold text-muted-foreground" title={marketName}>{marketName}</span>
                <span className="text-[7px] text-muted-foreground/50">:</span>
                <span className="max-w-[92px] truncate text-[8px] font-bold" title={selectionName}>{selectionName}</span>
                <strong className="shrink-0 text-[8px] font-black tabular-nums text-sky-600 dark:text-sky-400">{odds > 0 ? odds.toFixed(2) : '—'}</strong>
                <span className={`shrink-0 rounded px-0.5 text-[6px] font-extrabold uppercase ${ticketStatusTone(legSettlement)}`}>
                  {legSettlement === 'PENDING' ? 'PEND' : legSettlement.replace(/_/g, ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

export default function BetLabTicketCard({ ticket, index, presentations, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const legs = useMemo(
    () => rowsFrom(ticket.legs).map((leg) => asRecord(leg)).filter((leg): leg is ApiRecord => Boolean(leg)),
    [ticket.legs],
  );
  const matches = useMemo(() => groupTicketLegs(legs), [legs]);
  const id = text(firstValue(ticket, ['_id', 'ticketId', 'id']), `ticket-${index}`);
  const number = text(firstValue(ticket, ['ticketNumber', 'reference', 'ticketRef']), `Ticket ${index + 1}`);
  const status = text(ticket.status, 'OPEN').toUpperCase();
  const settledLegs = legs.filter((leg) => SETTLEMENT_STATES.has(settlementStatus(leg))).length;
  const stake = numeric(firstValue(ticket, ['stake', 'stakeAmount']), 0);
  const potentialReturn = numeric(firstValue(ticket, ['potentialReturn', 'potentialWin', 'possibleReturn']), 0);
  const settledReturn = numeric(firstValue(ticket, ['settledGrossReturn', 'actualReturn', 'settledReturn']), 0);
  const combinedOdds = numeric(firstValue(ticket, ['combinedOdds', 'totalOdds']), 0);
  const placedAt = firstValue(ticket, ['placedAt', 'createdAt', 'datePlaced']);

  return (
    <article className="overflow-hidden rounded-md border border-border/75 bg-card shadow-sm">
      <div className="flex min-w-0 items-center justify-between gap-2 border-b border-border/60 px-2 py-1.5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h2 className="text-[10px] font-extrabold">{number}</h2>
            <span className={`rounded px-1.5 py-0.5 text-[7px] font-extrabold uppercase ${ticketStatusTone(status)}`}>{status.replace(/_/g, ' ')}</span>
            <span className="text-[7px] text-muted-foreground">{formatDate(placedAt)}</span>
            <span className="text-[7px] font-semibold text-muted-foreground">{legs.length} pick{legs.length === 1 ? '' : 's'} · {matches.length} match{matches.length === 1 ? '' : 'es'}</span>
          </div>
        </div>
        <button type="button" onClick={() => setExpanded((current) => !current)} aria-expanded={expanded} className="inline-flex h-6 shrink-0 items-center gap-1 rounded border border-border px-1.5 text-[7px] font-bold transition hover:bg-muted">
          {expanded ? 'Hide' : 'Details'}
          {expanded ? <FaChevronUp className="h-2.5 w-2.5" /> : <FaChevronDown className="h-2.5 w-2.5" />}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-1 border-b border-border/60 px-2 py-1.5">
        <div className="min-w-0"><p className="text-[7px] text-muted-foreground">Stake</p><p className="truncate text-[9px] font-black tabular-nums">{formatPoints(stake)}</p></div>
        <div className="min-w-0"><p className="text-[7px] text-muted-foreground">Total odds</p><p className="truncate text-[9px] font-black tabular-nums text-sky-600 dark:text-sky-400">{combinedOdds > 0 ? combinedOdds.toFixed(2) : '—'}</p></div>
        <div className="min-w-0"><p className="text-[7px] text-muted-foreground">Potential return</p><p className="truncate text-[9px] font-black tabular-nums text-emerald-600 dark:text-emerald-400">{formatPoints(potentialReturn)}</p></div>
        <div className="min-w-0"><p className="text-[7px] text-muted-foreground">Settled</p><p className="truncate text-[9px] font-black tabular-nums">{settledLegs}/{legs.length}</p></div>
      </div>

      {expanded ? (
        <div className="space-y-1 p-1">
          {matches.length ? (
            <div className="grid grid-cols-1 gap-1 lg:grid-cols-2">
              {matches.map((match) => (
                <MatchTicketCard
                  key={match.key}
                  legs={match.legs}
                  presentations={presentations}
                />
              ))}
            </div>
          ) : (
            <div className="rounded border border-dashed border-border px-2 py-3 text-center text-[8px] text-muted-foreground">No selection details were returned for this ticket.</div>
          )}

          {status !== 'OPEN' && settledReturn > 0 ? (
            <div className="flex items-center justify-between rounded border border-emerald-500/15 bg-emerald-500/[0.07] px-2 py-1 text-[8px]">
              <span className="text-muted-foreground">Settled return</span>
              <strong className="font-black text-emerald-600 dark:text-emerald-400">{formatPoints(settledReturn)}</strong>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-2 border-t border-border/60 px-2 py-1 text-[7px] text-muted-foreground">
        <span>{settledLegs === legs.length && legs.length ? 'All selections settled' : 'Settlement updates automatically'}</span>
        {ticket.settledAt
          ? <span>Settled {formatDate(ticket.settledAt)}</span>
          : <span className="inline-flex items-center gap-1"><FaFutbol className="h-2 w-2" /> Live tracking</span>}
      </div>
    </article>
  );
}

