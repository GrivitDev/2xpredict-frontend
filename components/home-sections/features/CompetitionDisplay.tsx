'use client';

import type {
  CompetitionStandingsResponse,
  League,
} from '@/services/sports.service';

import CupCompetition from './CupCompetition';
import LeagueTable from './LeagueTable';

interface Props {
  league: League;
  competition: CompetitionStandingsResponse;
  search?: string;
  pointsFilter?: string;
}

export default function CompetitionDisplay({
  league,
  competition,
  search = '',
  pointsFilter = '',
}: Props) {
  const query = search.trim().toLowerCase();
  const minPoints = Number(pointsFilter) || 0;

  const filteredTable =
    competition.table?.filter(({ team, points }) => {
      if (query && !team.toLowerCase().includes(query)) {
        return false;
      }

      return !pointsFilter || points >= minPoints;
    }) ?? [];

  const competitionType =
    competition.type ??
    league.type ??
    'LEAGUE';

  return competitionType === 'LEAGUE' ? (
    <LeagueTable table={filteredTable} />
  ) : (
    <CupCompetition competition={competition} />
  );
}