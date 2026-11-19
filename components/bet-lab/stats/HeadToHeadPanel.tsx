'use client';

import { FaClockRotateLeft } from 'react-icons/fa6';
import { resultTone, shortDate } from './fixture-stats.utils';
import type { FixtureStatsModel, HeadToHeadMatch } from './stats.types';
import BetLabLogo from '../BetLabLogo';

function H2HRow({ match }: { match: HeadToHeadMatch }) {
  return (
    <div className="rounded-md border border-border/55 bg-background/50 px-2 py-1.5">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-[7px] font-medium text-muted-foreground">{shortDate(match.date)}{match.competition ? ` · ${match.competition}` : ''}</span>
        <span className={`flex h-4 min-w-4 shrink-0 items-center justify-center rounded border px-1 text-[7px] font-black ${resultTone(match.homeResult)}`} title="Result for the current home team">{match.homeResult}</span>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5">
        <div className="flex min-w-0 items-center gap-1">
          <BetLabLogo src={match.matchHomeLogo} name={match.matchHomeName} sizeClassName="h-4 w-4" />
          <span className="min-w-0 truncate text-[8px] font-semibold">{match.matchHomeName}</span>
        </div>
        <strong className="whitespace-nowrap rounded bg-muted/55 px-1.5 py-0.5 text-[9px] font-black tabular-nums">{match.homeScore ?? '—'} – {match.awayScore ?? '—'}</strong>
        <div className="flex min-w-0 items-center justify-end gap-1">
          <span className="min-w-0 truncate text-right text-[8px] font-semibold">{match.matchAwayName}</span>
          <BetLabLogo src={match.matchAwayLogo} name={match.matchAwayName} sizeClassName="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export default function HeadToHeadPanel({ stats }: { stats: FixtureStatsModel }) {
  const { home, away, headToHeadSummary, headToHead } = stats;
  return (
    <section className="rounded-lg border border-border/70 bg-card p-2.5">
      <div className="mb-2 flex items-center gap-1.5">
        <FaClockRotateLeft className="h-2.5 w-2.5 text-primary" />
        <h3 className="text-[10px] font-extrabold">Last 5 meetings</h3>
      </div>
      {headToHead.length ? (
        <>
          <div className="mb-2 grid grid-cols-3 gap-1">
            <div className="rounded-md border border-primary/15 bg-primary/[0.07] px-1 py-1.5 text-center">
              <strong className="block text-sm font-black tabular-nums text-primary">{headToHeadSummary.homeWins}</strong>
              <span className="mx-auto inline-flex max-w-full items-center justify-center gap-1 text-[7px] font-bold text-muted-foreground">
                <BetLabLogo src={home.logo} name={home.name} sizeClassName="h-3 w-3" />
                <span className="truncate">{home.name} wins</span>
              </span>
            </div>
            <div className="rounded-md border border-amber-500/15 bg-amber-500/[0.07] px-1 py-1.5 text-center">
              <strong className="block text-sm font-black tabular-nums text-amber-600 dark:text-amber-400">{headToHeadSummary.draws}</strong>
              <span className="block truncate text-[7px] font-bold text-muted-foreground">Draws</span>
            </div>
            <div className="rounded-md border border-sky-500/15 bg-sky-500/[0.08] px-1 py-1.5 text-center">
              <strong className="block text-sm font-black tabular-nums text-sky-600 dark:text-sky-400">{headToHeadSummary.awayWins}</strong>
              <span className="mx-auto inline-flex max-w-full items-center justify-center gap-1 text-[7px] font-bold text-muted-foreground">
                <BetLabLogo src={away.logo} name={away.name} sizeClassName="h-3 w-3" />
                <span className="truncate">{away.name} wins</span>
              </span>
            </div>
          </div>
          <div className="space-y-1">{headToHead.map((match) => <H2HRow key={`${match.id}-${match.date ?? ''}`} match={match} />)}</div>
        </>
      ) : (
        <div className="rounded-md border border-dashed border-border/70 px-3 py-4 text-center">
          <FaClockRotateLeft className="mx-auto h-3.5 w-3.5 text-muted-foreground/50" />
          <p className="mt-1.5 text-[8px] font-semibold text-muted-foreground">No previous meetings found</p>
        </div>
      )}
    </section>
  );
}

