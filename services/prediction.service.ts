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
// PREDICTION RESPONSE
// ========================================

export interface PredictionDetails {
  date?: any;
  match?: any;
  venue?: any;

  homeScore?: number;
  awayScore?: number;

  _id: string;
  id?: string;

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

// ========================================
// CREATE
// ========================================

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

export const createPrediction = async (
  payload: CreatePredictionPayload,
) => {
  const res = await api.post(
    '/predictions',
    payload,
  );

  return res.data;
};

// ========================================
// GET ALL
// ADMIN / TABLE VIEW
// ========================================

export const getPredictions = async () => {
  const res = await api.get('/predictions');

  return res.data;
};

// ========================================
// GET SETTLED WINS
// PUBLIC
// ========================================
//
// Used by the homepage "Our Wins" section.
//
// Endpoint:
// GET /predictions/settled-wins
//
// No JWT required.
// Returns only:
// - won predictions
// - settled predictions
// - non-deleted predictions
//
// Includes prediction + probabilities.
// ========================================
export const getSettledWins = async (): Promise<
  PredictionDetails[]
> => {
  const res = await api.get('/predictions/settled-wins');

  return Array.isArray(res.data)
    ? res.data
    : [];
};

// ========================================
// GET ONE
// ADMIN RAW
// ========================================

export const getPrediction = async (
  id: string,
) => {
  const res = await api.get(
    `/predictions/${id}`,
  );

  return res.data;
};

// ========================================
// GET USER ACCESS VIEW
// ========================================

export const getPredictionAccess = async (
  id: string,
): Promise<PredictionDetails> => {
  const res = await api.get(
    `/predictions/user/${id}`,
  );

  return res.data;
};

// ========================================
// UPDATE
// ========================================

export const updatePrediction = async (
  id: string,
  payload: any,
) => {
  const res = await api.patch(
    `/predictions/${id}`,
    payload,
  );

  return res.data;
};

// ========================================
// DELETE
// ========================================

export const deletePrediction = async (
  id: string,
) => {
  const res = await api.delete(
    `/predictions/${id}`,
  );

  return res.data;
};

// ========================================
// SETTLE
// ADMIN
// ========================================

export const settlePrediction = async (
  id: string,
  actualResult: PredictionResult | 'VOID',
) => {
  const res = await api.post(
    `/settlement/${id}`,
    {
      result: actualResult,
    },
  );

  return res.data;
};