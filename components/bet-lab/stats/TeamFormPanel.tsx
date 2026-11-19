'use client';

import { FaArrowRight } from 'react-icons/fa6';
import ComparisonMetricRow from './ComparisonMetricRow';
import StatsTeamBadge from './StatsTeamBadge';
import { resultTone, shortDate } from './fixture-stats.utils';
import BetLabLogo from '../BetLabLogo';
import type { RecentGame, TeamStatsProfile } from './stats.types';

function FormDots({ results }: { results: TeamStatsProfile['recentForm'] }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => {
        const result = results[index] ?? '—';
        const label = result === 'W' ? 'Won' : result === 'D' ? 'Draw' : result === 'L' ? 'Lost' : 'No result';
        return <span key={`${index}-${result}`} title={label} aria-label={label} className={`flex h-4 w-4 items-center justify-center rounded border text-[7px] font-black ${resultTone(result)}`}>{result}</span>;
      })}
    </div>
  );
}

function RecentGameRow({ game }: { game: RecentGame }) {
  return (
    <div className="flex min-w-0 items-center gap-1 rounded border border-border/50 bg-background/55 px-1.5 py-1">
      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[7px] font-black ${resultTone(game.result)}`}>{game.result}</span>
      <span className="w-9 shrink-0 text-[7px] tabular-nums text-muted-foreground">{shortDate(game.date)}</span>
      <span className="flex min-w-0 flex-1 items-center gap-1">
        <BetLabLogo src={game.opponentLogo} name={game.opponent} sizeClassName="h-3.5 w-3.5" />
        <span className="min-w-0 truncate text-[8px] font-medium">{game.opponent}</span>
      </span>
      <strong className="shrink-0 text-[8px] font-black tabular-nums">{game.score}</strong>
      <FaArrowRight className="h-2 w-2 shrink-0 text-muted-foreground/40" />
    </div>
  );
}

export default function TeamFormPanel({ home, away, compact = false }: {
  home: TeamStatsProfile;
  away: TeamStatsProfile;
  compact?: boolean;
}) {
  return (
    <section className="rounded-lg border border-border/70 bg-card p-2.5">
      <h3 className="mb-2 text-[10px] font-extrabold">Recent form</h3>
      <div className="space-y-1.5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1.5">
          <StatsTeamBadge team={home} compact />
          <FormDots results={home.recentForm} />
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1.5">
          <StatsTeamBadge team={away} compact />
          <FormDots results={away.recentForm} />
        </div>
      </div>

      {!compact ? (
        <>
          <div className="mt-2 border-t border-border/60 pt-1">
            <ComparisonMetricRow label="Points earned" home={home.recentPoints} away={away.recentPoints} decimals={0} compact />
            <ComparisonMetricRow label="Goals scored" home={home.recentGoalsFor} away={away.recentGoalsFor} decimals={0} compact />
            <ComparisonMetricRow label="Goals conceded" home={home.recentGoalsAgainst} away={away.recentGoalsAgainst} decimals={0} lowerIsBetter compact />
            <ComparisonMetricRow label="Clean sheets" home={home.cleanSheets} away={away.cleanSheets} decimals={0} compact />
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="min-w-0 space-y-1">
              <div className="mb-0.5"><StatsTeamBadge team={home} compact /></div>
              {home.recentGames.length ? home.recentGames.map((game) => <RecentGameRow key={game.id} game={game} />) : <p className="rounded-md bg-muted/50 px-2 py-2 text-[8px] text-muted-foreground">No recent results</p>}
            </div>
            <div className="min-w-0 space-y-1">
              <div className="mb-0.5 flex justify-end"><StatsTeamBadge team={away} compact align="right" /></div>
              {away.recentGames.length ? away.recentGames.map((game) => <RecentGameRow key={game.id} game={game} />) : <p className="rounded-md bg-muted/50 px-2 py-2 text-[8px] text-muted-foreground">No recent results</p>}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

