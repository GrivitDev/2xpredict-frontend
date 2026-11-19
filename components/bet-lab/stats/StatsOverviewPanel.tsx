'use client';

import AttackDefensePanel from './AttackDefensePanel';
import TeamFormPanel from './TeamFormPanel';
import TeamStrengthPanel from './TeamStrengthPanel';
import type { FixtureStatsModel } from './stats.types';

export default function StatsOverviewPanel({ stats }: { stats: FixtureStatsModel }) {
  return (
    <div className="space-y-1.5">
      <TeamStrengthPanel home={stats.home} away={stats.away} />
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        <TeamFormPanel home={stats.home} away={stats.away} compact />
        <AttackDefensePanel home={stats.home} away={stats.away} />
      </div>
    </div>
  );
}

