'use client';

import type {
  CompetitionStandingsResponse,
  League,
} from '@/services/sports.service';

import LeagueTable from './LeagueTable';
import CupCompetition from './CupCompetition';


// ============================================================
// TYPES
// ============================================================

interface Props {

  league: League;

  competition: CompetitionStandingsResponse;

  search?: string;

  pointsFilter?: string;

}


// ============================================================
// COMPONENT
// ============================================================

export default function CompetitionDisplay({
  league,
  competition,
  search = '',
  pointsFilter = '',
}: Props) {


  // ==========================================================
  // LEAGUE FILTERING
  // ==========================================================

  const filteredTable =
    competition.table?.filter(
      team => {

        const query =
          search
            .trim()
            .toLowerCase();


        if (
          query &&
          !team.team
            .toLowerCase()
            .includes(query)
        ) {

          return false;

        }


        if (
          pointsFilter &&
          team.points <
            Number(pointsFilter)
        ) {

          return false;

        }


        return true;

      },
    ) ?? [];


  // ==========================================================
  // COMPETITION TYPE
  // ==========================================================

  const competitionType =
    competition.type ||
    league.type ||
    'LEAGUE';


  // ==========================================================
  // LEAGUE
  // ==========================================================

  if (
    competitionType ===
    'LEAGUE'
  ) {

    return (

      <LeagueTable
        table={
          filteredTable
        }
      />

    );

  }


  // ==========================================================
  // CUP / TOURNAMENT
  // ==========================================================

  return (

    <CupCompetition
      competition={
        competition
      }
    />

  );

}