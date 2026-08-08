import type {
  AdminPrediction,
} from '@/types/prediction.types';





export type MatchDisplayStatus =
  | 'Upcoming'
  | 'In Play'
  | 'Needs Settlement'
  | 'Settled';





export function getMatchStatus(
  prediction: AdminPrediction,
): MatchDisplayStatus {


  const now =
    new Date();



  const matchTime =
    new Date(
      prediction.matchDate,
    );



  const settlementTime =
    new Date(
      matchTime.getTime()
      +
      2 * 60 * 60 * 1000,
    );



  if (
    prediction.settled
  ) {

    return 'Settled';

  }





  if (
    now < matchTime
  ) {

    return 'Upcoming';

  }





  if (
    now >= matchTime &&
    now <= settlementTime
  ) {

    return 'In Play';

  }





  return 'Needs Settlement';

}








export function getPredictionLabel(
  prediction: AdminPrediction,
) {


  switch(
    prediction.prediction
  ){

    case 'HOME':

      return `${prediction.homeTeam} to Win`;



    case 'AWAY':

      return `${prediction.awayTeam} to Win`;



    case 'DRAW':

      return 'Draw';



    default:

      return '-';

  }

}








export function formatPredictionDate(
  date:string,
) {


  return new Date(
    date,
  ).toLocaleString(
    undefined,
    {
      dateStyle:'medium',
      timeStyle:'short',
    },
  );

}