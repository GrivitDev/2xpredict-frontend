import api from '@/lib/axios';

// ========================================
// SHARED TYPES
// ========================================

export type PredictionResult =
  | 'HOME'
  | 'DRAW'
  | 'AWAY';

export type PredictionStatus =
  | 'pending'
  | 'won'
  | 'lost'
  | 'void';

export type PredictionPlan =
  | 'free'
  | 'regular'
  | 'vip';

export type PredictionAccessState =
  | 'subscription'
  | 'purchased'
  | 'locked'
  | 'upgrade_required'
  | 'login_required';

export interface LeagueInfo {
  code: string;
  name: string;
  country: string;
  emblem?: string;
}

export interface PredictionProbability {
  home: number;
  draw: number;
  away: number;
}

export interface PredictionMarket {
  market: string;
  selection?: string;
}

// ========================================
// USER PREDICTION RESPONSE
// ========================================

export interface PredictionDetails {
  [x: string]: any;
  id: string;

  matchId: string;

  homeTeam: string;
  awayTeam: string;

  homeTeamBadge?: string;
  awayTeamBadge?: string;

  leagueCode: string;
  league?: LeagueInfo;

  matchDate: string;

  kickoffTimestamp: number;

  status: PredictionStatus;

  accessType: PredictionPlan;

  price: number;

  confidence: number;

  access: {
    allowed: boolean;

    state: PredictionAccessState;

    purchased: boolean;

    plan: PredictionPlan;

    released: boolean;

    releaseAt: number;

    message: string | null;
  };

  actions?: string[];

  data: {
    prediction?: PredictionResult;

    probabilities?: PredictionProbability | null;

    markets?: PredictionMarket[] | null;
  } | null;
}

export interface CreatePredictionPayload {

  matchId: string;

  leagueCode: string;


  league?: {
    code: string;
    name: string;
    country: string;
    emblem?: string;
  };


  homeTeam: string;

  awayTeam: string;


  homeTeamBadge?: string;

  awayTeamBadge?: string;


  confidence: number;


  probabilities: {
    home: number;
    draw: number;
    away: number;
  };


  markets: {
    market: string;
    selection?: string;
  }[];


  accessType:
    | 'free'
    | 'regular'
    | 'vip';


  price: number;


  matchDate: string;

}

export const createPrediction = async (payload: CreatePredictionPayload) => {
  const res = await api.post('/predictions', payload);
  return res.data;
};

// =========================
// GET ALL (TABLE VIEW)
// =========================
export const getPredictions = async () => {
  const res = await api.get('/predictions');
  return res.data;
};

// =========================
// GET ONE (ADMIN RAW)
// =========================
export const getPrediction = async (id: string) => {
  const res = await api.get(`/predictions/${id}`);
  return res.data;
};

// =========================
// GET USER ACCESS VIEW (IMPORTANT)
// =========================
export const getPredictionAccess = async (
  id: string,
): Promise<PredictionDetails> => {
  const res = await api.get(`/predictions/user/${id}`);
  return res.data;
};

export const updatePrediction = async (id: string, payload: any) => {
  const res = await api.patch(`/predictions/${id}`, payload);
  return res.data;
};

export const deletePrediction = async (id: string) => {
  const res = await api.delete(`/predictions/${id}`);
  return res.data;
};

export const settlePrediction = async (
  id: string,
  actualResult: PredictionResult | 'VOID',
) => {

  const res = await api.post(`/settlement/${id}`, {
    result: actualResult,
  });

  return res.data;
};