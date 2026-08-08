import { useQuery } from '@tanstack/react-query';

import {
  getLivescoreLeagues,
  getLeaguePage,
} from '@/services/livescore.service';



export function useLivescoreLeagues(){

  return useQuery({

    queryKey:[
      'livescore-leagues'
    ],

    queryFn:
      getLivescoreLeagues,

    staleTime:
      1000 * 60 * 60,

  });

}



export function useLeagueLivescore(
  leagueCode:string
){

  return useQuery({

    queryKey:[
      'league-livescore',
      leagueCode,
    ],

    queryFn:
      ()=>getLeaguePage(leagueCode),

    enabled:
      !!leagueCode,

    staleTime:
      1000 * 60 * 5,

    refetchInterval:
      1000 * 60 * 5,

  });

}