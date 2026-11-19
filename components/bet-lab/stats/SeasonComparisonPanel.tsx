'use client';

import { FaChartSimple } from 'react-icons/fa6';
import ComparisonMetricRow from './ComparisonMetricRow';
import type { TeamStatsProfile } from './stats.types';
import StatsTeamBadge from './StatsTeamBadge';

export default function SeasonComparisonPanel({ home, away }: { home: TeamStatsProfile; away: TeamStatsProfile }) {
  const rows: Array<{ label: string; home: number | null; away: number | null; lowerIsBetter?: boolean; decimals: number }> = [
    { label: 'League position', home: home.season.position, away: away.season.position, lowerIsBetter: true, decimals: 0 },
    { label: 'Played', home: home.season.played, away: away.season.played, decimals: 0 },
    { label: 'Wins', home: home.season.wins, away: away.season.wins, decimals: 0 },
    { label: 'Draws', home: home.season.draws, away: away.season.draws, decimals: 0 },
    { label: 'Losses', home: home.season.losses, away: away.season.losses, decimals: 0, lowerIsBetter: true },
    { label: 'Points', home: home.season.points, away: away.season.points, decimals: 0 },
    { label: 'Goals scored', home: home.season.goalsFor, away: away.season.goalsFor, decimals: 0 },
    { label: 'Goals conceded', home: home.season.goalsAgainst, away: away.season.goalsAgainst, decimals: 0, lowerIsBetter: true },
    { label: 'Goal difference', home: home.season.goalDifference, away: away.season.goalDifference, decimals: 0 },
    { label: 'Points per game', home: home.season.pointsPerGame, away: away.season.pointsPerGame, decimals: 2 },
    { label: 'Goals per game', home: home.season.goalsForPerGame, away: away.season.goalsForPerGame, decimals: 2 },
  ];
  const available = rows.filter((row) => row.home !== null || row.away !== null);

  return (
    <section className="rounded-lg border border-border/70 bg-card p-2.5">
      <div className="mb-2 flex items-center gap-1.5">
        <FaChartSimple className="h-2.5 w-2.5 text-primary" />
        <h3 className="text-[10px] font-extrabold">Season performance</h3>
      </div>
      <div className="mb-1 grid grid-cols-2 items-center gap-2 border-b border-border/60 pb-1.5">
        <StatsTeamBadge team={home} compact />
        <StatsTeamBadge team={away} compact align="right" />
      </div>
      {available.length ? available.map((row) => (
        <ComparisonMetricRow key={row.label} label={row.label} home={row.home} away={row.away} decimals={row.decimals} lowerIsBetter={row.lowerIsBetter} compact />
      )) : <div className="py-5 text-center text-[8px] text-muted-foreground">No season table data available.</div>}
    </section>
  );
}

