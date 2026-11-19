'use client';

import type { TeamStatsProfile } from './stats.types';
import BetLabLogo from '../BetLabLogo';

export default function StatsTeamBadge({ team, align = 'left', compact = false }: {
  team: Pick<TeamStatsProfile, 'name' | 'logo'>;
  align?: 'left' | 'right' | 'center';
  compact?: boolean;
}) {
  const size = compact ? 'h-6 w-6' : 'h-7 w-7 sm:h-8 sm:w-8';
  return (
    <div className={`flex min-w-0 items-center gap-1.5 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : ''}`}>
      <BetLabLogo src={team.logo} name={team.name} sizeClassName={size} eager />
      <span className={`min-w-0 truncate font-extrabold ${compact ? 'text-[8px] sm:text-[9px]' : 'text-[9px] sm:text-[10px]'}`}>{team.name}</span>
    </div>
  );
}

