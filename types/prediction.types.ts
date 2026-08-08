export interface AdminPrediction {


  _id:string;


  matchId:string;


  homeTeam:string;

  awayTeam:string;



  homeTeamBadge?:string;

  awayTeamBadge?:string;




  league?:{

    code:string;

    name:string;

    country:string;

    emblem?:string;

  };



  leagueCode:string;



  matchDate:string;



  prediction:
    | 'HOME'
    | 'DRAW'
    | 'AWAY';




  probabilities:{

    home:number;

    draw:number;

    away:number;

  };




  markets:{

    market:string;

    selection?:string;

  }[];





  confidence:number;




  accessType:
    | 'free'
    | 'regular'
    | 'vip';




  price:number;





  status:
    | 'pending'
    | 'won'
    | 'lost'
    | 'void';




  settled:boolean;



  deleted:boolean;



  settledAt?:string | null;



  createdAt?:string;

  updatedAt?:string;

}