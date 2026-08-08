import { LeaguePage, League } from '@/types/livescore';


const API =
  process.env.NEXT_PUBLIC_API_URL;



export async function getLivescoreLeagues(){

  const res =
    await fetch(
      `${API}/livescore/leagues`,
      {
        cache:'no-store'
      }
    );


  if(!res.ok){
    throw new Error(
      'Failed loading leagues'
    );
  }


  return res.json() as Promise<League[]>;
}



export async function getLeaguePage(
  code:string
){

  const res =
    await fetch(
      `${API}/livescore/${code}`,
      {
        cache:'no-store'
      }
    );


  if(!res.ok){
    throw new Error(
      'Failed loading league'
    );
  }


  return res.json() as Promise<LeaguePage>;

}