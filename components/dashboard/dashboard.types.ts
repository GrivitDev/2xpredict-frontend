export type PredictionItem = {
  _id?: string;

  homeTeam?: string;
  awayTeam?: string;

  homeTeamBadge?: string;
  awayTeamBadge?: string;

  league?: {
    code?: string;
    name?: string;
    country?: string;
    emblem?: string;
  };

  matchDate?: string;

  confidence?: number;

  status?: string;
};

export type PromoItem = {
  [x: string]: any;
  rewardType: string;
  rewardAmount: any;
  rewardPlan: string;
  _id?: string;
  name?: string;
  description?: string;
  endDate?: string | Date | null;
};

export type TrackRecordItem = {
  _id?: string;
  match?: string;
  title?: string;
  result?: string;
  wonAt?: string | Date | null;
  market?: string;
};