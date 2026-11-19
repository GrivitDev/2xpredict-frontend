'use client';

import { FaChartSimple, FaFutbol } from 'react-icons/fa6';
import ComparisonMetricRow from './ComparisonMetricRow';
import type { TeamStatsProfile } from './stats.types';

function recentAverage(total: number | null, team: TeamStatsProfile, key: 'goalsFor' | 'goalsAgainst'): number | null {
  if (total === null) return null;
  const matches = team.recentGames.filter((game) => game[key] !== null).length;
  return matches ? total / matches : null;
}

function scoringRate(team: TeamStatsProfile): number | null {
  const matches = team.recentGames.filter((game) => game.goalsFor !== null);
  if (!matches.length) return null;
  return (matches.filter((game) => (game.goalsFor ?? 0) > 0).length / matches.length) * 100;
}

function cleanSheetRate(team: TeamStatsProfile): number | null {
  const matches = team.recentGames.filter((game) => game.goalsAgainst !== null).length;
  if (!matches || team.cleanSheets === null) return null;
  return (team.cleanSheets / matches) * 100;
}

export default function AttackDefensePanel({ home, away }: { home: TeamStatsProfile; away: TeamStatsProfile }) {
  const homeScored = home.season.goalsForPerGame ?? recentAverage(home.recentGoalsFor, home, 'goalsFor');
  const awayScored = away.season.goalsForPerGame ?? recentAverage(away.recentGoalsFor, away, 'goalsFor');
  const homeConceded = home.season.goalsAgainstPerGame ?? recentAverage(home.recentGoalsAgainst, home, 'goalsAgainst');
  const awayConceded = away.season.goalsAgainstPerGame ?? recentAverage(away.recentGoalsAgainst, away, 'goalsAgainst');

  return (
    <section className="rounded-lg border border-border/70 bg-card p-2.5">
      <div className="mb-1 flex items-center gap-1.5 text-[8px] font-extrabold uppercase tracking-wide text-primary"><FaFutbol className="h-2.5 w-2.5" /> Attack</div>
      <ComparisonMetricRow label="Goals per match" home={homeScored} away={awayScored} compact />
      <ComparisonMetricRow label="Scoring rate" home={scoringRate(home)} away={scoringRate(away)} suffix="%" decimals={0} compact />
      <div className="mb-1 mt-2 flex items-center gap-1.5 text-[8px] font-extrabold uppercase tracking-wide text-sky-600 dark:text-sky-400"><FaChartSimple className="h-2.5 w-2.5" /> Defence</div>
      <ComparisonMetricRow label="Conceded per match" home={homeConceded} away={awayConceded} lowerIsBetter compact />
      <ComparisonMetricRow label="Clean-sheet rate" home={cleanSheetRate(home)} away={cleanSheetRate(away)} suffix="%" decimals={0} compact />
    </section>
  );
}

