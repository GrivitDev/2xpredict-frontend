export interface PredictionAccess {
  _id: string;

  homeTeam: string;
  awayTeam: string;

  leagueCode: string;

  matchDate: string;

  status: string;

  accessType: 'free' | 'regular' | 'vip';

  price: number;

  preview: {
    prediction: string;
    confidence: number;
  };

  access: {
    allowed: boolean;
    state: 'full' | 'locked';
    purchased: boolean;
    message?: string;
  };

  data: {
    probabilities?: {
      home: number;
      draw: number;
      away: number;
    } | null;

    markets?:
      | {
          market: string;
          selection?: string;
        }[]
      | null;
  } | null;
}

